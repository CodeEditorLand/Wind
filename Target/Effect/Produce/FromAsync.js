import{Effect as o}from"../../effect";function s(r,e,a){return(...n)=>o.tryPromise({try:()=>r(...n),catch:t=>e({...a,cause:t})})}export{s as default};
