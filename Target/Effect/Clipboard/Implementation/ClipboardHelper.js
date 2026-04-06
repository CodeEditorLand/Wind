const e = (r) => ({ _tag: "ClipboardNotAvailable", reason: r }),
	t = (r) => ({ _tag: "ClipboardReadError", error: r }),
	a = (r) => ({ _tag: "ClipboardWriteError", error: r }),
	i = (r) => ({ _tag: "ClipboardPermissionDenied", reason: r }),
	l = (r) => ({ _tag: "ClipboardFormatNotSupported", format: r }),
	p = (r, o) => ({ _tag: "ClipboardSizeExceeded", size: r, limit: o }),
	b = {
		CreateNotAvailableError: e,
		CreateReadError: t,
		CreateWriteError: a,
		CreatePermissionDeniedError: i,
		CreateFormatNotSupportedError: l,
		CreateSizeExceededError: p,
	};
var d = b;
export {
	l as CreateFormatNotSupportedError,
	e as CreateNotAvailableError,
	i as CreatePermissionDeniedError,
	t as CreateReadError,
	p as CreateSizeExceededError,
	a as CreateWriteError,
	d as default,
};
