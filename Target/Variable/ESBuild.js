var o={color:!0,format:"esm",logLevel:"debug",metafile:!0,minify:!0,outdir:"Target",platform:"node",target:"esnext",tsconfig:"tsconfig.json",write:!0,plugins:[{name:"Target",setup({onStart:e,initialOptions:{outdir:t}}){e(async()=>{try{t&&await(await import("node:fs/promises")).rm(t,{recursive:!0})}catch(i){console.log(i)}})}},(await import("esbuild-plugin-copy")).copy({assets:{from:["./Source/Script/Monaco/Theme"],to:["./tmp-assets"]}})],define:{"process.env.VERSION_PACKAGE":`'${(await(await import("../Function/JSON.js")).default("package.json"))?.version}'`}};export{o as default};
