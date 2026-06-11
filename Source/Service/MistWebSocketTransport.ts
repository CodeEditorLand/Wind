/**
 * @module Service/MistWebSocketTransport
 * @description
 * Sky-side WebSocket transport for the Sky<->Cocoon direct path (B7-S6).
 * Replaces Mountain gRPC hop for extension-API traffic (~95% of IPC volume).
 *
 * Auth: secret as WebSocket subprotocol (new WebSocket(url, [secret])) or
 *       URL query param (?secret=<hex>).
 * Reconnect: exponential backoff 100ms->5s, dead after 30s.
 */

let _ws: WebSocket | null = null;

let _config: { port: number; secret: string } | null = null;

const _pending = new Map<number, (result: unknown, error?: string) => void>();

let _nextId = 1;

let _dead = false;

let _reconnectAttempts = 0;

let _reconnectStart = 0;

let _reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const _DeadAfterMs = 30_000;

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

function _DrainPending(Reason: string): void {
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
			try {
				const Envelope = JSON.parse(Ev.data) as {
					id?: number;

					result?: unknown;

					error?: string;
				};

				const Id = Envelope.id;

				if (Id === undefined || Id === null) return;

				const Fn = _pending.get(Id);

				if (!Fn) return;

				_pending.delete(Id);

				if (Envelope.error !== undefined)
					Fn(undefined, String(Envelope.error));
				else Fn(Envelope.result ?? null);
			} catch {}
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

export function IsAvailable(): boolean {
	return !_dead && _ws !== null && _ws.readyState === WebSocket.OPEN;
}

export function invoke(method: string, params: unknown[]): Promise<unknown> {
	return new Promise((Resolve, Reject) => {
		if (!IsAvailable() || !_ws) {
			Reject(new Error("MistWS: not connected"));

			return;
		}

		const Id = _nextId++;

		_pending.set(Id, (Result, Err) => {
			if (Err !== undefined) Reject(new Error(Err));
			else Resolve(Result);
		});

		try {
			_ws.send(JSON.stringify({ id: Id, method, params }));
		} catch (E) {
			_pending.delete(Id);

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
