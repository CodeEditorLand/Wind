class a extends Error{constructor(r,n){super(`IPC channel '${r}' error: ${String(n)}`);this.channel=r;this.cause=n}channel;cause;_tag="IPCChannelError"}export{a as IPCChannelError};
