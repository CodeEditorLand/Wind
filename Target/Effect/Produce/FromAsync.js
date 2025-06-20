import{Effect as a}from"../../effect";function s(r,e,n){return(...o)=>a.tryPromise({try:()=>r(...o),catch:t=>e({...n,cause:t})})}export{s as FromAsync};
