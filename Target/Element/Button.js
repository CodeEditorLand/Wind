import"@Stylesheet/Element/Button.scss";var s=async t=>{const{Action:n,Type:o,children:i,Class:e,Label:r}=(await import("../Function/Merge.js")).default({children:"",Type:"button",Action:()=>{},Class:"",Label:""},t);return<button class={`Button ${typeof e=="function"?e(t.Fn):e}`.trim()}onClick={()=>{n(t.Fn),t.Fn?.blur()}}ref={t.Fn}type={o}aria-label={r}>{(await import("solid-js")).children(()=>i)()}</button>};export{s as default};
