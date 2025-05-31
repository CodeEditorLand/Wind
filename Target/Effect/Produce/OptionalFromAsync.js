import{Effect as r,Option as u}from"../../effect";function s(e,t,n){return(...o)=>r.tryPromise({try:()=>e(...o),catch:a=>t({...n,cause:a})}).pipe(r.map(u.fromNullable))}export{s as default};
