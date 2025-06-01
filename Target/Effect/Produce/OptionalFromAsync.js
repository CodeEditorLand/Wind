import{Effect as r,Option as u}from"../../effect";function s(e,n,t){return(...o)=>r.tryPromise({try:()=>e(...o),catch:a=>n({...t,cause:a})}).pipe(r.map(u.fromNullable))}export{s as default};
