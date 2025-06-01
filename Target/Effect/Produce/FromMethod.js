import{Effect as r}from"../../effect";function u(t,o,a,n){return(...s)=>r.flatMap(t,e=>{const d=e[o];return r.tryPromise({try:()=>d.apply(e,s),catch:c=>a({...n,cause:c})})})}export{u as default};
