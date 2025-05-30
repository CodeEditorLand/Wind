import{Option as i,pipe as o}from"./effect.js";function n(t){return o(i.fromNullable(t),i.filter(e=>e.length>0),i.map(e=>e.map(r=>({name:r.name,extensions:[...r.extensions]}))))}export{n as a};
