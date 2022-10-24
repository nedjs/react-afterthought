(function(g,f){typeof exports==='object'&&typeof module!=='undefined'?f(exports,require('react')):typeof define==='function'&&define.amd?define(['exports','react'],f):(g=typeof globalThis!=='undefined'?globalThis:g||self,f(g.ReactiveServices={},g.React));})(this,(function(exports,I){'use strict';var b=Object.defineProperty;var w=(r,e,t)=>e in r?b(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var i=(r,e,t)=>(w(r,typeof e!="symbol"?e+"":e,t),t);var h=(()=>{let r=[];return {get current(){return r[r.length-1]},enter(e){r.push(e);},exit(){r.pop();}}})();function u(...r){}var p=class{constructor(e){this.data=e;i(this,"next");i(this,"prev");}add(e){let t=this.next;this.next=e,e.next=t,e.prev=this;}removeSelf(){this.next&&(this.next.prev=this.prev),this.prev&&(this.prev.next=this.next),this.next=void 0,this.prev=void 0;}},d=class{constructor(){i(this,"handlersHead",new p(null));}emit(e){let t=this.handlersHead.next;for(;t;)t.data(e),t=t.next;}subscribe(e){let t=new p(e);return this.handlersHead.add(t),()=>{t.removeSelf();}}};var g=Symbol("rs_init"),v=Symbol("rs_watches"),y=Symbol("rs_path"),o=class{constructor(){i(this,"_services");}get services(){return this._services}[g](e){this._services=e.services;}static init(e,t){e[g]&&e[g](t);}static getWatches(e){if(e&&e[v])return e[v]}static getPath(e){if(e&&e[y])return e[y]}};function A(r){return new T(r)}var T=class{constructor(e){i(this,"serviceNames",new Map);i(this,"dispatcher",new d);i(this,"serviceInstances",new Map);i(this,"services",new Proxy({},new x(this)));for(let t in e)this.serviceNames.set(t,e[t]),this.serviceInstances.set(e[t],{instance:this.initService(e[t]),type:e[t],name:t});}subscribe(e){return this.dispatcher.subscribe(e)}getService(e){return this.initServiceProxy(e).proxy}initServiceProxy(e){typeof e=="string"&&(e=this.serviceNames.get(e));let t=this.serviceInstances.get(e);if(!t)throw new Error("Unregistered service "+String(e));let n=new l(t.name,this.dispatcher);return {proxy:new Proxy(t.instance,n),proxyHandler:n}}initService(e){let t;if(this.isConstructor(e))try{t=new e;}catch(n){if(!n||n.name!=="TypeError"||!(typeof n.message=="string"&&n.message.endsWith("is not a constructor")))throw n;t=e;}else t=e;return o.init(t,this),t}isConstructor(e){var t;return typeof e=="function"&&((t=e==null?void 0:e.prototype)==null?void 0:t.constructor)}},x=class{constructor(e){this.injector=e;}get(e,t,n){return typeof t=="string"?this.injector.getService(t):e[t]}set(e,t,n,c){throw new Error("Cannot set a service here, services must be registered.")}},l=class{constructor(e,t,n=new Set){this.path=e;this.dispatcher=t;this.watchPaths=n;i(this,"proxies",new WeakMap);}get(e,t,n){if(e instanceof o&&o.prototype.hasOwnProperty(t))return e[t];if(t===v)return this.watchPaths;if(t===y)return this.path;let c,s=this.pathForProp(t);return typeof e[t]=="function"?c=e[t]:e[t]!==null&&typeof e[t]=="object"?((!this.proxies.has(e[t])||this.proxies.get(e[t])==null)&&this.proxies.set(e[t],new Proxy(e[t],new l(s,this.dispatcher,this.watchPaths))),c=this.proxies.get(e[t])):c=e[t],h.current?(o.getWatches(h.current).add(s)):u("RS-ignore:",void 0,s),c}set(e,t,n,c){if(h.current)throw new Error('Trying to improperly set property: "'+String(t)+'" during a rendering. This will cause an infinite loop and is not allowed. Full path is "'+this.pathForProp(t)+'"');let s=e[t];if(Array.isArray(e)){let a=e.length,f=e[t];if(e[t]=n,f!==n){let m=this.pathForProp(t);this.dispatcher.emit({path:m,oldValue:s,newValue:n});}if(e.length!==a){let m=this.pathForProp("length");this.dispatcher.emit({path:m,oldValue:a,newValue:e.length});}}else if(e[t]=n,s!==n){let a=this.pathForProp(t);this.dispatcher.emit({path:a,oldValue:s,newValue:n});}return !0}pathForProp(e){return this.path+"."+String(e)}};var S=I.createContext(null);function Z(r){if(r.injector)return I.createElement(S.Provider,{value:r.injector},r.children);{let e=I.useRef(A(r.services)).current;return I.createElement(S.Provider,{value:e},r.children)}}function _(){return I.useContext(S)}function H(r){let e=_(),t=I.useRef(null);t.current===null&&(t.current=e.getService(r));let n=t.current;h.enter(n),I.useLayoutEffect(()=>{h.exit();});let[,c]=I.useState({});return I.useEffect(()=>{let s=e.subscribe(({path:a})=>{let f=o.getWatches(n);f.has(a)?(c({})):u("RS-see",f,a);});return ()=>{s();}},[]),n}exports.AfterthoughtContext=S;exports.AfterthoughtProvider=Z;exports.AfterthoughtService=o;exports.SYM_SERVICE_INIT=g;exports.SYM_SERVICE_PATH=y;exports.SYM_SERVICE_WATCHES=v;exports.createInjector=A;exports.useInjector=_;exports.useService=H;}));//# sourceMappingURL=index.js.map