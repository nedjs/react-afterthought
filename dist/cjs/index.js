var P=Object.create;var d=Object.defineProperty;var R=Object.getOwnPropertyDescriptor;var V=Object.getOwnPropertyNames;var D=Object.getPrototypeOf,H=Object.prototype.hasOwnProperty;var N=(r,e,t)=>e in r?d(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var M=(r,e)=>{for(var t in e)d(r,t,{get:e[t],enumerable:!0})},E=(r,e,t,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of V(e))!H.call(r,i)&&i!==t&&d(r,i,{get:()=>e[i],enumerable:!(n=R(e,i))||n.enumerable});return r};var O=(r,e,t)=>(t=r!=null?P(D(r)):{},E(e||!r||!r.__esModule?d(t,"default",{value:r,enumerable:!0}):t,r)),F=r=>E(d({},"__esModule",{value:!0}),r);var s=(r,e,t)=>(N(r,typeof e!="symbol"?e+"":e,t),t);var L={};M(L,{AfterthoughtContext:()=>m,AfterthoughtProvider:()=>W,AfterthoughtService:()=>c,SYM_SERVICE_INIT:()=>x,SYM_SERVICE_PATH:()=>y,SYM_SERVICE_WATCHES:()=>v,createInjector:()=>w,useInjector:()=>_,useService:()=>C});module.exports=F(L);var j=require("react");var Y=require("react"),u=(()=>{let r=[];return{get current(){return r[r.length-1]},enter(e){r.push(e)},exit(){r.pop()}}})();function l(...r){}var g=class{constructor(e){this.data=e;s(this,"next");s(this,"prev")}add(e){let t=this.next;this.next=e,e.next=t,e.prev=this}removeSelf(){this.next&&(this.next.prev=this.prev),this.prev&&(this.prev.next=this.next),this.next=void 0,this.prev=void 0}},T=class{constructor(){s(this,"handlersHead",new g(null))}emit(e){let t=this.handlersHead.next;for(;t;)t.data(e),t=t.next}subscribe(e){let t=new g(e);return this.handlersHead.add(t),()=>{t.removeSelf()}}};var x=Symbol("rs_init"),v=Symbol("rs_watches"),y=Symbol("rs_path"),c=class{constructor(){s(this,"_services")}get services(){return this._services}[x](e){this._services=e.services}static init(e,t){e[x]&&e[x](t)}static getWatches(e){if(e&&e[v])return e[v]}static getPath(e){if(e&&e[y])return e[y]}};function w(r){return new I(r)}var I=class{constructor(e){s(this,"serviceNames",new Map);s(this,"dispatcher",new T);s(this,"serviceInstances",new Map);s(this,"services",new Proxy({},new b(this)));for(let t in e)this.serviceNames.set(t,e[t]),this.serviceInstances.set(e[t],{instance:this.initService(e[t]),type:e[t],name:t})}subscribe(e){return this.dispatcher.subscribe(e)}getService(e){return this.initServiceProxy(e).proxy}initServiceProxy(e){typeof e=="string"&&(e=this.serviceNames.get(e));let t=this.serviceInstances.get(e);if(!t)throw new Error("Unregistered service "+String(e));let n=new S(t.name,this.dispatcher);return{proxy:new Proxy(t.instance,n),proxyHandler:n}}initService(e){let t;if(this.isConstructor(e))try{t=new e}catch(n){if(!n||n.name!=="TypeError"||!(typeof n.message=="string"&&n.message.endsWith("is not a constructor")))throw n;t=e}else t=e;return c.init(t,this),t}isConstructor(e){var t;return typeof e=="function"&&((t=e==null?void 0:e.prototype)==null?void 0:t.constructor)}},b=class{constructor(e){this.injector=e}get(e,t,n){return typeof t=="string"?this.injector.getService(t):e[t]}set(e,t,n,i){throw new Error("Cannot set a service here, services must be registered.")}},S=class{constructor(e,t,n=new Set){this.path=e;this.dispatcher=t;this.watchPaths=n;s(this,"proxies",new WeakMap)}get(e,t,n){if(e instanceof c&&c.prototype.hasOwnProperty(t))return e[t];if(t===v)return this.watchPaths;if(t===y)return this.path;let i,o=this.pathForProp(t);return typeof e[t]=="function"?i=e[t]:e[t]!==null&&typeof e[t]=="object"?((!this.proxies.has(e[t])||this.proxies.get(e[t])==null)&&this.proxies.set(e[t],new Proxy(e[t],new S(o,this.dispatcher,this.watchPaths))),i=this.proxies.get(e[t])):i=e[t],u.current?(l("RS-listen:",void 0,o),c.getWatches(u.current).add(o)):l("RS-ignore:",void 0,o),i}set(e,t,n,i){if(u.current)throw new Error('Trying to improperly set property: "'+String(t)+'" during a rendering. This will cause an infinite loop and is not allowed. Full path is "'+this.pathForProp(t)+'"');let o=e[t];if(Array.isArray(e)){let a=e.length,p=e[t];if(e[t]=n,p!==n){let A=this.pathForProp(t);this.dispatcher.emit({path:A,oldValue:o,newValue:n})}if(e.length!==a){let A=this.pathForProp("length");this.dispatcher.emit({path:A,oldValue:a,newValue:e.length})}}else if(e[t]=n,o!==n){let a=this.pathForProp(t);this.dispatcher.emit({path:a,oldValue:o,newValue:n})}return!0}pathForProp(e){return this.path+"."+String(e)}};var f=O(require("react")),m=(0,f.createContext)(null);function W(r){if(r.injector)return f.default.createElement(m.Provider,{value:r.injector},r.children);{let e=(0,f.useRef)(w(r.services)).current;return f.default.createElement(m.Provider,{value:e},r.children)}}function _(){return(0,j.useContext)(m)}var h=require("react");function C(r){let e=_(),t=(0,h.useRef)(null);t.current===null&&(t.current=e.getService(r));let n=t.current;u.enter(n),(0,h.useLayoutEffect)(()=>{u.exit()});let[,i]=(0,h.useState)({});return(0,h.useEffect)(()=>{let o=e.subscribe(({path:a})=>{let p=c.getWatches(n);p.has(a)?(l("RS-handle",p,a),i({})):l("RS-see",p,a)});return()=>{o()}},[]),n}0&&(module.exports={AfterthoughtContext,AfterthoughtProvider,AfterthoughtService,SYM_SERVICE_INIT,SYM_SERVICE_PATH,SYM_SERVICE_WATCHES,createInjector,useInjector,useService});
//# sourceMappingURL=index.js.map