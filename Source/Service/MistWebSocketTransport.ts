/**
 * @module Service/MistWebSocketTransport
 * @description
 * Sky-side WebSocket transport for the Sky<->Cocoon direct path (B7-S6).
 * Replaces Mountain gRPC hop for extension-API traffic (~95% of IPC volume).
 *
 * Auth: secret as WebSocket subprotocol (new WebSocket(url, [secret])) or
 *       URL query param (?secret=<hex>).
 * Reconnect: exponential backoff 100ms->5s, dead after 30s.
 * RPC: every invoke() call has a per-call deadline (default 5s, hard ceiling
 *      15s); a silent peer rejects with MistTimeoutError and logs a warning.
 */

let _ws: WebSocket | null = null;

let _config: { port: number; secret: string } | null = null;

const _pending = new Map<number, (result: unknown, error?: string) => void>();

/** Method name per in-flight id, so a malformed reply can name its own call. */
const _methods = new Map<number, string>();

// --- Rate-limited malformed-reply warnings (D16-I3) -------------------------
const _ParseWarnWindowMs = 10_000;
const _ParseWarnLimit = 5;
let _ParseWarnStart = 0;
let _ParseWarnCount = 0;
let _ParseWarnSuppressed = 0;

/** Best-effort id recovery from a raw frame that failed `JSON.parse`. */
function _ExtractId(Raw: unknown): number | null {

	if (typeof Raw !== "string") return null;

	const Match = /"id"\s*:\s*(-?\d+)/.exec(Raw);

	if (!Match) return null;

	const Id = Number(Match[1]);

	return Number.isFinite(Id) ? Id : null;
}

/**
 * Warn about a malformed reply, at most `_ParseWarnLimit` times per window.
 * Degrades silently if logging is unavailable; never throws or reconnects.
 */
function _WarnMalformedReply(Raw: unknown, Method?: string, Id?: number | null): void {

	const Now = Date.now();

	if (Now - _ParseWarnStart >= _ParseWarnWindowMs) {

		if (_ParseWarnSuppressed > 0) {

			try {
				console.warn(`[MistWS] suppressed ${_ParseWarnSuppressed} malformed reply warning(s)`);
			} catch (_LoggingError) {}

			_ParseWarnSuppressed = 0;
		}

		_ParseWarnStart = Now;
		_ParseWarnCount = 0;
	}

	_ParseWarnCount++;

	if (_ParseWarnCount > _ParseWarnLimit) {
		_ParseWarnSuppressed++;
		return;
	}

	const MethodLabel = Method ?? "unknown";

	const IdLabel = Id === undefined || Id === null ? "unknown" : String(Id);

	const Preview = typeof Raw === "string" ? Raw.slice(0, 256) : "<non-string frame>";

	try {
		console.warn(`[MistWS] malformed reply dropped: method=${MethodLabel} id=${IdLabel} preview=${Preview}`);
	} catch (_LoggingError) {}
}

/** Per-call deadline handles, keyed by the same request id as `_pending`. */
const _timers = new Map<number, ReturnType<typeof setTimeout>>();

let _nextId = 1;

let _dead = false;

let _reconnectAttempts = 0;

let _reconnectStart = 0;

let _reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const _DeadAfterMs = 30_000;

/** Default per-call RPC deadline (ms) when `TimeoutMs` is omitted or invalid. */
const DEFAULT_TIMEOUT_MS = 5_000;

/** Hard upper bound on any per-call RPC deadline (ms); mirrors Vine's DefaultRequestTimeoutMs. */
const MAX_TIMEOUT_MS = 15_000;

const _BackoffSteps = [100, 200, 400, 1_000, 2_000, 5_000] as const;

const _Trace = (Tag: string, Message: string): void => {

	try {
		performance.mark(`land:${Tag}:${Message}`);
	} catch {}
};

function _BackoffMs(): number {

	const Idx = Math.min(_reconnectAttempts, _BackoffSteps.length - 1);

	return _BackoffSteps[Idx]!;
}

/** A per-call RPC deadline elapsed with no reply from the peer. */
export class MistTimeoutError extends Error {

	readonly Method: string;

	readonly Id: number;

	readonly TimeoutMs: number;

	constructor(Method: string, Id: number, TimeoutMs: number) {
		super(`MistWS: RPC '${Method}' (id ${Id}) timed out after ${TimeoutMs}ms`);
		this.name = "MistTimeoutError";
		this.Method = Method;
		this.Id = Id;
		this.TimeoutMs = TimeoutMs;
	}
}

/** Resolve the effective deadline, degrading invalid inputs to the documented default. */
function _ResolveTimeoutMs(TimeoutMs: number | undefined): number {

	if (TimeoutMs === undefined) return DEFAULT_TIMEOUT_MS;

	if (typeof TimeoutMs !== "number" || !Number.isFinite(TimeoutMs) || TimeoutMs <= 0) {
		console.warn(`[MistWS] invalid TimeoutMs (${String(TimeoutMs)}); using default ${DEFAULT_TIMEOUT_MS}ms`);

		return DEFAULT_TIMEOUT_MS;
	}

	if (TimeoutMs > MAX_TIMEOUT_MS) {
		console.warn(`[MistWS] TimeoutMs ${TimeoutMs}ms exceeds ceiling ${MAX_TIMEOUT_MS}ms; clamping`);

		return MAX_TIMEOUT_MS;
	}

	return TimeoutMs;
}

/** Clear and forget the deadline handle for one request, if any. */
function _ClearTimer(Id: number): void {

	const Timer = _timers.get(Id);

	if (Timer !== undefined) {
		clearTimeout(Timer);

		_timers.delete(Id);
	}
}

function _DrainPending(Reason: string): void {

	if (_pending.size > 0)
		console.warn(`[MistWS] draining ${_pending.size} pending call(s): ${Reason}`);

	for (const Id of [..._pending.keys()]) {

		_ClearTimer(Id);

		_methods.delete(Id);
	}

	for (const Fn of _pending.values()) Fn(undefined, Reason);

	_pending.clear();
}

function _Connect(): void {

	if (!_config || _dead) return;

	const { port, secret } = _config;

	const Url = `ws://127.0.0.1:${port}/?secret=${encodeURIComponent(secret)}`;

	try {
		const Ws = new WebSocket(Url, [secret]);

		Ws.onopen = () => {
			_ws = Ws;

			_reconnectAttempts = 0;

			_Trace("mist-ws", "connected");
		};

		Ws.onmessage = (Ev: MessageEvent<string>) => {

			const Raw = Ev.data;

			let Envelope: {
				id?: number;
				result?: unknown;
				error?: string;
			};

			try {
				Envelope = JSON.parse(Raw) as {
					id?: number;
					result?: unknown;
					error?: string;
				};
			} catch (_ParseError) {
				// Malformed reply: never silent, but rate-limited against a flood.
				const Id = _ExtractId(Raw);

				_WarnMalformedReply(Raw, Id === null ? undefined : _methods.get(Id), Id);

				return;
			}

			let DispatchId: number | null = null;

			let DispatchMethod: string | undefined = undefined;

			try {
				DispatchId = Envelope.id ?? null;

				if (DispatchId === null) return;

				const Fn = _pending.get(DispatchId);

				if (!Fn) return;

				DispatchMethod = _methods.get(DispatchId);

				_pending.delete(DispatchId);

				_methods.delete(DispatchId);

				_ClearTimer(DispatchId);

				if (Envelope.error !== undefined)

					Fn(undefined, String(Envelope.error));

				else Fn(Envelope.result ?? null);
			} catch (_DispatchError) {
				// A dispatch/callback fault keeps the socket alive; warn, no reconnect.
				_WarnMalformedReply(Raw, DispatchMethod, DispatchId);
			}
		};

		Ws.onclose = () => {
			_ws = null;

			_DrainPending("WebSocket connection closed");

			_ScheduleReconnect();
		};

		Ws.onerror = () => {};
	} catch {
		_ScheduleReconnect();
	}
}

function _ScheduleReconnect(): void {

	if (_dead || !_config) return;

	if (_reconnectAttempts === 0) _reconnectStart = Date.now();

	_reconnectAttempts++;

	if (Date.now() - _reconnectStart >= _DeadAfterMs) {
		_dead = true;

		_DrainPending("MistWS dead after 30s of failed reconnect");

		return;
	}

	_reconnectTimer = setTimeout(_Connect, _BackoffMs());
}

export function Initialize(port: number, secret: string): void {

	if (_config) return;

	_config = { port, secret };

	_dead = false;

	_reconnectAttempts = 0;

	_Connect();
}

export function ResetTransport(): void {

	if (!_config) return;

	if (_reconnectTimer !== null) {
		clearTimeout(_reconnectTimer);

		_reconnectTimer = null;
	}

	_dead = false;

	_reconnectAttempts = 0;

	_reconnectStart = 0;

	_Connect();
}

export function IsAvailable(): boolean {

	return !_dead && _ws !== null && _ws.readyState === WebSocket.OPEN;
}

export function invoke(method: string, params: unknown[], TimeoutMs?: number): Promise<unknown> {

	return new Promise((Resolve, Reject) => {
		if (!IsAvailable() || !_ws) {
			console.warn(`[MistWS] invoke dropped: not connected (method=${method})`);

			Reject(new Error("MistWS: not connected"));

			return;
		}

		const Id = _nextId++;

		const EffectiveTimeoutMs = _ResolveTimeoutMs(TimeoutMs);

		const Timer = setTimeout(() => {
			if (!_pending.has(Id)) return;

			_pending.delete(Id);

			_methods.delete(Id);

			_timers.delete(Id);

			console.warn(`[MistWS] RPC timed out: method=${method} id=${Id} timeoutMs=${EffectiveTimeoutMs}`);

			Reject(new MistTimeoutError(method, Id, EffectiveTimeoutMs));
		}, EffectiveTimeoutMs);

		_pending.set(Id, (Result, Err) => {
			_ClearTimer(Id);

			if (Err !== undefined) Reject(new Error(Err));

			else Resolve(Result);
		});

		_methods.set(Id, method);

		_timers.set(Id, Timer);

		try {
			_ws.send(JSON.stringify({ id: Id, method, params }));
		} catch (E) {
			_pending.delete(Id);

			_methods.delete(Id);

			_ClearTimer(Id);

			Reject(E instanceof Error ? E : new Error(String(E)));
		}
	});
}

export function notify(method: string, params: unknown[]): void {

	if (!IsAvailable() || !_ws) return;

	try {
		_ws.send(JSON.stringify({ id: null, method, params }));
	} catch {}
}
