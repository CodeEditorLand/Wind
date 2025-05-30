var r=async(...[a,t])=>JSON.parse((await(await import("node:fs/promises")).readFile(`${t??"."}/${a}`,"utf-8")).toString());export{r as default};
