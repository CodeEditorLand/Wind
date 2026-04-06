import { FileSystemErrorCode as t } from "../Type/FileSystemType.js";

class s extends Error {
	_tag;
	code;
	constructor(n, o, i) {
		(super(n, i ? { cause: i } : void 0),
			(this.name = "FileSystemProviderError"),
			(this._tag = "FileSystemProviderError"),
			(this.code = o));
	}
}
class u extends s {
	constructor(n, o) {
		(super(`File not found: ${n}`, t.FileNotFound, o),
			(this.name = "FileNotFoundError"),
			(this._tag = "FileNotFoundError"));
	}
}
class d extends s {
	constructor(n, o) {
		(super(`File already exists: ${n}`, t.FileExists, o),
			(this.name = "FileExistsError"),
			(this._tag = "FileExistsError"));
	}
}
class l extends s {
	constructor(n, o) {
		(super(`Permission denied: ${n}`, t.NoPermissions, o),
			(this.name = "PermissionError"),
			(this._tag = "PermissionError"));
	}
}
class a extends s {
	constructor(n, o) {
		(super(`Invalid path: ${n}`, t.InvalidPath, o),
			(this.name = "InvalidPathError"),
			(this._tag = "InvalidPathError"));
	}
}
class p extends s {
	constructor(n, o) {
		(super(`Operation not supported: ${n}`, t.NotSupported, o),
			(this.name = "NotSupportedError"),
			(this._tag = "NotSupportedError"));
	}
}
class E extends s {
	constructor(n, o) {
		(super(`Unknown file system error: ${n}`, t.Unknown, o),
			(this.name = "UnknownFileSystemError"),
			(this._tag = "UnknownFileSystemError"));
	}
}
function m(r) {
	return r instanceof s;
}
function w(r) {
	return r instanceof u;
}
function f(r) {
	return r instanceof d;
}
function g(r) {
	return r instanceof l;
}
function h(r) {
	return r instanceof a;
}
function k(r) {
	return r instanceof p;
}
function S(r) {
	return r instanceof E;
}
function x(r, n, o) {
	if (m(r)) return r;
	const i = r instanceof Error ? r.message : String(r),
		c = o ? `${n} (${o}): ${i}` : `${n}: ${i}`,
		e = i.toLowerCase();
	return e.includes("not found") || e.includes("no such")
		? new u(o ?? n, r)
		: e.includes("already exists") || e.includes("exists")
			? new d(o ?? n, r)
			: e.includes("permission") || e.includes("denied")
				? new l(o ?? n, r)
				: e.includes("invalid") || e.includes("malformed")
					? new a(o ?? n, r)
					: new E(c, r);
}
export {
	d as FileExistsError,
	u as FileNotFoundError,
	s as FileSystemProviderError,
	a as InvalidPathError,
	p as NotSupportedError,
	l as PermissionError,
	E as UnknownFileSystemError,
	f as isFileExistsError,
	w as isFileNotFoundError,
	m as isFileSystemProviderError,
	h as isInvalidPathError,
	k as isNotSupportedError,
	g as isPermissionError,
	S as isUnknownFileSystemError,
	x as toFileSystemProviderError,
};
