import{Effect as r}from"../../effect";function u(t,n,o,a){return(...s)=>r.flatMap(t,e=>{const d=e[n];return r.tryPromise({try:()=>d.apply(e,s),catch:c=>o({...a,cause:c})})})}export{u as default};
