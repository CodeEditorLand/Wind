class o extends Error{_tag="MountainRPCError";method;cause;constructor(r,n){super(`Mountain RPC '${r}' failed: ${String(n)}`),this.method=r}}var e=o;export{o as MountainRPCError,e as default};
