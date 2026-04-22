/**
 * @module FileProtocolShim
 *
 * @description
 * Polyfill for VSCode's vscode-file:// and related protocols.
 * Intercepts protocol requests and routes them to Mountain file system operations.
 *
 * @protocol_map
 * - vscode-file:// → Mountain file:read/write operations
 * - vscode-userdata:// → Mountain user data service
 * - vscode-resource:// → Extension resources via Cocoon
 * - vscode-remote:// → Remote file system via Cocoon
 * - file:// → Standard file operations
 *
 * @phase 1 of Approach A3 implementation
 */

// ============================================================================
// Types
// ============================================================================

interface FileSystemRequest {
	protocol: string;
	path: string;
	query?: Record<string, string>;
	headers?: Headers;
}

interface FileSystemResponse {
	content: string | Blob | null;
	error?: Error;
	metadata?: {
		mime?: string;
		version?: string;
		etag?: string;
		lastModified?: string;
	};
}

interface ProtocolHandler {
	matches(req: FileSystemRequest): boolean;
	handle(req: FileSystemRequest): Promise<FileSystemResponse>;
}

// ============================================================================
// Tauri Integration
// ============================================================================

/**
 * Interface for Tauri command communication
 */
interface TauriCommand {
	cmd: string;
	args?: Record<string, unknown>;
}

/**
 * Invoke Tauri command with proper error handling
 */
async function invokeTauri<T>(
	command: string,
	args: Record<string, unknown> = {},
): Promise<T> {
	try {
		// Tauri 2.x: core.invoke, Tauri 1.x: invoke
		const Invoke =
			(window as any).__TAURI__?.core?.invoke ??
			(window as any).__TAURI__?.invoke ??
			(window as any).TAURI?.invoke;

		if (typeof Invoke === "function") {
			// Colon-prefixed methods (e.g. `file:write`,
			// `shared_process:invoke`) are not registered as direct Tauri
			// commands - Rust function names can't contain colons. They
			// dispatch through Mountain's single `MountainIPCInvoke`
			// command, which unwraps `params` back into the positional
			// `Vec<Value>` the internal handlers consume. Route
			// transparently so this polyfill behaves like the rest of
			// Wind/Sky/Output.
			if (command.includes(":")) {
				return await Invoke("MountainIPCInvoke", {
					method: command,
					params: args,
				});
			}
			return await Invoke(command, args);
		}

		throw new Error(`Tauri invoke not available for command: ${command}`);
	} catch (error: unknown) {
		throw error;
	}
}

// ============================================================================
// Protocol Handlers
// ============================================================================

/**
 * Handle vscode-file:// protocol requests
 * This is Electron's custom file protocol that replaces file://
 */
const VSCodeFileHandler: ProtocolHandler = {
	matches(req: FileSystemRequest): boolean {
		return req.protocol === "vscode-file";
	},

	async handle(req: FileSystemRequest): Promise<FileSystemResponse> {
		try {
			// Decode URI-encoded path
			const decodedPath = decodeURIComponent(req.path);

			// Determine if this is a read or write request
			const method =
				(req.headers?.get("X-Http-Method") as string) || "GET";

			if (method === "GET" || !method) {
				// Read file from Mountain
				const content = await invokeTauri<string>("file:read", {
					path: decodedPath,
					encoding: "utf8",
				});

				return {
					content,
					metadata: {
						mime: inferMimeType(decodedPath),
						lastModified: new Date().toISOString(),
					},
				};
			} else if (method === "PUT" || method === "POST") {
				// Write file to Mountain
				// Content should be in the request body
				throw new Error("File write not implemented via GET handler");
			}

			throw new Error(`Unsupported method: ${method}`);
		} catch (error: unknown) {
			return {
				content: null,
				error:
					error instanceof Error ? error : new Error(String(error)),
			};
		}
	},
};

/**
 * Handle vscode-userdata:// protocol requests
 * Routes to user data directory in Mountain
 */
const VSCodeUserDataHandler: ProtocolHandler = {
	matches(req: FileSystemRequest): boolean {
		return req.protocol === "vscode-userdata";
	},

	async handle(req: FileSystemRequest): Promise<FileSystemResponse> {
		try {
			// Get user data path from Mountain
			const userDataPath = await invokeTauri<string>(
				"file:user_data_path",
				{},
			);
			const fullPath = `${userDataPath}/${req.path.replace(/^\//, "")}`;

			const content = await invokeTauri<string>("file:read", {
				path: fullPath,
				encoding: "utf8",
			});

			return {
				content,
				metadata: {
					mime: inferMimeType(req.path),
					lastModified: new Date().toISOString(),
				},
			};
		} catch (error: unknown) {
			// Return empty content for user data files that don't exist yet
			return {
				content: "",
				error: undefined,
			};
		}
	},
};

/**
 * Handle vscode-resource:// protocol requests
 * Routes to extension resources via Cocoon
 */
const VSCodeResourceHandler: ProtocolHandler = {
	matches(req: FileSystemRequest): boolean {
		return req.protocol === "vscode-resource";
	},

	async handle(req: FileSystemRequest): Promise<FileSystemResponse> {
		try {
			// Parse extension resource path: vscode-resource://{extensionId}/{path}
			const [extensionId, ...pathParts] = req.path
				.split("/")
				.filter(Boolean);
			const resourcePath = pathParts.join("/");

			// Request resource from Cocoon via gRPC
			const content = await invokeTauri<string>(
				"cocoon:get_extension_resource",
				{
					extension_id: extensionId,
					resource_path: resourcePath,
				},
			);

			return {
				content,
				metadata: {
					mime: inferMimeType(resourcePath),
				},
			};
		} catch (error: unknown) {
			return {
				content: null,
				error:
					error instanceof Error ? error : new Error(String(error)),
			};
		}
	},
};

/**
 * Handle vscode-remote:// protocol requests
 * Routes to remote file system via Cocoon
 */
const VSCodeRemoteHandler: ProtocolHandler = {
	matches(req: FileSystemRequest): boolean {
		return req.protocol === "vscode-remote";
	},

	async handle(req: FileSystemRequest): Promise<FileSystemResponse> {
		try {
			// Parse remote path: vscode-remote://{host}/{path}
			const [host, ...pathParts] = req.path.split("/").filter(Boolean);
			const remotePath = pathParts.join("/");

			// Request file from Cocoon via gRPC
			const content = await invokeTauri<string>(
				"cocoon:read_remote_file",
				{
					host,
					path: remotePath,
				},
			);

			return {
				content,
				metadata: {
					mime: inferMimeType(remotePath),
				},
			};
		} catch (error: unknown) {
			return {
				content: null,
				error:
					error instanceof Error ? error : new Error(String(error)),
			};
		}
	},
};

/**
 * Handle standard file:// protocol requests
 */
const FileHandler: ProtocolHandler = {
	matches(req: FileSystemRequest): boolean {
		return req.protocol === "file";
	},

	async handle(req: FileSystemRequest): Promise<FileSystemResponse> {
		try {
			const decodedPath = decodeURIComponent(req.path);

			const content = await invokeTauri<string>("file:read", {
				path: decodedPath,
				encoding: "utf8",
			});

			return {
				content,
				metadata: {
					mime: inferMimeType(decodedPath),
					lastModified: new Date().toISOString(),
				},
			};
		} catch (error: unknown) {
			return {
				content: null,
				error:
					error instanceof Error ? error : new Error(String(error)),
			};
		}
	},
};

// ============================================================================
// Protocol Registry
// ============================================================================

const PROTOCOL_HANDLERS: ProtocolHandler[] = [
	VSCodeFileHandler,
	VSCodeUserDataHandler,
	VSCodeResourceHandler,
	VSCodeRemoteHandler,
	FileHandler,
];

/**
 * Find matching handler for a request
 */
function findHandler(req: FileSystemRequest): ProtocolHandler | null {
	return PROTOCOL_HANDLERS.find((handler) => handler.matches(req)) ?? null;
}

// ============================================================================
// URL Parsing
// ============================================================================

/**
 * Parse custom protocol URL
 */
function parseProtocolURL(url: string): FileSystemRequest {
	try {
		const parsed = new URL(url);

		// Extract protocol (remove trailing colon)
		// vscode-file: → vscode-file
		const protocol = parsed.protocol.replace(/:$/, "");

		// Get path, removing leading slash if present
		const path = parsed.pathname.replace(/^\//, "");

		// Parse query string
		const query: Record<string, string> = {};
		parsed.searchParams.forEach((value, key) => {
			query[key] = value;
		});

		return {
			protocol,
			path,
			query,
		};
	} catch (error) {
		throw new Error(`Invalid protocol URL: ${url}`);
	}
}

// ============================================================================
//.mime Type Inference
// ============================================================================

/**
 * Infer MIME type from file path
 */
function inferMimeType(path: string): string {
	const extension = path.split(".").pop()?.toLowerCase();

	const mimeMap: Record<string, string> = {
		js: "application/javascript",
		json: "application/json",
		ts: "application/typescript",
		html: "text/html",
		htm: "text/html",
		css: "text/css",
		md: "text/markdown",
		txt: "text/plain",
		xml: "application/xml",
		png: "image/png",
		jpg: "image/jpeg",
		jpeg: "image/jpeg",
		gif: "image/gif",
		svg: "image/svg+xml",
		wasm: "application/wasm",
	};

	return mimeMap[extension ?? ""] ?? "application/octet-stream";
}

// ============================================================================
// Fetch Interception
// ============================================================================

/**
 * Override native fetch to intercept protocol requests
 */
function installFetchInterception(): void {
	const originalFetch = window.fetch;

	window.fetch = async function interceptFetch(
		input: RequestInfo | URL,
		init?: RequestInit,
	): Promise<Response> {
		try {
			// Only intercept URLs with custom protocols
			const url =
				typeof input === "string"
					? input
					: input instanceof URL
						? input.toString()
						: input.url;

			if (needsInterception(url)) {
				const request = parseProtocolURL(url);
				const handler = findHandler(request);

				if (handler) {
					const result = await handler.handle({
						...request,
						headers: new Headers(init?.headers),
					});

					if (result.error) {
						throw result.error;
					}

					// Return mock Response object with content
					return new Response(result.content, {
						status: 200,
						headers: {
							"Content-Type":
								result.metadata?.mime ??
								"application/octet-stream",
							"Cache-Control": "public, max-age=3600",
							...(result.metadata?.lastModified && {
								"Last-Modified": result.metadata.lastModified,
							}),
						},
					});
				}
			}

			// Fall back to original fetch for non-protocol URLs
			return originalFetch(input, init);
		} catch (error) {
			return originalFetch(input, init);
		}
	};
}

/**
 * Check if URL needs protocol interception
 */
function needsInterception(url: string): boolean {
	const protocol = url.split(":")[0];
	const interceptedProtocols = [
		"vscode-file",
		"vscode-userdata",
		"vscode-resource",
		"vscode-remote",
		// Note: We don't intercept standard file:// by default
		// as it's handled by Tauri's security model
	];
	return interceptedProtocols.includes(protocol);
}

// ============================================================================
// Module Import Interception (if supported by bundler)
// ============================================================================

/**
 * Create a custom module loader for module imports
 * Note: This depends on the bundler/module system being used
 */
function installModuleInterception(): void {
	// This is a placeholder for module import interception
	// Actual implementation depends on the module system in use

	// For ES modules with import maps or custom resolvers:
	if (typeof (window as any).__createImport !== "undefined") {
		// Hook into import resolution (environment-specific)
	}

	// Note: Full module import interception requires significant
	// cooperation from the build tooling and module loader
}

// ============================================================================
// Installation
// ============================================================================

/**
 * Initialize the File Protocol Shim
 */
export function installFileProtocolShim(): void {
	if (typeof window === "undefined") {
		return;
	}

	// Prevent double installation
	if ((window as any).__FILE_PROTOCOL_SHIM_INSTALLED__) {
		return;
	}
	(window as any).__FILE_PROTOCOL_SHIM_INSTALLED__ = true;
	// Install fetch interception
	installFetchInterception();

	// Install module import interception
	installModuleInterception();
}

// ============================================================================
// Exports
// ============================================================================

/**
 * Export for testing/debugging purposes
 */
export const FileProtocolShim = {
	install: installFileProtocolShim,
	handlers: PROTOCOL_HANDLERS,
	parseProtocolURL,
	inferMimeType,
};

// Auto-install on import
if (typeof window !== "undefined") {
	installFileProtocolShim();
}
