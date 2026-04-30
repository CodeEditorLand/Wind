class o extends Error{constructor(r){super(`Failed to fetch configuration: ${String(r)}`);this.cause=r}cause;_tag="ConfigFetchError"}var n=o;export{o as ConfigFetchError,n as default};
