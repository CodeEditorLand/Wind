import{template as l}from"solid-js/web";import{delegateEvents as w}from"solid-js/web";import{spread as _}from"solid-js/web";import{mergeProps as b}from"solid-js/web";import{memo as L}from"solid-js/web";import{use as D}from"solid-js/web";import{insert as u}from"solid-js/web";import{createComponent as f}from"solid-js/web";var E=l("<div>"),M=l("<div class=w-full><div class=Editor><code class=Monaco></code><input>"),k=l("<div class=Error><span>&nbsp;&nbsp;&nbsp;"),x=l("<input type=hidden>"),X=({Type:t}={Type:"HTML"})=>{const[o,{Form:a,Field:p}]=O(),q=crypto.randomUUID(),g=B(T(t));let i,e;return A(()=>{console.log(void 0),i instanceof HTMLElement&&(e=v.create(i,{value:g[0](),language:t.toLowerCase(),automaticLayout:!0,lineNumbers:"off","semanticHighlighting.enabled":"configuredByTheme",autoClosingBrackets:"always",autoIndent:"full",tabSize:4,detectIndentation:!1,useTabStops:!0,minimap:{enabled:!1},scrollbar:{useShadows:!0,horizontal:"hidden",verticalScrollbarSize:10,verticalSliderSize:4,alwaysConsumeMouseWheel:!1},folding:!1,theme:window.matchMedia("(prefers-color-scheme: dark)").matches?"Dark":"Light",wrappingStrategy:"advanced",bracketPairColorization:{enabled:!0,independentColorPoolPerBracketType:!0},padding:{top:12,bottom:12},fixedOverflowWidgets:!0,tabCompletion:"on",acceptSuggestionOnEnter:"on",cursorWidth:5,roundedSelection:!0,matchBrackets:"always",autoSurround:"languageDefined",screenReaderAnnounceInlineSuggestion:!1,renderFinalNewline:"on",selectOnLineNumbers:!1,formatOnType:!0,formatOnPaste:!0,fontFamily:"'Source Code Pro'",fontWeight:"400",fontLigatures:!0,links:!1,fontSize:16}),e.getModel()?.setEOL(v.EndOfLineSequence.LF),e.onKeyDown(r=>{r.ctrlKey&&r.code==="KeyS"&&(r.preventDefault(),I(o),o.element?.submit())}),e.onDidChangeModelLanguageConfiguration(()=>e.getAction("editor.action.formatDocument")?.run()),e.onDidLayoutChange(()=>e.getAction("editor.action.formatDocument")?.run()),window.addEventListener("load",()=>e.getAction("editor.action.formatDocument")?.run()),setTimeout(()=>e.getAction("editor.action.formatDocument")?.run(),1e3),H(W(g[0],r=>e.getModel()?.setValue(r),{defer:!1})))}),(()=>{var r=E();return u(r,f(a,{method:"post",onSubmit:P,get children(){return[f(p,{name:"Content",get validate(){return[z(`Please enter some ${t}.`)]},children:(s,d)=>(()=>{var n=M(),h=n.firstChild,c=h.firstChild,$=c.nextSibling,C=i;return typeof C=="function"?D(C,c):i=c,u(h,(()=>{var y=L(()=>!!s.error);return()=>y()&&(()=>{var m=k(),S=m.firstChild,K=S.firstChild;return m.$$click=()=>{F(o,"Content"),e.focus()},u(S,()=>s.error,null),m})()})(),$),_($,b(d,{type:"hidden",required:!0}),!1,!1),n})()}),f(p,{name:"Field",children:(s,d)=>(()=>{var n=x();return _(n,b(d,{value:t}),!1,!1),n})()})]}})),r})()};const T=t=>{switch(t){case"CSS":return`
/* Example CSS Code */
body {

}			
`;case"HTML":return`
<!-- Example HTML Code -->
<!doctype html>
<html lang="en">
	<body>
	</body>
</html>
`;case"TypeScript":return`
/**
 * Example TypeScript Code
 */
export default () => ({});
`;default:return""}},P=({Content:t,Field:o},a)=>{a&&(a.preventDefault(),console.log(t),console.log(o))};import{clearError as F,createForm as O,required as z,validate as I}from"@modular-forms/solid";import{editor as v}from"monaco-editor";import{onMount as A}from"solid-js";import{createEffect as H,createSignal as B,on as W}from"solid-js";import"../Stylesheet/Element/Action.scss";import"../Stylesheet/Element/Editor.scss";w(["click"]);export{T as Return,P as Update,X as default};
