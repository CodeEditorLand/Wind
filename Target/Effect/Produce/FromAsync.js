import{Effect as o}from"../../effect";function s(r,e,t){return(...n)=>o.tryPromise({try:()=>r(...n),catch:a=>e({...t,cause:a})})}export{s as default};
