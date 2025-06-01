import{Effect as r}from"../../effect";function u(o,n,t,a){return(...s)=>r.flatMap(o,e=>{const d=e[n];return r.tryPromise({try:()=>d.apply(e,s),catch:c=>t({...a,cause:c})})})}export{u as default};
