/**
 * @module FileSystemPolyfill
 *
 * @description
 * Polyfill for Node.js fs module in the renderer sandbox.
 * Maps fs operations to Mountain file system commands.
 *
 * @feature_set
 * - readFile(path, encoding) → Mountain file:read
 * - writeFile(path, data, encoding) → Mountain file:write
 * - unlink(path) → Mountain file:delete
 * - rm(path, options) → Mountain file:delete (with recursive)
 * - rename(oldPath, newPath) → Mountain file:move
 * - copyFile(src, dest) → Mountain file:copy
 * - mkdir(path, options) → Mountain file:mkdir
 * - rmdir(path) → Mountain file:delete (rmdir)
 * - readdir(path) → Mountain file:readdir
 * - stat(path) → Mountain file:stat
 *
 * @feature_not_supported (browser/Tauri limitations)
 * - readFile(fd, buffer, offset, length, position) - No fd ops in Tauri
 * - writeFile(fd, buffer, offset, length, position) - No fd ops in Tauri
 * - open(path, flags, mode) - No fd ops in Tauri
 * - close(fd) - No fd ops in Tauri
 * - readSync, writeSync, etc. - Sync operations not supported
 * - watch, watchFile, unwatchFile - File watching requires backend service
 *
 * @phase 4 of Approach A3 implementation
 */

// ============================================================================
// Types
// ============================================================================

/**
 * File stats interface (partial Node.js fs.Stats)
 */
interface Stats {
	dev: number;
	ino: number;
	mode: number;
	nlink: number;
	uid: number;
	gid: number;
	rdev: number;
	size: number;
	atimeMs: number;
	mtimeMs: number;
	ctimeMs: number;
	birthtimeMs: number;
	atime: Date;
	mtime: Date;
	ctime: Date;
	birthtime: Date;
	isFile(): boolean;
	isDirectory(): boolean;
	isBlockDevice(): boolean;
	isCharacterDevice(): boolean;
	isSymbolicLink(): boolean;
	isFIFO(): boolean;
	isSocket(): boolean;
}

/**
 * Stats result from Mountain
 */
interface MountainStats {
	path: string;
	size: number;
	created: string;
	modified: string;
	accessed: string;
	is_file: boolean;
	is_dir: boolean;
	permissions?: string;
}

/**
 * Directory entry
 */
interface Dirent {
	name: string;
	path: string;
	isFile(): boolean;
	isDirectory(): boolean;
	isBlockDevice(): boolean;
	isCharacterDevice(): boolean;
	isSymbolicLink(): boolean;
	isFIFO(): boolean;
	isSocket(): boolean;
}

/**
 * Mkdir options
 */
interface MkdirOptions {
	recursive?: boolean;
	mode?: number;
}

/**
 * Rm options
 */
interface RmOptions {
	recursive?: boolean;
	force?: boolean;
	maxRetries?: number;
	retryDelay?: number;
}

/**
 * Read file options
 */
interface ReadFileOptions {
	encoding?: BufferEncoding | null;
	flag?: string;
}

/**
 * Write file options
 */
interface WriteFileOptions {
	encoding?: BufferEncoding | null;
	mode?: number;
	flag?: string;
}

/**
 * Copy file options
 */
interface CopyFileOptions {
	mode?: number;
	flags?: number;
}

// ============================================================================
// Tauri Integration
// ============================================================================

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
// Stats Implementation
// ============================================================================

/**
 * Convert Mountain stats to Node.js Stats
 */
function mountainStatsToStats(mountainStats: MountainStats): Stats {
	return {
		dev: 1,
		ino: 1,
		mode: mountainStats.is_file ? 0o100644 : 0o40755,
		nlink: 1,
		uid: 1000,
		gid: 1000,
		rdev: 0,
		size: mountainStats.size,
		atimeMs: new Date(mountainStats.accessed).getTime(),
		mtimeMs: new Date(mountainStats.modified).getTime(),
		ctimeMs: new Date(mountainStats.created).getTime(),
		birthtimeMs: new Date(mountainStats.created).getTime(),
		atime: new Date(mountainStats.accessed),
		mtime: new Date(mountainStats.modified),
		ctime: new Date(mountainStats.created),
		birthtime: new Date(mountainStats.created),
		isFile() {
			return mountainStats.is_file;
		},
		isDirectory() {
			return mountainStats.is_dir;
		},
		isBlockDevice() {
			return false;
		},
		isCharacterDevice() {
			return false;
		},
		isSymbolicLink() {
			return false;
		},
		isFIFO() {
			return false;
		},
		isSocket() {
			return false;
		},
	};
}

// ============================================================================
// Dirent Implementation
// ============================================================================

/**
 * Create Dirent from name and path
 */
function createDirent(name: string, path: string, isDir: boolean): Dirent {
	return {
		name,
		path,
		isFile() {
			return !isDir;
		},
		isDirectory() {
			return isDir;
		},
		isBlockDevice() {
			return false;
		},
		isCharacterDevice() {
			return false;
		},
		isSymbolicLink() {
			return false;
		},
		isFIFO() {
			return false;
		},
		isSocket() {
			return false;
		},
	};
}

// ============================================================================
// File System API
// ============================================================================

/**
 * Read file from Mountain file system
 */
async function readFile(
	path: string,
	options?: ReadFileOptions | BufferEncoding,
): Promise<string | Buffer> {
	// Normalize options
	const encoding =
		typeof options === "string" ? options : (options?.encoding ?? "utf8");

	try {
		// Call Mountain to read file
		const content = await invokeTauri<string>("file:read", {
			path,
			encoding: encoding === null ? "base64" : encoding,
		});

		// Return Buffer if encoding is null, otherwise string
		return encoding === null ? Buffer.from(content, "base64") : content;
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		throw err;
	}
}

/**
 * Write file to Mountain file system
 */
async function writeFile(
	path: string,
	data: string | Buffer,
	options?: WriteFileOptions | BufferEncoding,
): Promise<void> {
	// Normalize options
	let encoding: BufferEncoding | null = "utf8";
	if (typeof options === "string") {
		encoding = options;
	} else if (options) {
		encoding = options.encoding ?? "utf8";
	}

	// Convert data to string
	let content: string;
	if (Buffer.isBuffer(data)) {
		content = data.toString(encoding ?? "utf8");
	} else {
		content = data;
	}

	try {
		// Call Mountain to write file
		await invokeTauri("file:write", {
			path,
			data: content,
			encoding,
		});
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		throw err;
	}
}

/**
 * Delete file from Mountain file system
 */
async function unlink(path: string): Promise<void> {
	try {
		await invokeTauri("file:delete", {
			path,
			recursive: false,
		});
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		throw err;
	}
}

/**
 * Remove file or directory (recursive)
 */
async function rm(path: string, options?: RmOptions): Promise<void> {
	opts = {
		recursive: false,
		force: false,
		...options,
	};

	try {
		await invokeTauri("file:delete", {
			path,
			recursive: opts.recursive ?? false,
			force: opts.force ?? false,
		});
	} catch (error: unknown) {
		if (!opts.force) {
			const err =
				error instanceof Error ? error : new Error(String(error));
			throw err;
		}
	}
}

/**
 * Rename/move file or directory
 */
async function rename(oldPath: string, newPath: string): Promise<void> {
	try {
		await invokeTauri("file:move", {
			from: oldPath,
			to: newPath,
		});
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		throw err;
	}
}

/**
 * Copy file
 */
async function copyFile(
	src: string,
	dest: string,
	options?: CopyFileOptions,
): Promise<void> {
	try {
		await invokeTauri("file:copy", {
			from: src,
			to: dest,
		});
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		throw err;
	}
}

/**
 * Make directory
 */
async function mkdir(
	path: string,
	options?: MkdirOptions | number | boolean,
): Promise<void> {
	// Normalize options
	let opts: RecursiveMkdirOptions = { recursive: false };
	if (typeof options === "boolean") {
		opts.recursive = options;
	} else if (typeof options === "number") {
		opts.recursive = false;
		opts.mode = options;
	} else if (options) {
		opts.recursive = options.recursive ?? false;
		opts.mode = options.mode;
	}

	try {
		await invokeTauri("file:mkdir", {
			path,
			recursive: opts.recursive ?? false,
			mode: opts.mode ?? 0o755,
		});
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		throw err;
	}
}

// Fix the type reference issue
interface RecursiveMkdirOptions {
	recursive?: boolean;
	mode?: number;
}

/**
 * Remove directory
 */
async function rmdir(path: string): Promise<void> {
	try {
		await invokeTauri("file:delete", {
			path,
			recursive: false,
			is_rmdir: true,
		});
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		throw err;
	}
}

/**
 * Read directory
 */
async function readdir(
	path: string,
	options?: { withFileTypes?: boolean },
): Promise<string[] | Dirent[]> {
	try {
		const withFileTypes = options?.withFileTypes ?? false;

		// Call Mountain to read directory
		const entries = await invokeTauri<
			Array<{ name: string; is_file: boolean }>
		>("file:readdir", {
			path,
		});

		if (withFileTypes) {
			// Return Dirent objects
			return entries.map((entry) =>
				createDirent(
					entry.name,
					`${path}/${entry.name}`,
					!entry.is_file,
				),
			);
		} else {
			// Return string array
			return entries.map((entry) => entry.name);
		}
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		throw err;
	}
}

/**
 * Get file stats
 */
async function stat(path: string): Promise<Stats> {
	try {
		// Call Mountain to get file stats
		const mountainStats = await invokeTauri<MountainStats>("file:stat", {
			path,
		});

		return mountainStatsToStats(mountainStats);
	} catch (error: unknown) {
		const err = error instanceof Error ? error : new Error(String(error));
		throw err;
	}
}

/**
 * Check if file exists
 */
async function exists(path: string): Promise<boolean> {
	try {
		await stat(path);
		return true;
	} catch {
		return false;
	}
}

// ============================================================================
// Not Supported Functions (for compatibility)
// ============================================================================

/**
 * Not supported: Cannot open file descriptors in browser/Tauri
 */
function open(): never {
	throw new Error(
		"fs.open() is not supported in browser/Tauri environment. No file descriptor operations available.",
	);
}

/**
 * Not supported: Cannot read from file descriptors in browser/Tauri
 */
function read(): never {
	throw new Error(
		"fs.read() is not supported in browser/Tauri environment. Use readFile() instead.",
	);
}

/**
 * Not supported: Cannot write to file descriptors in browser/Tauri
 */
function write(): never {
	throw new Error(
		"fs.write() is not supported in browser/Tauri environment. Use writeFile() instead.",
	);
}

/**
 * Not supported: Cannot close file descriptors in browser/Tauri
 */
function close(): never {
	throw new Error(
		"fs.close() is not supported in browser/Tauri environment.",
	);
}

/**
 * Not supported: Synchronous operations not supported
 */
function readFileSync(): never {
	throw new Error(
		"fs.readFileSync() is not supported in browser/Tauri environment. Use async readFile() instead.",
	);
}

/**
 * Not supported: Synchronous operations not supported
 */
function writeFileSync(): never {
	throw new Error(
		"fs.writeFileSync() is not supported in browser/Tauri environment. Use async writeFile() instead.",
	);
}

/**
 * Not supported: File watching requires backend service
 */
function watch(): never {
	throw new Error(
		"fs.watch() is not supported. Use the FileWatcher service instead.",
	);
}

/**
 * Not supported: File watching requires backend service
 */
function watchFile(): never {
	throw new Error(
		"fs.watchFile() is not supported. Use the FileWatcher service instead.",
	);
}

/**
 * Not supported: Symbolic links not fully supported in sandbox
 */
function symlink(): never {
	throw new Error(
		"fs.symlink() is not fully supported in browser/Tauri environment.",
	);
}

/**
 * Not supported: Symbolic links not fully supported in sandbox
 */
function readlink(): never {
	throw new Error(
		"fs.readlink() is not fully supported in browser/Tauri environment.",
	);
}

/**
 * Not supported: Cannot modify file permissions in sandbox
 */
function chmod(): never {
	throw new Error(
		"fs.chmod() is not supported in browser/Tauri environment.",
	);
}

/**
 * Not supported: Cannot modify file permissions in sandbox
 */
function chown(): never {
	throw new Error(
		"fs.chown() is not supported in browser/Tauri environment.",
	);
}

// ============================================================================
// FS Namespace
// ============================================================================

/**
 * File System exports (mimicking Node.js fs module)
 */
const fs = {
	readFile,
	writeFile,
	unlink,
	rm,
	rename,
	copyFile,
	mkdir,
	rmdir,
	readdir,
	stat,
	exists,

	// Constants (partial)
	constants: {
		O_RDONLY: 0,
		O_WRONLY: 1,
		O_RDWR: 2,
		O_CREAT: 64,
		O_TRUNC: 512,
		O_APPEND: 1024,
	},

	// Not supported but included for TypeScript compatibility
	open,
	read,
	write,
	close,
	readFileSync,
	writeFileSync,
	watch,
	watchFile,
	symlink,
	readlink,
	chmod,
	chown,

	// Promise-based API for modern Node.js code
	promises: {
		readFile,
		writeFile,
		unlink,
		rm,
		rename,
		copyFile,
		mkdir,
		rmdir,
		readdir,
		stat,
		exists,
	},
};

// ============================================================================
// Installation
// ============================================================================

/**
 * Install the file system polyfill
 */
export function installFileSystemPolyfill(): void {
	if (typeof window === "undefined") {
		return;
	}

	// Prevent double installation
	if ((window as any).__FILE_SYSTEM_POLYFILL_INSTALLED__) {
		return;
	}
	(window as any).__FILE_SYSTEM_POLYFILL_INSTALLED__ = true;
	// Attach fs module to global (for Node.js compatibility)
	(window as any).fs = fs;
	(window as any).require = createRequireShim();

	// Also attach to window.vscode if available
	if (typeof (window as any).vscode !== "undefined") {
		(window as any).vscode.fs = fs;
	}
}

/**
 * Create require() shim for fs module
 */
function createRequireShim() {
	return (id: string) => {
		if (id === "fs") {
			return fs;
		}
		throw new Error(`Require shim only supports 'fs' module. Got: ${id}`);
	};
}

// ============================================================================
// Exports
// ============================================================================

export default {
	install: installFileSystemPolyfill,
	module: fs,

	// Individual exports for convenience
	readFile,
	writeFile,
	unlink,
	rm,
	rename,
	copyFile,
	mkdir,
	rmdir,
	readdir,
	stat,
	exists,
};

// Auto-install on import
if (typeof window !== "undefined") {
	installFileSystemPolyfill();
}
