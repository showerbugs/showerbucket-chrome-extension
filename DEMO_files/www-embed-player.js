(function(){var l;function aa(a,b){function c(){}
c.prototype=b.prototype;a.A=b.prototype;a.prototype=new c;a.prototype.constructor=a;for(var d in b)if(Object.defineProperties){var e=Object.getOwnPropertyDescriptor(b,d);e&&Object.defineProperty(a,d,e)}else a[d]=b[d]}
var ba="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)},ca="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this;
function da(a,b){if(b){for(var c=ca,d=a.split("."),e=0;e<d.length-1;e++){var f=d[e];f in c||(c[f]={});c=c[f]}d=d[d.length-1];e=c[d];f=b(e);f!=e&&null!=f&&ba(c,d,{configurable:!0,writable:!0,value:f})}}
da("String.prototype.startsWith",function(a){return a?a:function(a,c){if(null==this)throw new TypeError("The 'this' value for String.prototype.startsWith must not be null or undefined");if(a instanceof RegExp)throw new TypeError("First argument to String.prototype.startsWith must not be a regular expression");var b=this+"";a+="";for(var e=b.length,f=a.length,g=Math.max(0,Math.min(c|0,b.length)),h=0;h<f&&g<e;)if(b[g++]!=a[h++])return!1;return h>=f}});
da("Reflect.apply",function(a){if(a)return a;var b=Function.prototype.apply;return function(a,d,e){return b.call(a,d,e)}});
var ea="function"==typeof Object.create?Object.create:function(a){function b(){}
b.prototype=a;return new b};
da("Reflect.construct",function(a){return a?a:function(a,c,d){void 0===d&&(d=a);d=ea(d.prototype||Object.prototype);return Reflect.apply(a,d,c)||d}});
var n=this;function p(a){return void 0!==a}
function q(a){return"string"==typeof a}
function r(a,b,c){a=a.split(".");c=c||n;a[0]in c||!c.execScript||c.execScript("var "+a[0]);for(var d;a.length&&(d=a.shift());)!a.length&&p(b)?c[d]=b:c[d]&&c[d]!==Object.prototype[d]?c=c[d]:c=c[d]={}}
function t(a,b){for(var c=a.split("."),d=b||n,e;e=c.shift();)if(null!=d[e])d=d[e];else return null;return d}
function u(){}
function ha(a){a.na=void 0;a.getInstance=function(){return a.na?a.na:a.na=new a}}
function ia(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}
function ja(a){return"array"==ia(a)}
function ka(a){var b=ia(a);return"array"==b||"object"==b&&"number"==typeof a.length}
function la(a){return"function"==ia(a)}
function ma(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}
var na="closure_uid_"+(1E9*Math.random()>>>0),oa=0;function pa(a,b,c){return a.call.apply(a.bind,arguments)}
function qa(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}
function v(a,b,c){Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?v=pa:v=qa;return v.apply(null,arguments)}
function w(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var b=c.slice();b.push.apply(b,arguments);return a.apply(this,b)}}
var x=Date.now||function(){return+new Date};
function z(a,b){function c(){}
c.prototype=b.prototype;a.A=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.ob=function(a,c,f){for(var d=Array(arguments.length-2),e=2;e<arguments.length;e++)d[e-2]=arguments[e];return b.prototype[c].apply(a,d)}}
;var ra=document,A=window;function B(a){if(Error.captureStackTrace)Error.captureStackTrace(this,B);else{var b=Error().stack;b&&(this.stack=b)}a&&(this.message=String(a))}
z(B,Error);B.prototype.name="CustomError";var sa=String.prototype.trim?function(a){return a.trim()}:function(a){return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g,"")};
function ua(a,b){return a<b?-1:a>b?1:0}
function va(a){for(var b=0,c=0;c<a.length;++c)b=31*b+a.charCodeAt(c)>>>0;return b}
;var wa=Array.prototype.indexOf?function(a,b,c){return Array.prototype.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;
if(q(a))return q(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},D=Array.prototype.forEach?function(a,b,c){Array.prototype.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=q(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},xa=Array.prototype.map?function(a,b,c){return Array.prototype.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=q(a)?a.split(""):a,g=0;g<d;g++)g in f&&(e[g]=b.call(c,f[g],g,a));
return e};
function ya(a,b){a:{var c=a.length;for(var d=q(a)?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){c=e;break a}c=-1}return 0>c?null:q(a)?a.charAt(c):a[c]}
function za(a,b){var c=wa(a,b);0<=c&&Array.prototype.splice.call(a,c,1)}
function Aa(a){var b=a.length;if(0<b){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]}
function Ba(a,b){for(var c=1;c<arguments.length;c++){var d=arguments[c];if(ka(d)){var e=a.length||0,f=d.length||0;a.length=e+f;for(var g=0;g<f;g++)a[e+g]=d[g]}else a.push(d)}}
;function Ca(a,b){this.b=p(a)?a:0;this.f=p(b)?b:0}
Ca.prototype.equals=function(a){return a instanceof Ca&&(this==a?!0:this&&a?this.b==a.b&&this.f==a.f:!1)};
Ca.prototype.ceil=function(){this.b=Math.ceil(this.b);this.f=Math.ceil(this.f);return this};
Ca.prototype.floor=function(){this.b=Math.floor(this.b);this.f=Math.floor(this.f);return this};
Ca.prototype.round=function(){this.b=Math.round(this.b);this.f=Math.round(this.f);return this};function Da(a,b){this.width=a;this.height=b}
l=Da.prototype;l.aspectRatio=function(){return this.width/this.height};
l.isEmpty=function(){return!(this.width*this.height)};
l.ceil=function(){this.width=Math.ceil(this.width);this.height=Math.ceil(this.height);return this};
l.floor=function(){this.width=Math.floor(this.width);this.height=Math.floor(this.height);return this};
l.round=function(){this.width=Math.round(this.width);this.height=Math.round(this.height);return this};function Ea(a,b){for(var c=ka(b),d=c?b:arguments,c=c?0:1;c<d.length&&(a=a[d[c]],p(a));c++);return a}
function Fa(a){var b=Ga,c;for(c in b)if(a.call(void 0,b[c],c,b))return c}
function Ha(){var a=E,b;for(b in a)return!1;return!0}
function Ia(a,b){if(null!==a&&b in a)throw Error('The object already contains the key "'+b+'"');a[b]=!0}
function Ja(a){var b={},c;for(c in a)b[c]=a[c];return b}
var Ka="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function La(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<Ka.length;f++)c=Ka[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}}
;function Ma(a){Ma[" "](a);return a}
Ma[" "]=u;function Na(a,b){var c=Oa;return Object.prototype.hasOwnProperty.call(c,a)?c[a]:c[a]=b(a)}
;function Pa(){var a=Qa;try{var b;if(b=!!a&&null!=a.location.href)a:{try{Ma(a.foo);b=!0;break a}catch(c){}b=!1}return b}catch(c){return!1}}
;var Ra=function(){var a=!1;try{var b=Object.defineProperty({},"passive",{get:function(){a=!0}});
n.addEventListener("test",null,b)}catch(c){}return a}();var Sa=!1,Ta="";function Ua(a){a=a.match(/[\d]+/g);if(!a)return"";a.length=3;return a.join(".")}
(function(){if(navigator.plugins&&navigator.plugins.length){var a=navigator.plugins["Shockwave Flash"];if(a&&(Sa=!0,a.description)){Ta=Ua(a.description);return}if(navigator.plugins["Shockwave Flash 2.0"]){Sa=!0;Ta="2.0.0.11";return}}if(navigator.mimeTypes&&navigator.mimeTypes.length&&(a=navigator.mimeTypes["application/x-shockwave-flash"],Sa=!(!a||!a.enabledPlugin))){Ta=Ua(a.enabledPlugin.description);return}try{var b=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");Sa=!0;Ta=Ua(b.GetVariable("$version"));
return}catch(c){}try{b=new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");Sa=!0;Ta="6.0.21";return}catch(c){}try{b=new ActiveXObject("ShockwaveFlash.ShockwaveFlash"),Sa=!0,Ta=Ua(b.GetVariable("$version"))}catch(c){}})();
var Va=Sa,Wa=Ta;var F;a:{var Xa=n.navigator;if(Xa){var Ya=Xa.userAgent;if(Ya){F=Ya;break a}}F=""}function H(a){return-1!=F.indexOf(a)}
;function Za(){return(H("Chrome")||H("CriOS"))&&!H("Edge")}
;function $a(){return H("iPhone")&&!H("iPod")&&!H("iPad")}
;var ab=H("Opera"),bb=H("Trident")||H("MSIE"),cb=H("Edge"),db=H("Gecko")&&!(-1!=F.toLowerCase().indexOf("webkit")&&!H("Edge"))&&!(H("Trident")||H("MSIE"))&&!H("Edge"),eb=-1!=F.toLowerCase().indexOf("webkit")&&!H("Edge"),fb=H("Macintosh"),gb=H("Windows"),hb=H("Android"),ib=$a(),jb=H("iPad"),kb=H("iPod");function lb(){var a=n.document;return a?a.documentMode:void 0}
var mb;a:{var nb="",ob=function(){var a=F;if(db)return/rv\:([^\);]+)(\)|;)/.exec(a);if(cb)return/Edge\/([\d\.]+)/.exec(a);if(bb)return/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/.exec(a);if(eb)return/WebKit\/(\S+)/.exec(a);if(ab)return/(?:Version)[ \/]?(\S+)/.exec(a)}();
ob&&(nb=ob?ob[1]:"");if(bb){var pb=lb();if(null!=pb&&pb>parseFloat(nb)){mb=String(pb);break a}}mb=nb}var qb=mb,Oa={};
function rb(a){return Na(a,function(){for(var b=0,c=sa(String(qb)).split("."),d=sa(String(a)).split("."),e=Math.max(c.length,d.length),f=0;0==b&&f<e;f++){var g=c[f]||"",h=d[f]||"";do{g=/(\d*)(\D*)(.*)/.exec(g)||["","","",""];h=/(\d*)(\D*)(.*)/.exec(h)||["","","",""];if(0==g[0].length&&0==h[0].length)break;b=ua(0==g[1].length?0:parseInt(g[1],10),0==h[1].length?0:parseInt(h[1],10))||ua(0==g[2].length,0==h[2].length)||ua(g[2],h[2]);g=g[3];h=h[3]}while(0==b)}return 0<=b})}
var sb;var tb=n.document;sb=tb&&bb?lb()||("CSS1Compat"==tb.compatMode?parseInt(qb,10):5):void 0;(function(){if(gb){var a=/Windows NT ([0-9.]+)/;return(a=a.exec(F))?a[1]:"0"}return fb?(a=/10[_.][0-9_.]+/,(a=a.exec(F))?a[0].replace(/_/g,"."):"10"):hb?(a=/Android\s+([^\);]+)(\)|;)/,(a=a.exec(F))?a[1]:""):ib||jb||kb?(a=/(?:iPhone|CPU)\s+OS\s+(\S+)/,(a=a.exec(F))?a[1].replace(/_/g,"."):""):""})();var ub=H("Firefox"),vb=$a()||H("iPod"),wb=H("iPad"),xb=H("Android")&&!(Za()||H("Firefox")||H("Opera")||H("Silk")),yb=Za(),zb=H("Safari")&&!(Za()||H("Coast")||H("Opera")||H("Edge")||H("Silk")||H("Android"))&&!($a()||H("iPad")||H("iPod"));function Ab(a){return(a=a.exec(F))?a[1]:""}
(function(){if(ub)return Ab(/Firefox\/([0-9.]+)/);if(bb||cb||ab)return qb;if(yb)return $a()||H("iPad")||H("iPod")?Ab(/CriOS\/([0-9.]+)/):Ab(/Chrome\/([0-9.]+)/);if(zb&&!($a()||H("iPad")||H("iPod")))return Ab(/Version\/([0-9.]+)/);if(vb||wb){var a=/Version\/(\S+).*Mobile\/(\S+)/.exec(F);if(a)return a[1]+"."+a[2]}else if(xb)return(a=Ab(/Android\s+([0-9.]+)/))?a:Ab(/Version\/([0-9.]+)/);return""})();!db&&!bb||bb&&9<=Number(sb)||db&&rb("1.9.1");bb&&rb("9");function Bb(){this.b="";this.f=Cb}
Bb.prototype.ma=!0;Bb.prototype.la=function(){return this.b};
var Cb={};function Db(){this.b="";this.f=Eb}
Db.prototype.ma=!0;Db.prototype.la=function(){return this.b};
function Fb(a){return a instanceof Db&&a.constructor===Db&&a.f===Eb?a.b:"type_error:SafeUrl"}
var Gb=/^(?:(?:https?|mailto|ftp):|[^:/?#]*(?:[/?#]|$))/i;function Hb(a){if(a instanceof Db)return a;a=a.ma?a.la():String(a);Gb.test(a)||(a="about:invalid#zClosurez");return Ib(a)}
var Eb={};function Ib(a){var b=new Db;b.b=a;return b}
Ib("about:blank");function Jb(){this.b=""}
Jb.prototype.ma=!0;Jb.prototype.la=function(){return this.b};
function Kb(a){var b=new Jb;b.b=a;return b}
Kb("<!DOCTYPE html>");Kb("");Kb("<br>");function Lb(a,b){var c=b instanceof Db?b:Hb(b);a.href=Fb(c)}
;function Mb(a){var b=document;return q(a)?b.getElementById(a):a}
function Nb(a){if(!a)return null;if(a.firstChild)return a.firstChild;for(;a&&!a.nextSibling;)a=a.parentNode;return a?a.nextSibling:null}
function Ob(a){if(!a)return null;if(!a.previousSibling)return a.parentNode;for(a=a.previousSibling;a&&a.lastChild;)a=a.lastChild;return a}
function Pb(a,b){for(var c=0;a;){if(b(a))return a;a=a.parentNode;c++}return null}
;function Qb(a){Rb();var b=new Bb;b.b=a;return b}
var Rb=u;function Sb(a){"number"==typeof a&&(a=Math.round(a)+"px");return a}
;var Tb=/^(?:([^:/?#.]+):)?(?:\/\/(?:([^/?#]*)@)?([^/#?]*?)(?::([0-9]+))?(?=[/#?]|$))?([^?#]+)?(?:\?([^#]*))?(?:#([\s\S]*))?$/;function I(a){return a.match(Tb)}
function Ub(a){return a?decodeURI(a):a}
function Vb(a,b,c){if(ja(b))for(var d=0;d<b.length;d++)Vb(a,String(b[d]),c);else null!=b&&c.push(a+(""===b?"":"="+encodeURIComponent(String(b))))}
function Wb(a){var b=[],c;for(c in a)Vb(c,a[c],b);return b.join("&")}
function Xb(a,b){var c=Wb(b);if(c){var d=a.indexOf("#");0>d&&(d=a.length);var e=a.indexOf("?");if(0>e||e>d){e=d;var f=""}else f=a.substring(e+1,d);d=[a.substr(0,e),f,a.substr(d)];e=d[1];d[1]=c?e?e+"&"+c:c:e;c=d[0]+(d[1]?"?"+d[1]:"")+d[2]}else c=a;return c}
;var Yb=!!window.google_async_iframe_id,Qa=Yb&&window.parent||window;function Zb(a,b){var c=$b();this.label=a;this.type=b;this.value=c;this.duration=0;this.uniqueId=this.label+"_"+this.type+"_"+Math.random()}
;function ac(a,b){this.events=[];this.f=b||n;var c=null;b&&(b.google_js_reporting_queue=b.google_js_reporting_queue||[],this.events=b.google_js_reporting_queue,c=b.google_measure_js_timing);a:{try{var d=(this.f||n).top.location.hash;if(d){var e=d.match(/\bdeid=([\d,]+)/);var f=e&&e[1]||"";break a}}catch(g){}f=""}f=f.indexOf&&0<=f.indexOf("1337");this.b=(this.b=null!=c?c:Math.random()<a)||f;c=this.f.performance;this.g=!!(c&&c.mark&&c.clearMarks&&f)}
ac.prototype.i=function(a){if(a&&this.g){var b=this.f.performance;b.clearMarks("goog_"+a.uniqueId+"_start");b.clearMarks("goog_"+a.uniqueId+"_end")}};
ac.prototype.start=function(a,b){if(!this.b)return null;var c=new Zb(a,b);this.g&&this.f.performance.mark("goog_"+c.uniqueId+"_start");return c};
ac.prototype.end=function(a){this.b&&(a.duration=$b()-a.value,this.g&&this.f.performance.mark("goog_"+a.uniqueId+"_end"),this.b&&this.events.push(a))};
function $b(){var a=n.performance;return a&&a.now?a.now():x()}
;if(Yb&&!Pa()){var bc="."+ra.domain;try{for(;2<bc.split(".").length&&!Pa();)ra.domain=bc=bc.substr(bc.indexOf(".")+1),Qa=window.parent}catch(a){}Pa()||(Qa=window)}var cc=Qa,J=new ac(1,cc);function dc(){cc.google_measure_js_timing||(J.events!=J.f.google_js_reporting_queue&&(J.events.length=0,J.g&&D(J.events,J.i,J)),J.b=!1)}
if("complete"==cc.document.readyState)dc();else if(J.b){var ec=function(){dc()};
cc.addEventListener?cc.addEventListener("load",ec,Ra?void 0:!1):cc.attachEvent&&cc.attachEvent("onload",ec)};var fc=(new Date).getTime();function gc(a){if(!a)return"";a=a.split("#")[0].split("?")[0];a=a.toLowerCase();0==a.indexOf("//")&&(a=window.location.protocol+a);/^[\w\-]*:\/\//.test(a)||(a=window.location.href);var b=a.substring(a.indexOf("://")+3),c=b.indexOf("/");-1!=c&&(b=b.substring(0,c));a=a.substring(0,a.indexOf("://"));if("http"!==a&&"https"!==a&&"chrome-extension"!==a&&"file"!==a&&"android-app"!==a&&"chrome-search"!==a)throw Error("Invalid URI scheme in origin");var c="",d=b.indexOf(":");if(-1!=d){var e=b.substring(d+
1),b=b.substring(0,d);if("http"===a&&"80"!==e||"https"===a&&"443"!==e)c=":"+e}return a+"://"+b+c}
;/*
 gapi.loader.OBJECT_CREATE_TEST_OVERRIDE &&*/
var hc=window,ic=document,jc=hc.location;function kc(){}
var lc=/\[native code\]/;function K(a,b,c){return a[b]=a[b]||c}
function mc(a){for(var b=0;b<this.length;b++)if(this[b]===a)return b;return-1}
function nc(a){a=a.sort();for(var b=[],c=void 0,d=0;d<a.length;d++){var e=a[d];e!=c&&b.push(e);c=e}return b}
function L(){var a;if((a=Object.create)&&lc.test(a))a=a(null);else{a={};for(var b in a)a[b]=void 0}return a}
var oc=K(hc,"gapi",{});var M;M=K(hc,"___jsl",L());K(M,"I",0);K(M,"hel",10);function pc(){var a=jc.href;if(M.dpo)var b=M.h;else{b=M.h;var c=RegExp("([#].*&|[#])jsh=([^&#]*)","g"),d=RegExp("([?#].*&|[?#])jsh=([^&#]*)","g");if(a=a&&(c.exec(a)||d.exec(a)))try{b=decodeURIComponent(a[2])}catch(e){}}return b}
function qc(a){var b=K(M,"PQ",[]);M.PQ=[];var c=b.length;if(0===c)a();else for(var d=0,e=function(){++d===c&&a()},f=0;f<c;f++)b[f](e)}
function rc(a){return K(K(M,"H",L()),a,L())}
;function sc(){function a(){e[0]=1732584193;e[1]=4023233417;e[2]=2562383102;e[3]=271733878;e[4]=3285377520;y=m=0}
function b(a){for(var b=g,c=0;64>c;c+=4)b[c/4]=a[c]<<24|a[c+1]<<16|a[c+2]<<8|a[c+3];for(c=16;80>c;c++)a=b[c-3]^b[c-8]^b[c-14]^b[c-16],b[c]=(a<<1|a>>>31)&4294967295;a=e[0];for(var d=e[1],f=e[2],h=e[3],k=e[4],m,C,c=0;80>c;c++)40>c?20>c?(m=h^d&(f^h),C=1518500249):(m=d^f^h,C=1859775393):60>c?(m=d&f|h&(d|f),C=2400959708):(m=d^f^h,C=3395469782),m=((a<<5|a>>>27)&4294967295)+m+k+C+b[c]&4294967295,k=h,h=f,f=(d<<30|d>>>2)&4294967295,d=a,a=m;e[0]=e[0]+a&4294967295;e[1]=e[1]+d&4294967295;e[2]=e[2]+f&4294967295;
e[3]=e[3]+h&4294967295;e[4]=e[4]+k&4294967295}
function c(a,c){if("string"===typeof a){a=unescape(encodeURIComponent(a));for(var d=[],e=0,g=a.length;e<g;++e)d.push(a.charCodeAt(e));a=d}c||(c=a.length);d=0;if(0==m)for(;d+64<c;)b(a.slice(d,d+64)),d+=64,y+=64;for(;d<c;)if(f[m++]=a[d++],y++,64==m)for(m=0,b(f);d+64<c;)b(a.slice(d,d+64)),d+=64,y+=64}
function d(){var a=[],d=8*y;56>m?c(h,56-m):c(h,64-(m-56));for(var g=63;56<=g;g--)f[g]=d&255,d>>>=8;b(f);for(g=d=0;5>g;g++)for(var k=24;0<=k;k-=8)a[d++]=e[g]>>k&255;return a}
for(var e=[],f=[],g=[],h=[128],k=1;64>k;++k)h[k]=0;var m,y;a();return{reset:a,update:c,digest:d,Ga:function(){for(var a=d(),b="",c=0;c<a.length;c++)b+="0123456789ABCDEF".charAt(Math.floor(a[c]/16))+"0123456789ABCDEF".charAt(a[c]%16);return b}}}
;function tc(a,b,c){var d=[],e=[];if(1==(ja(c)?2:1))return e=[b,a],D(d,function(a){e.push(a)}),uc(e.join(" "));
var f=[],g=[];D(c,function(a){g.push(a.key);f.push(a.value)});
c=Math.floor((new Date).getTime()/1E3);e=0==f.length?[c,b,a]:[f.join(":"),c,b,a];D(d,function(a){e.push(a)});
a=uc(e.join(" "));a=[c,a];0==g.length||a.push(g.join(""));return a.join("_")}
function uc(a){var b=sc();b.update(a);return b.Ga().toLowerCase()}
;function wc(a){this.b=a||{cookie:""}}
l=wc.prototype;l.isEnabled=function(){return navigator.cookieEnabled};
l.set=function(a,b,c,d,e,f){if(/[;=\s]/.test(a))throw Error('Invalid cookie name "'+a+'"');if(/[;\r\n]/.test(b))throw Error('Invalid cookie value "'+b+'"');p(c)||(c=-1);e=e?";domain="+e:"";d=d?";path="+d:"";f=f?";secure":"";c=0>c?"":0==c?";expires="+(new Date(1970,1,1)).toUTCString():";expires="+(new Date(x()+1E3*c)).toUTCString();this.b.cookie=a+"="+b+e+d+c+f};
l.get=function(a,b){for(var c=a+"=",d=(this.b.cookie||"").split(";"),e=0,f;e<d.length;e++){f=sa(d[e]);if(0==f.lastIndexOf(c,0))return f.substr(c.length);if(f==a)return""}return b};
l.remove=function(a,b,c){var d=p(this.get(a));this.set(a,"",0,b,c);return d};
l.isEmpty=function(){return!this.b.cookie};
l.clear=function(){for(var a=(this.b.cookie||"").split(";"),b=[],c=[],d,e,f=0;f<a.length;f++)e=sa(a[f]),d=e.indexOf("="),-1==d?(b.push(""),c.push(e)):(b.push(e.substring(0,d)),c.push(e.substring(d+1)));for(a=b.length-1;0<=a;a--)this.remove(b[a])};
var xc=new wc("undefined"==typeof document?null:document);xc.f=3950;function yc(){var a=[],b=gc(String(n.location.href)),c=n.__OVERRIDE_SID;null==c&&(c=(new wc(document)).get("SID"));if(c&&(b=(c=0==b.indexOf("https:")||0==b.indexOf("chrome-extension:"))?n.__SAPISID:n.__APISID,null==b&&(b=(new wc(document)).get(c?"SAPISID":"APISID")),b)){var c=c?"SAPISIDHASH":"APISIDHASH",d=String(n.location.href);return d&&b&&c?[c,tc(gc(d),b,a||null)].join(" "):null}return null}
;var zc=K(M,"perf",L());K(zc,"g",L());var Ac=K(zc,"i",L());K(zc,"r",[]);L();L();function Bc(a,b,c){b&&0<b.length&&(b=Cc(b),c&&0<c.length&&(b+="___"+Cc(c)),28<b.length&&(b=b.substr(0,28)+(b.length-28)),c=b,b=K(Ac,"_p",L()),K(b,c,L())[a]=(new Date).getTime(),b=zc.r,"function"===typeof b?b(a,"_p",c):b.push([a,"_p",c]))}
function Cc(a){return a.join("__").replace(/\./g,"_").replace(/\-/g,"_").replace(/\,/g,"_")}
;var Dc=L(),Ec=[];function O(a){throw Error("Bad hint"+(a?": "+a:""));}
Ec.push(["jsl",function(a){for(var b in a)if(Object.prototype.hasOwnProperty.call(a,b)){var c=a[b];"object"==typeof c?M[b]=K(M,b,[]).concat(c):K(M,b,c)}if(b=a.u)a=K(M,"us",[]),a.push(b),(b=/^https:(.*)$/.exec(b))&&a.push("http:"+b[1])}]);
var Fc=/^(\/[a-zA-Z0-9_\-]+)+$/,Gc=[/\/amp\//,/\/amp$/,/^\/amp$/],Hc=/^[a-zA-Z0-9\-_\.,!]+$/,Ic=/^gapi\.loaded_[0-9]+$/,Jc=/^[a-zA-Z0-9,._-]+$/;function Kc(a,b,c,d){var e=a.split(";"),f=e.shift(),g=Dc[f],h=null;g?h=g(e,b,c,d):O("no hint processor for: "+f);h||O("failed to generate load url");b=h;c=b.match(Lc);(d=b.match(Mc))&&1===d.length&&Nc.test(b)&&c&&1===c.length||O("failed sanity: "+a);return h}
function Oc(a,b,c,d){function e(a){return encodeURIComponent(a).replace(/%2C/g,",")}
a=Pc(a);Ic.test(c)||O("invalid_callback");b=Qc(b);d=d&&d.length?Qc(d):null;return[encodeURIComponent(a.Za).replace(/%2C/g,",").replace(/%2F/g,"/"),"/k=",e(a.version),"/m=",e(b),d?"/exm="+e(d):"","/rt=j/sv=1/d=1/ed=1",a.ra?"/am="+e(a.ra):"",a.za?"/rs="+e(a.za):"",a.Ca?"/t="+e(a.Ca):"","/cb=",e(c)].join("")}
function Pc(a){"/"!==a.charAt(0)&&O("relative path");for(var b=a.substring(1).split("/"),c=[];b.length;){a=b.shift();if(!a.length||0==a.indexOf("."))O("empty/relative directory");else if(0<a.indexOf("=")){b.unshift(a);break}c.push(a)}a={};for(var d=0,e=b.length;d<e;++d){var f=b[d].split("="),g=decodeURIComponent(f[0]),h=decodeURIComponent(f[1]);2==f.length&&g&&h&&(a[g]=a[g]||h)}b="/"+c.join("/");Fc.test(b)||O("invalid_prefix");c=0;for(d=Gc.length;c<d;++c)Gc[c].test(b)&&O("invalid_prefix");c=Rc(a,
"k",!0);d=Rc(a,"am");e=Rc(a,"rs");a=Rc(a,"t");return{Za:b,version:c,ra:d,za:e,Ca:a}}
function Qc(a){for(var b=[],c=0,d=a.length;c<d;++c){var e=a[c].replace(/\./g,"_").replace(/-/g,"_");Jc.test(e)&&b.push(e)}return b.join(",")}
function Rc(a,b,c){a=a[b];!a&&c&&O("missing: "+b);if(a){if(Hc.test(a))return a;O("invalid: "+b)}return null}
var Nc=/^https?:\/\/[a-z0-9_.-]+\.google\.com(:\d+)?\/[a-zA-Z0-9_.,!=\-\/]+$/,Mc=/\/cb=/g,Lc=/\/\//g;function Sc(){var a=pc();if(!a)throw Error("Bad hint");return a}
Dc.m=function(a,b,c,d){(a=a[0])||O("missing_hint");return"https://apis.google.com"+Oc(a,b,c,d)};
var Tc=decodeURI("%73cript"),Uc=/^[-+_0-9\/A-Za-z]+={0,2}$/;function Vc(a,b){for(var c=[],d=0;d<a.length;++d){var e=a[d];e&&0>mc.call(b,e)&&c.push(e)}return c}
function Wc(){var a=M.nonce;if(void 0!==a)return a&&a===String(a)&&a.match(Uc)?a:M.nonce=null;var b=K(M,"us",[]);if(!b||!b.length)return M.nonce=null;for(var c=ic.getElementsByTagName(Tc),d=0,e=c.length;d<e;++d){var f=c[d];if(f.src&&(a=String(f.nonce||f.getAttribute("nonce")||"")||null)){for(var g=0,h=b.length;g<h&&b[g]!==f.src;++g);if(g!==h&&a&&a===String(a)&&a.match(Uc))return M.nonce=a}}return null}
function Xc(a){if("loading"!=ic.readyState)Yc(a);else{var b=Wc(),c="";null!==b&&(c=' nonce="'+b+'"');ic.write("<"+Tc+' src="'+encodeURI(a)+'"'+c+"></"+Tc+">")}}
function Yc(a){var b=ic.createElement(Tc);b.setAttribute("src",a);a=Wc();null!==a&&b.setAttribute("nonce",a);b.async="true";(a=ic.getElementsByTagName(Tc)[0])?a.parentNode.insertBefore(b,a):(ic.head||ic.body||ic.documentElement).appendChild(b)}
function Zc(a,b){var c=b&&b._c;if(c)for(var d=0;d<Ec.length;d++){var e=Ec[d][0],f=Ec[d][1];f&&Object.prototype.hasOwnProperty.call(c,e)&&f(c[e],a,b)}}
function $c(a,b,c){ad(function(){var c=b===pc()?K(oc,"_",L()):L();c=K(rc(b),"_",c);a(c)},c)}
function bd(a,b){var c=b||{};"function"==typeof b&&(c={},c.callback=b);Zc(a,c);var d=a?a.split(":"):[],e=c.h||Sc(),f=K(M,"ah",L());if(f["::"]&&d.length){for(var g=[],h=null;h=d.shift();){var k=h.split("."),k=f[h]||f[k[1]&&"ns:"+k[0]||""]||e,m=g.length&&g[g.length-1]||null,y=m;m&&m.hint==k||(y={hint:k,features:[]},g.push(y));y.features.push(h)}var C=g.length;if(1<C){var N=c.callback;N&&(c.callback=function(){0==--C&&N()})}for(;d=g.shift();)cd(d.features,c,d.hint)}else cd(d||[],c,e)}
function cd(a,b,c){function d(a,b){if(C)return 0;hc.clearTimeout(y);N.push.apply(N,G);var d=((oc||{}).config||{}).update;d?d(f):f&&K(M,"cu",[]).push(f);if(b){Bc("me0",a,ta);try{$c(b,c,m)}finally{Bc("me1",a,ta)}}return 1}
a=nc(a)||[];var e=b.callback,f=b.config,g=b.timeout,h=b.ontimeout,k=b.onerror,m=void 0;"function"==typeof k&&(m=k);var y=null,C=!1;if(g&&!h||!g&&h)throw"Timeout requires both the timeout parameter and ontimeout parameter to be set";var k=K(rc(c),"r",[]).sort(),N=K(rc(c),"L",[]).sort(),ta=[].concat(k);0<g&&(y=hc.setTimeout(function(){C=!0;h()},g));
var G=Vc(a,N);if(G.length){var G=Vc(a,k),fa=K(M,"CP",[]),ga=fa.length;fa[ga]=function(a){function b(){var a=fa[ga+1];a&&a()}
function c(b){fa[ga]=null;d(G,a)&&qc(function(){e&&e();b()})}
if(!a)return 0;Bc("ml1",G,ta);0<ga&&fa[ga-1]?fa[ga]=function(){c(b)}:c(b)};
if(G.length){var vc="loaded_"+M.I++;oc[vc]=function(a){fa[ga](a);oc[vc]=null};
a=Kc(c,G,"gapi."+vc,k);k.push.apply(k,G);Bc("ml0",G,ta);b.sync||hc.___gapisync?Xc(a):Yc(a)}else fa[ga](kc)}else d(G)&&e&&e()}
function ad(a,b){if(M.hee&&0<M.hel)try{return a()}catch(c){b&&b(c),M.hel--,bd("debug_error",function(){try{window.___jsl.hefn(c)}catch(d){throw c;}})}else try{return a()}catch(c){throw b&&b(c),c;
}}
oc.load=function(a,b){return ad(function(){return bd(a,b)})};function dd(a,b,c){this.i=c;this.g=a;this.j=b;this.f=0;this.b=null}
dd.prototype.get=function(){if(0<this.f){this.f--;var a=this.b;this.b=a.next;a.next=null}else a=this.g();return a};
function ed(a,b){a.j(b);a.f<a.i&&(a.f++,b.next=a.b,a.b=b)}
;function fd(a){n.setTimeout(function(){throw a;},0)}
var gd;
function hd(){var a=n.MessageChannel;"undefined"===typeof a&&"undefined"!==typeof window&&window.postMessage&&window.addEventListener&&!H("Presto")&&(a=function(){var a=document.createElement("IFRAME");a.style.display="none";a.src="";document.documentElement.appendChild(a);var b=a.contentWindow,a=b.document;a.open();a.write("");a.close();var c="callImmediate"+Math.random(),d="file:"==b.location.protocol?"*":b.location.protocol+"//"+b.location.host,a=v(function(a){if(("*"==d||a.origin==d)&&a.data==
c)this.port1.onmessage()},this);
b.addEventListener("message",a,!1);this.port1={};this.port2={postMessage:function(){b.postMessage(c,d)}}});
if("undefined"!==typeof a&&!H("Trident")&&!H("MSIE")){var b=new a,c={},d=c;b.port1.onmessage=function(){if(p(c.next)){c=c.next;var a=c.ta;c.ta=null;a()}};
return function(a){d.next={ta:a};d=d.next;b.port2.postMessage(0)}}return"undefined"!==typeof document&&"onreadystatechange"in document.createElement("SCRIPT")?function(a){var b=document.createElement("SCRIPT");
b.onreadystatechange=function(){b.onreadystatechange=null;b.parentNode.removeChild(b);b=null;a();a=null};
document.documentElement.appendChild(b)}:function(a){n.setTimeout(a,0)}}
;function id(){this.f=this.b=null}
var kd=new dd(function(){return new jd},function(a){a.reset()},100);
id.prototype.remove=function(){var a=null;this.b&&(a=this.b,this.b=this.b.next,this.b||(this.f=null),a.next=null);return a};
function jd(){this.next=this.scope=this.b=null}
jd.prototype.set=function(a,b){this.b=a;this.scope=b;this.next=null};
jd.prototype.reset=function(){this.next=this.scope=this.b=null};function ld(a,b){md||nd();od||(md(),od=!0);var c=pd,d=kd.get();d.set(a,b);c.f?c.f.next=d:c.b=d;c.f=d}
var md;function nd(){if(-1!=String(n.Promise).indexOf("[native code]")){var a=n.Promise.resolve(void 0);md=function(){a.then(qd)}}else md=function(){var a=qd;
!la(n.setImmediate)||n.Window&&n.Window.prototype&&!H("Edge")&&n.Window.prototype.setImmediate==n.setImmediate?(gd||(gd=hd()),gd(a)):n.setImmediate(a)}}
var od=!1,pd=new id;function qd(){for(var a;a=pd.remove();){try{a.b.call(a.scope)}catch(b){fd(b)}ed(kd,a)}od=!1}
;function P(){this.f=this.f;this.H=this.H}
P.prototype.f=!1;P.prototype.dispose=function(){this.f||(this.f=!0,this.o())};
function rd(a,b){a.f?p(void 0)?b.call(void 0):b():(a.H||(a.H=[]),a.H.push(p(void 0)?v(b,void 0):b))}
P.prototype.o=function(){if(this.H)for(;this.H.length;)this.H.shift()()};
function sd(a){a&&"function"==typeof a.dispose&&a.dispose()}
function td(a){for(var b=0,c=arguments.length;b<c;++b){var d=arguments[b];ka(d)?td.apply(null,d):sd(d)}}
;var ud="StopIteration"in n?n.StopIteration:{message:"StopIteration",stack:""};function vd(){}
vd.prototype.next=function(){throw ud;};
vd.prototype.da=function(){return this};
function wd(a){if(a instanceof vd)return a;if("function"==typeof a.da)return a.da(!1);if(ka(a)){var b=0,c=new vd;c.next=function(){for(;;){if(b>=a.length)throw ud;if(b in a)return a[b++];b++}};
return c}throw Error("Not implemented");}
function xd(a,b){if(ka(a))try{D(a,b,void 0)}catch(c){if(c!==ud)throw c;}else{a=wd(a);try{for(;;)b.call(void 0,a.next(),void 0,a)}catch(c){if(c!==ud)throw c;}}}
function yd(a){if(ka(a))return Aa(a);a=wd(a);var b=[];xd(a,function(a){b.push(a)});
return b}
;function zd(a){return/^\s*$/.test(a)?!1:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/(?:"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)[\s\u2028\u2029]*(?=:|,|]|}|$)/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,""))}
function Ad(a){a=String(a);if(zd(a))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a);}
function Bd(a){var b=[];Cd(new Dd,a,b);return b.join("")}
function Dd(){}
function Cd(a,b,c){if(null==b)c.push("null");else{if("object"==typeof b){if(ja(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++)c.push(e),Cd(a,d[f],c),e=",";c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");e="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(f=b[d],"function"!=typeof f&&(c.push(e),Ed(d,c),c.push(":"),Cd(a,f,c),e=","));c.push("}");return}}switch(typeof b){case "string":Ed(b,c);break;case "number":c.push(isFinite(b)&&
!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}}
var Fd={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},Gd=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;function Ed(a,b){b.push('"',a.replace(Gd,function(a){var b=Fd[a];b||(b="\\u"+(a.charCodeAt(0)|65536).toString(16).substr(1),Fd[a]=b);return b}),'"')}
;function Hd(a){a.prototype.then=a.prototype.then;a.prototype.$goog_Thenable=!0}
;function Q(a,b){this.b=0;this.w=void 0;this.i=this.f=this.g=null;this.j=this.l=!1;if(a!=u)try{var c=this;a.call(b,function(a){Id(c,2,a)},function(a){Id(c,3,a)})}catch(d){Id(this,3,d)}}
function Jd(){this.next=this.context=this.f=this.g=this.b=null;this.i=!1}
Jd.prototype.reset=function(){this.context=this.f=this.g=this.b=null;this.i=!1};
var Kd=new dd(function(){return new Jd},function(a){a.reset()},100);
function Ld(a,b,c){var d=Kd.get();d.g=a;d.f=b;d.context=c;return d}
function Md(a){if(a instanceof Q)return a;var b=new Q(u);Id(b,2,a);return b}
function Nd(a){return new Q(function(b,c){c(a)})}
Q.prototype.then=function(a,b,c){return Od(this,la(a)?a:null,la(b)?b:null,c)};
Hd(Q);function Pd(a,b){return Od(a,null,b,void 0)}
Q.prototype.cancel=function(a){0==this.b&&ld(function(){var b=new Qd(a);Rd(this,b)},this)};
function Rd(a,b){if(0==a.b)if(a.g){var c=a.g;if(c.f){for(var d=0,e=null,f=null,g=c.f;g&&(g.i||(d++,g.b==a&&(e=g),!(e&&1<d)));g=g.next)e||(f=g);e&&(0==c.b&&1==d?Rd(c,b):(f?(d=f,d.next==c.i&&(c.i=d),d.next=d.next.next):Sd(c),Td(c,e,3,b)))}a.g=null}else Id(a,3,b)}
function Ud(a,b){a.f||2!=a.b&&3!=a.b||Vd(a);a.i?a.i.next=b:a.f=b;a.i=b}
function Od(a,b,c,d){var e=Ld(null,null,null);e.b=new Q(function(a,g){e.g=b?function(c){try{var e=b.call(d,c);a(e)}catch(m){g(m)}}:a;
e.f=c?function(b){try{var e=c.call(d,b);!p(e)&&b instanceof Qd?g(b):a(e)}catch(m){g(m)}}:g});
e.b.g=a;Ud(a,e);return e.b}
Q.prototype.C=function(a){this.b=0;Id(this,2,a)};
Q.prototype.D=function(a){this.b=0;Id(this,3,a)};
function Id(a,b,c){if(0==a.b){a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself"));a.b=1;a:{var d=c,e=a.C,f=a.D;if(d instanceof Q){Ud(d,Ld(e||u,f||null,a));var g=!0}else{if(d)try{var h=!!d.$goog_Thenable}catch(m){h=!1}else h=!1;if(h)d.then(e,f,a),g=!0;else{if(ma(d))try{var k=d.then;if(la(k)){Wd(d,k,e,f,a);g=!0;break a}}catch(m){f.call(a,m);g=!0;break a}g=!1}}}g||(a.w=c,a.b=b,a.g=null,Vd(a),3!=b||c instanceof Qd||Xd(a,c))}}
function Wd(a,b,c,d,e){function f(a){h||(h=!0,d.call(e,a))}
function g(a){h||(h=!0,c.call(e,a))}
var h=!1;try{b.call(a,g,f)}catch(k){f(k)}}
function Vd(a){a.l||(a.l=!0,ld(a.B,a))}
function Sd(a){var b=null;a.f&&(b=a.f,a.f=b.next,b.next=null);a.f||(a.i=null);return b}
Q.prototype.B=function(){for(var a;a=Sd(this);)Td(this,a,this.b,this.w);this.l=!1};
function Td(a,b,c,d){if(3==c&&b.f&&!b.i)for(;a&&a.j;a=a.g)a.j=!1;if(b.b)b.b.g=null,Yd(b,c,d);else try{b.i?b.g.call(b.context):Yd(b,c,d)}catch(e){Zd.call(null,e)}ed(Kd,b)}
function Yd(a,b,c){2==b?a.g.call(a.context,c):a.f&&a.f.call(a.context,c)}
function Xd(a,b){a.j=!0;ld(function(){a.j&&Zd.call(null,b)})}
var Zd=fd;function Qd(a){B.call(this,a)}
z(Qd,B);Qd.prototype.name="cancel";function R(a){P.call(this);this.l=1;this.i=[];this.j=0;this.b=[];this.g={};this.w=!!a}
z(R,P);l=R.prototype;l.subscribe=function(a,b,c){var d=this.g[a];d||(d=this.g[a]=[]);var e=this.l;this.b[e]=a;this.b[e+1]=b;this.b[e+2]=c;this.l=e+3;d.push(e);return e};
function $d(a,b,c,d){if(b=a.g[b]){var e=a.b;(b=ya(b,function(a){return e[a+1]==c&&e[a+2]==d}))&&a.K(b)}}
l.K=function(a){var b=this.b[a];if(b){var c=this.g[b];0!=this.j?(this.i.push(a),this.b[a+1]=u):(c&&za(c,a),delete this.b[a],delete this.b[a+1],delete this.b[a+2])}return!!b};
l.W=function(a,b){var c=this.g[a];if(c){for(var d=Array(arguments.length-1),e=1,f=arguments.length;e<f;e++)d[e-1]=arguments[e];if(this.w)for(e=0;e<c.length;e++){var g=c[e];ae(this.b[g+1],this.b[g+2],d)}else{this.j++;try{for(e=0,f=c.length;e<f;e++)g=c[e],this.b[g+1].apply(this.b[g+2],d)}finally{if(this.j--,0<this.i.length&&0==this.j)for(;g=this.i.pop();)this.K(g)}}return 0!=e}return!1};
function ae(a,b,c){ld(function(){a.apply(b,c)})}
l.clear=function(a){if(a){var b=this.g[a];b&&(D(b,this.K,this),delete this.g[a])}else this.b.length=0,this.g={}};
l.o=function(){R.A.o.call(this);this.clear();this.i.length=0};function be(a){this.b=a}
be.prototype.set=function(a,b){p(b)?this.b.set(a,Bd(b)):this.b.remove(a)};
be.prototype.get=function(a){try{var b=this.b.get(a)}catch(c){return}if(null!==b)try{return Ad(b)}catch(c){throw"Storage: Invalid value was encountered";}};
be.prototype.remove=function(a){this.b.remove(a)};function ce(a){this.b=a}
z(ce,be);function de(a){this.data=a}
function ee(a){return!p(a)||a instanceof de?a:new de(a)}
ce.prototype.set=function(a,b){ce.A.set.call(this,a,ee(b))};
ce.prototype.f=function(a){a=ce.A.get.call(this,a);if(!p(a)||a instanceof Object)return a;throw"Storage: Invalid value was encountered";};
ce.prototype.get=function(a){if(a=this.f(a)){if(a=a.data,!p(a))throw"Storage: Invalid value was encountered";}else a=void 0;return a};function fe(a){this.b=a}
z(fe,ce);fe.prototype.set=function(a,b,c){if(b=ee(b)){if(c){if(c<x()){fe.prototype.remove.call(this,a);return}b.expiration=c}b.creation=x()}fe.A.set.call(this,a,b)};
fe.prototype.f=function(a,b){var c=fe.A.f.call(this,a);if(c){var d;if(d=!b){d=c.creation;var e=c.expiration;d=!!e&&e<x()||!!d&&d>x()}if(d)fe.prototype.remove.call(this,a);else return c}};function ge(a){this.b=a}
z(ge,fe);function he(){}
;function ie(){}
z(ie,he);ie.prototype.clear=function(){var a=yd(this.da(!0)),b=this;D(a,function(a){b.remove(a)})};function je(a){this.b=a}
z(je,ie);l=je.prototype;l.isAvailable=function(){if(!this.b)return!1;try{return this.b.setItem("__sak","1"),this.b.removeItem("__sak"),!0}catch(a){return!1}};
l.set=function(a,b){try{this.b.setItem(a,b)}catch(c){if(0==this.b.length)throw"Storage mechanism: Storage disabled";throw"Storage mechanism: Quota exceeded";}};
l.get=function(a){a=this.b.getItem(a);if(!q(a)&&null!==a)throw"Storage mechanism: Invalid value was encountered";return a};
l.remove=function(a){this.b.removeItem(a)};
l.da=function(a){var b=0,c=this.b,d=new vd;d.next=function(){if(b>=c.length)throw ud;var d=c.key(b++);if(a)return d;d=c.getItem(d);if(!q(d))throw"Storage mechanism: Invalid value was encountered";return d};
return d};
l.clear=function(){this.b.clear()};
l.key=function(a){return this.b.key(a)};function ke(){var a=null;try{a=window.localStorage||null}catch(b){}this.b=a}
z(ke,je);function le(){var a=null;try{a=window.sessionStorage||null}catch(b){}this.b=a}
z(le,je);var me=window.performance&&window.performance.timing&&window.performance.now?function(){return window.performance.timing.navigationStart+window.performance.now()}:function(){return(new Date).getTime()},ne="Microsoft Internet Explorer"==navigator.appName;
function oe(a,b){if(1<b.length)a[b[0]]=b[1];else{var c=b[0],d;for(d in c)a[d]=c[d]}}
;var pe=window.yt&&window.yt.config_||window.ytcfg&&window.ytcfg.data_||{};r("yt.config_",pe,void 0);function S(a){oe(pe,arguments)}
function T(a,b){return a in pe?pe[a]:b}
;function U(a,b){var c=t("yt.logging.errors.log");c?c(a,b,void 0,void 0,void 0):(c=T("ERRORS",[]),c.push([a,b,void 0,void 0,void 0]),S("ERRORS",c))}
function qe(a){return a&&window.yterr?function(){try{return a.apply(this,arguments)}catch(b){U(b)}}:a}
;function V(a){return T("EXPERIMENT_FLAGS",{})[a]}
;var re={};function se(a){return re[a]||(re[a]=String(a).replace(/\-([a-z])/g,function(a,c){return c.toUpperCase()}))}
function te(a,b){return a?a.dataset?a.dataset[se(b)]:a.getAttribute("data-"+b):null}
function ue(a){a&&(a.dataset?a.dataset[se("loaded")]="true":a.setAttribute("data-loaded","true"))}
;function W(a,b){la(a)&&(a=qe(a));return window.setTimeout(a,b)}
;var ve=t("ytPubsubPubsubInstance")||new R;R.prototype.subscribe=R.prototype.subscribe;R.prototype.unsubscribeByKey=R.prototype.K;R.prototype.publish=R.prototype.W;R.prototype.clear=R.prototype.clear;r("ytPubsubPubsubInstance",ve,void 0);var we=t("ytPubsubPubsubSubscribedKeys")||{};r("ytPubsubPubsubSubscribedKeys",we,void 0);var xe=t("ytPubsubPubsubTopicToKeys")||{};r("ytPubsubPubsubTopicToKeys",xe,void 0);var ye=t("ytPubsubPubsubIsSynchronous")||{};r("ytPubsubPubsubIsSynchronous",ye,void 0);
function ze(a,b){var c=Ae();if(c){var d=c.subscribe(a,function(){var c=arguments;var f=function(){we[d]&&b.apply(window,c)};
try{ye[a]?f():W(f,0)}catch(g){U(g)}},void 0);
we[d]=!0;xe[a]||(xe[a]=[]);xe[a].push(d);return d}return 0}
function Ae(){return t("ytPubsubPubsubInstance")}
function Be(a){xe[a]&&(a=xe[a],D(a,function(a){we[a]&&delete we[a]}),a.length=0)}
function Ce(a){var b=Ae();if(b)if(b.clear(a),a)Be(a);else for(var c in xe)Be(c)}
function De(a,b){var c=Ae();c&&c.publish.apply(c,arguments)}
function Ee(a){var b=Ae();b&&("number"==typeof a?a=[a]:q(a)&&(a=[parseInt(a,10)]),D(a,function(a){b.unsubscribeByKey(a);delete we[a]}))}
;var Fe=/\.vflset|-vfl[a-zA-Z0-9_+=-]+/,Ge=/-[a-zA-Z]{2,3}_[a-zA-Z]{2,3}(?=(\/|$))/;function He(a,b){var c=Ie(a),d=document.getElementById(c),e=d&&te(d,"loaded"),f=d&&!e;if(e)b&&b();else{if(b){var e=ze(c,b),g=""+(b[na]||(b[na]=++oa));Je[g]=e}f||(d=Ke(a,c,function(){te(d,"loaded")||(ue(d),De(c),W(w(Ce,c),0))}))}}
function Ke(a,b,c){var d=document.createElement("script");d.id=b;d.onload=function(){c&&setTimeout(c,0)};
d.onreadystatechange=function(){switch(d.readyState){case "loaded":case "complete":d.onload()}};
d.src=a;a=document.getElementsByTagName("head")[0]||document.body;a.insertBefore(d,a.firstChild);return d}
function Le(a){a=Ie(a);var b=document.getElementById(a);b&&(Ce(a),b.parentNode.removeChild(b))}
function Me(a,b){if(a&&b){var c=""+(b[na]||(b[na]=++oa));(c=Je[c])&&Ee(c)}}
function Ie(a){var b=document.createElement("a");Lb(b,a);a=b.href.replace(/^[a-zA-Z]+:\/\//,"//");return"js-"+va(a)}
var Je={};function Ne(a,b){if(window.spf){var c="";if(a){var d=a.indexOf("jsbin/"),e=a.lastIndexOf(".js"),f=d+6;-1<d&&-1<e&&e>f&&(c=a.substring(f,e),c=c.replace(Fe,""),c=c.replace(Ge,""),c=c.replace("debug-",""),c=c.replace("tracing-",""))}spf.script.load(a,c,b)}else He(a,b)}
;var Oe=null;function Pe(){var a=T("BG_I",null),b=T("BG_IU",null),c=T("BG_P",void 0);b?Ne(b,function(){window.botguard?Qe(c):(Le(b),U(Error("Unable to load Botguard from "+b),"WARNING"))}):a&&(eval(a),Qe(c))}
function Qe(a){Oe=new window.botguard.bg(a);V("botguard_periodic_refresh")?me():V("botguard_always_refresh")}
function Re(){return null!=Oe}
function Se(){return Oe?Oe.invoke():null}
;x();var Te=p(XMLHttpRequest)?function(){return new XMLHttpRequest}:p(ActiveXObject)?function(){return new ActiveXObject("Microsoft.XMLHTTP")}:null;
function Ue(){if(!Te)return null;var a=Te();return"open"in a?a:null}
function Ve(a){switch(a&&"status"in a?a.status:-1){case 200:case 201:case 202:case 203:case 204:case 205:case 206:case 304:return!0;default:return!1}}
;function We(a){"?"==a.charAt(0)&&(a=a.substr(1));a=a.split("&");for(var b={},c=0,d=a.length;c<d;c++){var e=a[c].split("=");if(1==e.length&&e[0]||2==e.length){var f=decodeURIComponent((e[0]||"").replace(/\+/g," ")),e=decodeURIComponent((e[1]||"").replace(/\+/g," "));f in b?ja(b[f])?Ba(b[f],e):b[f]=[b[f],e]:b[f]=e}}return b}
function Xe(a,b){var c=a.split("#",2);a=c[0];var c=1<c.length?"#"+c[1]:"",d=a.split("?",2);a=d[0];var d=We(d[1]||""),e;for(e in b)d[e]=b[e];return Xb(a,d)+c}
;var Ye={"X-Goog-Visitor-Id":"SANDBOXED_VISITOR_ID","X-YouTube-Client-Name":"INNERTUBE_CONTEXT_CLIENT_NAME","X-YouTube-Client-Version":"INNERTUBE_CONTEXT_CLIENT_VERSION","X-Youtube-Identity-Token":"ID_TOKEN","X-YouTube-Page-CL":"PAGE_CL","X-YouTube-Page-Label":"PAGE_BUILD_LABEL","X-YouTube-Variants-Checksum":"VARIANTS_CHECKSUM"};
function Ze(a,b){b=void 0===b?{}:b;var c=void 0;c=window.location.href;var d=I(a)[1]||null,e=Ub(I(a)[3]||null);d&&e?(d=c,c=I(a),d=I(d),c=c[3]==d[3]&&c[1]==d[1]&&c[4]==d[4]):c=e?Ub(I(c)[3]||null)==e&&(Number(I(c)[4]||null)||null)==(Number(I(a)[4]||null)||null):!0;for(var f in Ye){if((e=d=T(Ye[f]))&&!(e=c)){var g=a,e=f,h=T("CORS_HEADER_WHITELIST")||{};e=(g=Ub(I(g)[3]||null))?(h=h[g])?0<=wa(h,e):!1:!0}e&&(b[f]=d)}return b}
function $e(a,b){var c=T("XSRF_FIELD_NAME",void 0),d;b.headers&&(d=b.headers["Content-Type"]);return!b.qb&&(!Ub(I(a)[3]||null)||b.withCredentials||Ub(I(a)[3]||null)==document.location.hostname)&&"POST"==b.method&&(!d||"application/x-www-form-urlencoded"==d)&&!(b.F&&b.F[c])}
function af(a,b){var c=b.format||"JSON";b.La&&(a=document.location.protocol+"//"+document.location.hostname+(document.location.port?":"+document.location.port:"")+a);var d=T("XSRF_FIELD_NAME",void 0),e=T("XSRF_TOKEN",void 0),f=b.kb;f&&(f[d]&&delete f[d],a=Xe(a,f||{}));var g=b.postBody||"",f=b.F;$e(a,b)&&(f||(f={}),f[d]=e);f&&q(g)&&(d=We(g),La(d,f),g=b.xa&&"JSON"==b.xa?JSON.stringify(d):Wb(d));var h=!1,k,m=bf(a,function(a){if(!h){h=!0;k&&window.clearTimeout(k);var d=Ve(a),e=null;if(d||400<=a.status&&
500>a.status)e=cf(c,a,b.pb);if(d)a:if(204==a.status)d=!0;else{switch(c){case "XML":d=0==parseInt(e&&e.return_code,10);break a;case "RAW":d=!0;break a}d=!!e}var e=e||{},f=b.context||n;d?b.J&&b.J.call(f,a,e):b.onError&&b.onError.call(f,a,e);b.Qa&&b.Qa.call(f,a,e)}},b.method,g,b.headers,b.responseType,b.withCredentials);
b.O&&0<b.timeout&&(k=W(function(){h||(h=!0,m.abort(),window.clearTimeout(k),b.O.call(b.context||n,m))},b.timeout))}
function cf(a,b,c){var d=null;switch(a){case "JSON":a=b.responseText;b=b.getResponseHeader("Content-Type")||"";a&&0<=b.indexOf("json")&&(d=JSON.parse(a));break;case "XML":if(b=(b=b.responseXML)?df(b):null)d={},D(b.getElementsByTagName("*"),function(a){d[a.tagName]=ef(a)})}c&&ff(d);
return d}
function ff(a){if(ma(a))for(var b in a){var c;(c="html_content"==b)||(c=b.length-5,c=0<=c&&b.indexOf("_html",c)==c);if(c){c=b;var d=Kb(a[b]);a[c]=d}else ff(a[b])}}
function df(a){return a?(a=("responseXML"in a?a.responseXML:a).getElementsByTagName("root"))&&0<a.length?a[0]:null:null}
function ef(a){var b="";D(a.childNodes,function(a){b+=a.nodeValue});
return b}
function gf(a,b){b.method="POST";b.F||(b.F={});af(a,b)}
function bf(a,b,c,d,e,f,g){function h(){4==(k&&"readyState"in k?k.readyState:0)&&b&&qe(b)(k)}
c=void 0===c?"GET":c;d=void 0===d?"":d;var k=Ue();if(!k)return null;"onloadend"in k?k.addEventListener("loadend",h,!1):k.onreadystatechange=h;k.open(c,a,!0);f&&(k.responseType=f);g&&(k.withCredentials=!0);c="POST"==c;if(e=Ze(a,e))for(var m in e)k.setRequestHeader(m,e[m]),"content-type"==m.toLowerCase()&&(c=!1);c&&k.setRequestHeader("Content-Type","application/x-www-form-urlencoded");k.send(d);return k}
;var hf={},jf=0;function kf(a,b){a&&(T("USE_NET_AJAX_FOR_PING_TRANSPORT",!1)?bf(a,b):lf(a,b))}
function lf(a,b){var c=new Image,d=""+jf++;hf[d]=c;c.onload=c.onerror=function(){b&&hf[d]&&b();delete hf[d]};
c.src=a}
;function mf(a,b,c,d,e){c={name:c||T("INNERTUBE_CONTEXT_CLIENT_NAME",1),version:d||T("INNERTUBE_CONTEXT_CLIENT_VERSION",void 0)};e=window&&window.yterr||e||!1;if(a&&e&&!(5<=nf)){e=a.stacktrace;d=a.columnNumber;var f=t("window.location.href");if(q(a))a={message:a,name:"Unknown error",lineNumber:"Not available",fileName:f,stack:"Not available"};else{var g=!1;try{var h=a.lineNumber||a.line||"Not available"}catch(C){h="Not available",g=!0}try{var k=a.fileName||a.filename||a.sourceURL||n.$googDebugFname||
f}catch(C){k="Not available",g=!0}a=!g&&a.lineNumber&&a.fileName&&a.stack&&a.message&&a.name?a:{message:a.message||"Not available",name:a.name||"UnknownError",lineNumber:h,fileName:k,stack:a.stack||"Not available"}}e=e||a.stack;h=a.lineNumber.toString();isNaN(h)||isNaN(d)||(h=h+":"+d);if(!(of[a.message]||0<=e.indexOf("/YouTubeCenter.js")||0<=e.indexOf("/mytube.js"))){k=a.fileName;b={kb:{a:"logerror",t:"jserror",type:a.name,msg:a.message.substr(0,1E3),line:h,level:b||"ERROR"},F:{url:T("PAGE_NAME",
window.location.href),file:k},method:"POST"};e&&(b.F.stack=e);for(var m in c)b.F["client."+m]=c[m];if(m=T("LATEST_ECATCHER_SERVICE_TRACKING_PARAMS",void 0))for(var y in m)b.F[y]=m[y];af("/error_204",b);of[a.message]=!0;nf++}}}
var of={},nf=0;var pf=window.yt&&window.yt.msgs_||window.ytcfg&&window.ytcfg.msgs||{};r("yt.msgs_",pf,void 0);function qf(a){oe(pf,arguments)}
;function rf(a,b){var c=5E3;isNaN(c)&&(c=void 0);var d=t("yt.scheduler.instance.addJob");return d?d(a,b,c):void 0===c?(a(),NaN):W(a,c||0)}
;var sf=[],tf=!1;function uf(){function a(){tf=!0;"google_ad_status"in window?S("DCLKSTAT",1):S("DCLKSTAT",2)}
Ne("//static.doubleclick.net/instream/ad_status.js",a);sf.push(rf(function(){tf||"google_ad_status"in window||(Me("//static.doubleclick.net/instream/ad_status.js",a),S("DCLKSTAT",3))},1))}
function vf(){return parseInt(T("DCLKSTAT",0),10)}
;var wf=0,xf=t("ytDomDomGetNextId")||function(){return++wf};
r("ytDomDomGetNextId",xf,void 0);var yf={stopImmediatePropagation:1,stopPropagation:1,preventMouseEvent:1,preventManipulation:1,preventDefault:1,layerX:1,layerY:1,screenX:1,screenY:1,scale:1,rotation:1,webkitMovementX:1,webkitMovementY:1};
function zf(a){this.type="";this.state=this.source=this.data=this.currentTarget=this.relatedTarget=this.target=null;this.charCode=this.keyCode=0;this.shiftKey=this.ctrlKey=this.altKey=!1;this.clientY=this.clientX=0;this.changedTouches=this.touches=null;if(a=a||window.event){this.event=a;for(var b in a)b in yf||(this[b]=a[b]);(b=a.target||a.srcElement)&&3==b.nodeType&&(b=b.parentNode);this.target=b;if(b=a.relatedTarget)try{b=b.nodeName?b:null}catch(c){b=null}else"mouseover"==this.type?b=a.fromElement:
"mouseout"==this.type&&(b=a.toElement);this.relatedTarget=b;this.clientX=void 0!=a.clientX?a.clientX:a.pageX;this.clientY=void 0!=a.clientY?a.clientY:a.pageY;this.keyCode=a.keyCode?a.keyCode:a.which;this.charCode=a.charCode||("keypress"==this.type?this.keyCode:0);this.altKey=a.altKey;this.ctrlKey=a.ctrlKey;this.shiftKey=a.shiftKey}}
zf.prototype.preventDefault=function(){this.event&&(this.event.returnValue=!1,this.event.preventDefault&&this.event.preventDefault())};
zf.prototype.stopPropagation=function(){this.event&&(this.event.cancelBubble=!0,this.event.stopPropagation&&this.event.stopPropagation())};
zf.prototype.stopImmediatePropagation=function(){this.event&&(this.event.cancelBubble=!0,this.event.stopImmediatePropagation&&this.event.stopImmediatePropagation())};var Ga=t("ytEventsEventsListeners")||{};r("ytEventsEventsListeners",Ga,void 0);var Af=t("ytEventsEventsCounter")||{count:0};r("ytEventsEventsCounter",Af,void 0);function Bf(a,b,c,d){d=void 0===d?!1:d;a.addEventListener&&("mouseenter"!=b||"onmouseenter"in document?"mouseleave"!=b||"onmouseenter"in document?"mousewheel"==b&&"MozBoxSizing"in document.documentElement.style&&(b="MozMousePixelScroll"):b="mouseout":b="mouseover");return Fa(function(e){return!!e.length&&e[0]==a&&e[1]==b&&e[2]==c&&e[4]==!!d})}
function Cf(a,b,c){var d=void 0===d?!1:d;if(!a||!a.addEventListener&&!a.attachEvent)return"";var e=Bf(a,b,c,d);if(e)return e;var e=++Af.count+"",f=!("mouseenter"!=b&&"mouseleave"!=b||!a.addEventListener||"onmouseenter"in document);var g=f?function(d){d=new zf(d);if(!Pb(d.relatedTarget,function(b){return b==a}))return d.currentTarget=a,d.type=b,c.call(a,d)}:function(b){b=new zf(b);
b.currentTarget=a;return c.call(a,b)};
g=qe(g);a.addEventListener?("mouseenter"==b&&f?b="mouseover":"mouseleave"==b&&f?b="mouseout":"mousewheel"==b&&"MozBoxSizing"in document.documentElement.style&&(b="MozMousePixelScroll"),a.addEventListener(b,g,d)):a.attachEvent("on"+b,g);Ga[e]=[a,b,c,g,d];return e}
function Df(a){a&&("string"==typeof a&&(a=[a]),D(a,function(a){if(a in Ga){var b=Ga[a],d=b[0],e=b[1],f=b[3],b=b[4];d.removeEventListener?d.removeEventListener(e,f,b):d.detachEvent&&d.detachEvent("on"+e,f);delete Ga[a]}}))}
;function Ef(){if(null==t("_lact",window)){var a=parseInt(T("LACT"),10),a=isFinite(a)?x()-Math.max(a,0):-1;r("_lact",a,window);r("_fact",a,window);-1==a&&Ff();Cf(document,"keydown",Ff);Cf(document,"keyup",Ff);Cf(document,"mousedown",Ff);Cf(document,"mouseup",Ff);ze("page-mouse",Ff);ze("page-scroll",Ff);ze("page-resize",Ff)}}
function Ff(){null==t("_lact",window)&&(Ef(),t("_lact",window));var a=x();r("_lact",a,window);-1==t("_fact",window)&&r("_fact",a,window);De("USER_ACTIVE")}
function Gf(){var a=t("_lact",window);return null==a?-1:Math.max(x()-a,0)}
var Hf=Ff;function If(a,b,c,d,e){this.g=a;this.j=b;this.i=c;this.f=d;this.b=e}
var Jf=1;function Kf(a){var b={};void 0!==a.g?b.trackingParams=a.g:(b.veType=a.j,null!=a.i&&(b.veCounter=a.i),null!=a.f&&(b.elementIndex=a.f));void 0!==a.b&&(b.dataElement=Kf(a.b));return b}
;var Lf={log_event:"events",log_interaction:"interactions"},Mf=Object.create(null);Mf.log_event="GENERIC_EVENT_LOGGING";Mf.log_interaction="INTERACTION_LOGGING";var Nf={},Of={},Pf=0,E=t("ytLoggingTransportLogPayloadsQueue_")||{};r("ytLoggingTransportLogPayloadsQueue_",E,void 0);var Qf=t("ytLoggingTransportTokensToCttTargetIds_")||{};r("ytLoggingTransportTokensToCttTargetIds_",Qf,void 0);var Rf=t("ytLoggingTransportDispatchedStats_")||{};r("ytLoggingTransportDispatchedStats_",Rf,void 0);
var Sf=t("ytLoggingTransportCapturedTime_")||{};r("ytytLoggingTransportCapturedTime_",Sf,void 0);function Tf(a,b){Of[a.endpoint]=b;if(a.ea){var c=a.ea;var d={};c.videoId?d.videoId=c.videoId:c.playlistId&&(d.playlistId=c.playlistId);Qf[a.ea.token]=d;c=Uf(a.endpoint,a.ea.token)}else c=Uf(a.endpoint);c.push(a.wa);d=Number(V("web_logging_max_batch")||0)||20;c.length>=d?Vf():Wf()}
function Vf(){window.clearTimeout(Pf);if(!Ha()){for(var a in E){var b=Nf[a];if(!b){var c=Of[a];if(!c)continue;b=new c;Nf[a]=b}var c=void 0,d=a,e=b,f=Lf[d],g=Rf[d]||{};Rf[d]=g;b=Math.round(me());for(c in E[d]){var h=e.f();h[f]=Uf(d,c);g.dispatchedEventCount=g.dispatchedEventCount||0;g.dispatchedEventCount+=h[f].length;h.requestTimeMs=b;var k=Qf[c];if(k)a:{var m=h,y=c;if(k.videoId)var C="VIDEO";else if(k.playlistId)C="PLAYLIST";else break a;m.credentialTransferTokenTargetId=k;m.context=m.context||{};
m.context.user=m.context.user||{};m.context.user.credentialTransferTokens=[{token:y,scope:C}]}delete Qf[c];e.g(d,h,{})}c=g;d=b;c.previousDispatchMs&&(b=d-c.previousDispatchMs,e=c.diffCount||0,c.averageTimeBetweenDispatchesMs=e?(c.averageTimeBetweenDispatchesMs*e+b)/(e+1):b,c.diffCount=e+1);c.previousDispatchMs=d;delete E[a]}Ha()||Wf()}}
function Wf(){window.clearTimeout(Pf);Pf=W(Vf,T("LOGGING_BATCH_TIMEOUT",1E4))}
function Uf(a,b){b||(b="");E[a]=E[a]||{};E[a][b]=E[a][b]||[];return E[a][b]}
;function Xf(a,b,c,d,e){var f={};f.eventTimeMs=Math.round(d||me());f[a]=b;f.context={lastActivityMs:String(Gf())};Tf({endpoint:"log_event",wa:f,ea:e},c)}
;function Yf(a,b,c,d){Zf(a,{attachChild:{csn:b,parentVisualElement:Kf(c),visualElements:[Kf(d)]}},void 0)}
function $f(a,b,c){V("interaction_logging_on_gel_web")?c.forEach(function(c){Xf("visualElementShown",{csn:b,ve:Kf(c),eventType:1},a)}):(c=xa(c,function(a){return Kf(a)}),Zf(a,{visibilityUpdate:{csn:b,
visualElements:c}}))}
function Zf(a,b,c){b.eventTimeMs=Math.round(me());b.lactMs=Gf();c&&(b.clientData=ag(c));Tf({endpoint:"log_interaction",wa:b},a)}
function ag(a){var b={};a.analyticsChannelData&&(b.analyticsDatas=xa(a.analyticsChannelData,function(a){return{tabName:a.tabName,cardName:a.cardName,isChannelScreen:a.isChannelScreen,insightId:a.insightId,externalChannelId:a.externalChannelId,externalContentOwnerId:a.externalContentOwnerId}}));
return{playbackData:{clientPlaybackNonce:a.clientPlaybackNonce},analyticsChannelData:b,externalLinkData:a.externalLinkData}}
;function bg(){if(!cg&&!dg||!window.JSON)return null;try{var a=cg.get("yt-player-two-stage-token")}catch(b){}if(!q(a))try{a=dg.get("yt-player-two-stage-token")}catch(b){}if(!q(a))return null;try{a=JSON.parse(a,void 0)}catch(b){}return a}
var dg,eg=new ke;dg=eg.isAvailable()?new ge(eg):null;var cg,fg=new le;cg=fg.isAvailable()?new ge(fg):null;function gg(){var a=T("ROOT_VE_TYPE",void 0);return a?new If(void 0,a,void 0):null}
function hg(){var a=T("client-screen-nonce",void 0);a||(a=T("EVENT_ID",void 0));return a}
;function ig(a,b,c){b=void 0===b?{}:b;c=void 0===c?!1:c;var d=T("EVENT_ID");d&&(b.ei||(b.ei=d));if(b){var d=a,e=T("VALID_SESSION_TEMPDATA_DOMAINS",[]),f=Ub(I(window.location.href)[3]||null);f&&e.push(f);f=Ub(I(d)[3]||null);if(0<=wa(e,f)||!f&&0==d.lastIndexOf("/",0))if(V("autoescape_tempdata_url")&&(e=document.createElement("a"),Lb(e,d),d=e.href),d){var f=I(d),d=f[5],e=f[6],f=f[7],g="";d&&(g+=d);e&&(g+="?"+e);f&&(g+="#"+f);d=g;e=d.indexOf("#");if(d=0>e?d:d.substr(0,e)){if(b.itct||b.ved)b.csn=b.csn||
hg();d="ST-"+va(d).toString(36);e=b?Wb(b):"";xc.set(""+d,e,5,"/","youtube.com");b&&(b=b.itct||b.ved,d=t("yt.logging.screen.storeParentElement"),b&&d&&d(new If(b)))}}}if(c)return!1;if((window.ytspf||{}).enabled)spf.navigate(a);else{var h=void 0===h?{}:h;var k=void 0===k?"":k;var m=void 0===m?window:m;c=m.location;a=Xb(a,h)+k;a=a instanceof Db?a:Hb(a);c.href=Fb(a)}return!0}
;var jg=t("yt.abuse.botguardInitialized")||Re;r("yt.abuse.botguardInitialized",jg,void 0);var kg=t("yt.abuse.invokeBotguard")||Se;r("yt.abuse.invokeBotguard",kg,void 0);var lg=t("yt.abuse.dclkstatus.checkDclkStatus")||vf;r("yt.abuse.dclkstatus.checkDclkStatus",lg,void 0);var mg=t("yt.player.exports.navigate")||ig;r("yt.player.exports.navigate",mg,void 0);var ng=t("yt.util.activity.init")||Ef;r("yt.util.activity.init",ng,void 0);var og=t("yt.util.activity.getTimeSinceActive")||Gf;
r("yt.util.activity.getTimeSinceActive",og,void 0);var pg=t("yt.util.activity.setTimestamp")||Hf;r("yt.util.activity.setTimestamp",pg,void 0);function qg(a){a={client:{hl:a.Oa,gl:a.Na,clientName:a.Ma,clientVersion:a.innertubeContextClientVersion}};T("DELEGATED_SESSION_ID")&&(a.user={onBehalfOfUser:T("DELEGATED_SESSION_ID")});return a}
function rg(){return{apiaryHost:T("APIARY_HOST",void 0),Ea:T("APIARY_HOST_FIRSTPARTY",void 0),gapiHintOverride:!!T("GAPI_HINT_OVERRIDE",void 0),gapiHintParams:T("GAPI_HINT_PARAMS",void 0),innertubeApiKey:T("INNERTUBE_API_KEY",void 0),innertubeApiVersion:T("INNERTUBE_API_VERSION",void 0),Ma:T("INNERTUBE_CONTEXT_CLIENT_NAME","WEB"),innertubeContextClientVersion:T("INNERTUBE_CONTEXT_CLIENT_VERSION",void 0),Oa:T("INNERTUBE_CONTEXT_HL",void 0),Na:T("INNERTUBE_CONTEXT_GL",void 0),xhrApiaryHost:T("XHR_APIARY_HOST",
void 0)||"",Pa:T("INNERTUBE_HOST_OVERRIDE",void 0)||""}}
function sg(a,b,c){c.context&&c.context.capabilities&&(c=c.context.capabilities,c.snapshot||c.golden)&&(a="vix");return"/youtubei/"+a+"/"+b}
;function tg(a){this.b=a||rg();ug||(ug=vg(this.b))}
function vg(a){return(new Q(function(b){try{var c={gapiHintOverride:a.gapiHintOverride,_c:{jsl:{h:a.gapiHintParams}},callback:b};b=c;b=void 0===b?{}:b;la(b)&&(b={callback:b});b._c&&b._c.jsl&&b._c.jsl.h||La(b,{_c:{jsl:{h:T("GAPI_HINT_PARAMS",void 0)}}});c=b;if(c.gapiHintOverride||T("GAPI_HINT_OVERRIDE")){var d=document.location.href;if(-1!=d.indexOf("?")){var d=(d||"").split("#")[0],e=d.split("?",2);var f=We(1<e.length?e[1]:e[0])}else f={};var g=f.gapi_jsh;g&&La(c,{_c:{jsl:{h:g}}})}bd("client",c)}catch(h){U(h)}})).then(function(){})}
tg.prototype.i=function(){var a=t("gapi.config.update");a("googleapis.config/auth/useFirstPartyAuth",!0);a("googleapis.config/auth/useFirstPartyAuthV2",!0);var b=this.b.apiaryHost;/^[\s\xa0]*$/.test(null==b?"":String(b))||a("googleapis.config/root",(-1==b.indexOf("://")?"//":"")+b);b=this.b.Ea;/^[\s\xa0]*$/.test(null==b?"":String(b))||a("googleapis.config/root-1p",(-1==b.indexOf("://")?"//":"")+b);b=T("SESSION_INDEX");a("googleapis.config/sessionIndex",b);t("gapi.client.setApiKey")(this.b.innertubeApiKey)};
tg.prototype.f=function(){return{context:qg(this.b)}};
tg.prototype.g=function(a,b,c){var d,e=!1;0<c.timeout&&(d=W(function(){e||(e=!0,c.O&&c.O())},c.timeout));
wg(this,a,b,function(a){if(!e)if(e=!0,d&&window.clearTimeout(d),a)c.J&&c.J(a);else if(c.onError)c.onError()})};
function wg(a,b,c,d){var e={path:sg(a.b.innertubeApiVersion,b,c),headers:{"X-Goog-Visitor-Id":T("VISITOR_DATA")},method:"POST",body:Bd(c)},f=v(a.i,a);ug.then(function(){f();t("gapi.client.request")(e).execute(d||u)})}
var ug=null;function xg(a){this.b=a||rg()}
xg.prototype.f=function(){return{context:qg(this.b)}};
xg.prototype.g=function(a,b,c){T("VISITOR_DATA")||U(Error("Missing VISITOR_DATA when sending innertube request."));var d={headers:{"Content-Type":"application/json","X-Goog-Visitor-Id":T("VISITOR_DATA","")},F:b,xa:"JSON",O:c.O,J:function(a,b){c.J&&c.J(b)},
onError:function(a,b){if(c.onError)c.onError(b)},
timeout:c.timeout,withCredentials:!0},e=yc();e&&(d.headers.Authorization=e,d.headers["X-Goog-AuthUser"]=T("SESSION_INDEX",0));var f=this.b.xhrApiaryHost;f&&!f.startsWith("http")&&(f="//"+f);V("youtubei_for_web")&&(f="");var g=this.b.Pa;g&&(f=g);e&&!f&&(d.headers["x-origin"]=window.location.origin);gf(""+f+sg(this.b.innertubeApiVersion,a,b)+"?alt=json&key="+this.b.innertubeApiKey,d)};function yg(){return V("enable_youtubei_innertube")?xg:tg}
;function zg(a){a=a||{};this.url=a.url||"";this.urlV9As2=a.url_v9as2||"";this.args=a.args||Ja(Ag);this.assets=a.assets||{};this.attrs=a.attrs||Ja(Bg);this.params=a.params||Ja(Cg);this.minVersion=a.min_version||"8.0.0";this.fallback=a.fallback||null;this.fallbackMessage=a.fallbackMessage||null;this.html5=!!a.html5;this.disable=a.disable||{};this.loaded=!!a.loaded;this.messages=a.messages||{}}
var Ag={enablejsapi:1},Bg={},Cg={allowscriptaccess:"always",allowfullscreen:"true",bgcolor:"#000000"};function Dg(a){a instanceof zg||(a=new zg(a));return a}
function Eg(a){var b=new zg,c;for(c in a)if(a.hasOwnProperty(c)){var d=a[c];b[c]="object"==ia(d)?Ja(d):d}return b}
;function Fg(a){P.call(this);this.b=[];this.g=a||this}
aa(Fg,P);function Gg(a,b,c,d){d=qe(v(d,a.g));d={target:b,name:c,sa:d};b.addEventListener(c,d.sa,void 0);a.b.push(d)}
function Hg(a){for(;a.b.length;){var b=a.b.pop();b.target.removeEventListener(b.name,b.sa)}}
Fg.prototype.o=function(){Hg(this);P.prototype.o.call(this)};function Ig(){this.g=this.f=this.b=0;this.i="";var a=t("window.navigator.plugins"),b=t("window.navigator.mimeTypes"),a=a&&a["Shockwave Flash"],b=b&&b["application/x-shockwave-flash"],b=a&&b&&b.enabledPlugin&&a.description||"";if(a=b){var c=a.indexOf("Shockwave Flash");0<=c&&(a=a.substr(c+15));for(var c=a.split(" "),d="",a="",e=0,f=c.length;e<f;e++)if(d)if(a)break;else a=c[e];else d=c[e];d=d.split(".");c=parseInt(d[0],10)||0;d=parseInt(d[1],10)||0;e=0;if("r"==a.charAt(0)||"d"==a.charAt(0))e=parseInt(a.substr(1),
10)||0;a=[c,d,e]}else a=[0,0,0];this.i=b;b=a;this.b=b[0];this.f=b[1];this.g=b[2];if(0>=this.b){if(ne)try{var g=new ActiveXObject("ShockwaveFlash.ShockwaveFlash")}catch(y){g=null}else{var h=document.body;var k=document.createElement("object");k.setAttribute("type","application/x-shockwave-flash");g=h.appendChild(k)}if(g&&"GetVariable"in g)try{var m=g.GetVariable("$version")}catch(y){m=""}h&&k&&h.removeChild(k);(g=m||"")?(g=g.split(" ")[1].split(","),g=[parseInt(g[0],10)||0,parseInt(g[1],10)||0,parseInt(g[2],
10)||0]):g=[0,0,0];this.b=g[0];this.f=g[1];this.g=g[2]}}
ha(Ig);function Jg(a,b,c,d){b="string"==typeof b?b.split("."):[b,c,d];b[0]=parseInt(b[0],10)||0;b[1]=parseInt(b[1],10)||0;b[2]=parseInt(b[2],10)||0;return a.b>b[0]||a.b==b[0]&&a.f>b[1]||a.b==b[0]&&a.f==b[1]&&a.g>=b[2]}
;var Kg=/cssbin\/(?:debug-)?([a-zA-Z0-9_-]+?)(?:-2x|-web|-rtl|-vfl|.css)/;function Lg(a){a=a||"";if(window.spf){var b=a.match(Kg);spf.style.load(a,b?b[1]:"",void 0)}else Mg(a)}
function Mg(a){var b=Ng(a),c=document.getElementById(b),d=c&&te(c,"loaded");d||c&&!d||(c=Og(a,b,function(){te(c,"loaded")||(ue(c),De(b),W(w(Ce,b),0))}))}
function Og(a,b,c){var d=document.createElement("link");d.id=b;d.onload=function(){c&&setTimeout(c,0)};
a=Qb(a);d.rel="stylesheet";d.href=a instanceof Bb&&a.constructor===Bb&&a.f===Cb?a.b:"type_error:TrustedResourceUrl";(document.getElementsByTagName("head")[0]||document.body).appendChild(d);return d}
function Ng(a){var b=document.createElement("a");Lb(b,a);a=b.href.replace(/^[a-zA-Z]+:\/\//,"//");return"css-"+va(a)}
;var X={},Pg=(X["api.invalidparam"]=2,X.auth=150,X["drm.auth"]=150,X["heartbeat.net"]=150,X["heartbeat.servererror"]=150,X["heartbeat.stop"]=150,X["html5.unsupportedads"]=5,X["fmt.noneavailable"]=5,X["fmt.decode"]=5,X["fmt.unplayable"]=5,X["html5.missingapi"]=5,X["html5.unsupportedlive"]=5,X["drm.unavailable"]=5,X);var Qg;var Rg=F,Rg=Rg.toLowerCase();if(-1!=Rg.indexOf("android")){var Sg=Rg.match(/android\D*(\d\.\d)[^\;|\)]*[\;\)]/);if(Sg)Qg=Number(Sg[1]);else{var Tg={cupcake:1.5,donut:1.6,eclair:2,froyo:2.2,gingerbread:2.3,honeycomb:3,"ice cream sandwich":4,jellybean:4.1,kitkat:4.4,lollipop:5.1,marshmallow:6,nougat:7.1},Ug=[],Vg=0,Wg;for(Wg in Tg)Ug[Vg++]=Wg;var Xg=Rg.match("("+Ug.join("|")+")");Qg=Xg?Tg[Xg[0]]:0}}else Qg=void 0;var Yg=['video/mp4; codecs="avc1.42001E, mp4a.40.2"','video/webm; codecs="vp8.0, vorbis"'],Zg=['audio/mp4; codecs="mp4a.40.2"'];var $g=t("ytLoggingLatencyUsageStats_")||{};r("ytLoggingLatencyUsageStats_",$g,void 0);var ah=0;function bh(a){$g[a]=$g[a]||{count:0};var b=$g[a];b.count++;b.time=me();ah||(ah=rf(ch,0));return 10<b.count?(11==b.count&&mf(Error("CSI data exceeded logging limit with key: "+a)),!0):!1}
function ch(){var a=me(),b;for(b in $g)6E4<a-$g[b].time&&delete $g[b];ah=0}
;function dh(a,b){this.version=a;this.args=b}
;function eh(a){this.topic=a}
eh.prototype.toString=function(){return this.topic};var fh=t("ytPubsub2Pubsub2Instance")||new R;R.prototype.subscribe=R.prototype.subscribe;R.prototype.unsubscribeByKey=R.prototype.K;R.prototype.publish=R.prototype.W;R.prototype.clear=R.prototype.clear;r("ytPubsub2Pubsub2Instance",fh,void 0);var gh=t("ytPubsub2Pubsub2SubscribedKeys")||{};r("ytPubsub2Pubsub2SubscribedKeys",gh,void 0);var hh=t("ytPubsub2Pubsub2TopicToKeys")||{};r("ytPubsub2Pubsub2TopicToKeys",hh,void 0);var ih=t("ytPubsub2Pubsub2IsAsync")||{};r("ytPubsub2Pubsub2IsAsync",ih,void 0);
r("ytPubsub2Pubsub2SkipSubKey",null,void 0);function jh(a){var b=kh,c=t("ytPubsub2Pubsub2Instance");c&&c.publish.call(c,b.toString(),b,a)}
;var Y=window.performance||window.mozPerformance||window.msPerformance||window.webkitPerformance||{};function lh(a,b){dh.call(this,1,arguments)}
z(lh,dh);var kh=new eh("timing-sent");var mh=x().toString();var nh={vc:!0},oh={ad_at:"adType",cpn:"clientPlaybackNonce",csn:"clientScreenNonce",is_nav:"isNavigation",yt_lt:"loadType",yt_ad:"isMonetized",yt_ad_pr:"prerollAllowed",yt_red:"isRedSubscriber",yt_vis:"isVisible",docid:"videoId",plid:"videoId",fmt:"playerInfo.itag"},ph="ap c cver ei yt_fss yt_li".split(" "),qh=["isNavigation","isMonetized","prerollAllowed","isRedSubscriber","isVisible"];
function rh(a){if("_"!=a[0]){var b=a;Y.mark&&(0==b.lastIndexOf("mark_",0)||(b="mark_"+b),Y.mark(b))}var b=sh(),c=me();b[a]&&(b["_"+a]=b["_"+a]||[b[a]],b["_"+a].push(c));b[a]=c;th()["tick_"+a]=void 0;me();V("csi_on_gel")?(b=uh(),"_start"==a?bh("baseline_"+b)||Xf("latencyActionBaselined",{clientActionNonce:b},xg,void 0):bh("tick_"+a+"_"+b)||Xf("latencyActionTicked",{tickName:a,clientActionNonce:b},xg,void 0),a=!0):a=!1;if(a=!a)a=!t("yt.timing.pingSent_");if(a&&(b=T("TIMING_ACTION",void 0),a=sh(),t("ytglobal.timingready_")&&
b&&a._start&&vh())){b=!0;c=T("TIMING_WAIT",[]);if(c.length)for(var d=0,e=c.length;d<e;++d)if(!(c[d]in a)){b=!1;break}b&&wh()}}
function xh(){var a=yh().info.yt_lt="hot_bg";th().info_yt_lt=a;if(V("csi_on_gel"))if("yt_lt"in oh){var b={},c=oh.yt_lt.split(".");0<=wa(qh,c)&&(a=!!a);for(var d=b,e=0;e<c.length-1;e++)d[c[e]]=d[c[e]]||{},d=d[c[e]];b[c[c.length-1]]=a;a=uh();c=Object.keys(b).join("");bh("info_"+c+"_"+a)||(b.clientActionNonce=a,Xf("latencyActionInfo",b,xg))}else 0<=wa(ph,"yt_lt")||U(Error("Unknown label yt_lt logged with GEL CSI."))}
function vh(){var a=sh();if(a.aft)return a.aft;for(var b=T("TIMING_AFT_KEYS",["ol"]),c=b.length,d=0;d<c;d++){var e=a[b[d]];if(e)return e}return NaN}
function wh(){if(!V("csi_on_gel")){var a=sh(),b=yh().info,c=a._start,d;for(d in a)if(0==d.lastIndexOf("_",0)&&ja(a[d])){var e=d.slice(1);if(e in nh){var f=xa(a[d],function(a){return Math.round(a-c)});
b["all_"+e]=f.join()}delete a[d]}e=!!b.ap;if(f=t("ytglobal.timingReportbuilder_")){if(f=f(a,b,void 0))zh(f,e),Ah(),Bh(),Ch(!1,void 0),T("TIMING_ACTION")&&S("PREVIOUS_ACTION",T("TIMING_ACTION")),S("TIMING_ACTION","")}else{var g=T("CSI_SERVICE_NAME","youtube");f={v:2,s:g,action:T("TIMING_ACTION",void 0)};var h=b.srt;void 0!==a.srt&&delete b.srt;if(b.h5jse){var k=window.location.protocol+t("ytplayer.config.assets.js");(k=Y.getEntriesByName?Y.getEntriesByName(k)[0]:null)?b.h5jse=Math.round(b.h5jse-k.responseEnd):
delete b.h5jse}a.aft=vh();Dh()&&"youtube"==g&&(xh(),g=a.vc,k=a.pbs,delete a.aft,b.aft=Math.round(k-g));for(var m in b)"_"!=m.charAt(0)&&(f[m]=b[m]);a.ps=me();b={};m=[];for(d in a)"_"!=d.charAt(0)&&(g=Math.round(a[d]-c),b[d]=g,m.push(d+"."+g));f.rt=m.join(",");(a=t("ytdebug.logTiming"))&&a(f,b);zh(f,e,void 0);jh(new lh(b.aft+(h||0),void 0))}}}
var Bh=v(Y.clearResourceTimings||Y.webkitClearResourceTimings||Y.mozClearResourceTimings||Y.msClearResourceTimings||Y.oClearResourceTimings||u,Y);
function zh(a,b,c){if(V("debug_csi_data")){var d=t("yt.timing.csiData");d||(d=[],r("yt.timing.csiData",d,void 0));d.push({page:location.href,time:new Date,args:a})}var d="",e;for(e in a)d+="&"+e+"="+a[e];a="/csi_204?"+d.substring(1);if(window.navigator&&window.navigator.sendBeacon&&b)try{window.navigator&&window.navigator.sendBeacon&&window.navigator.sendBeacon(a,"")||kf(a,void 0)}catch(f){kf(a,void 0)}else kf(a);Ch(!0,c)}
function uh(){var a=yh().nonce;if(!a){a:{if(window.crypto&&window.crypto.getRandomValues)try{var b=Array(16),c=new Uint8Array(16);window.crypto.getRandomValues(c);for(a=0;a<b.length;a++)b[a]=c[a];var d=b;break a}catch(e){}d=Array(16);for(b=0;16>b;b++){c=x();for(a=0;a<c%23;a++)d[b]=Math.random();d[b]=Math.floor(256*Math.random())}if(mh)for(b=1,c=0;c<mh.length;c++)d[b%16]=d[b%16]^d[(b-1)%16]/4^mh.charCodeAt(c),b++}b=[];for(c=0;c<d.length;c++)b.push("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_".charAt(d[c]&
63));a=b.join("");yh().nonce=a}return a}
function sh(){return yh().tick}
function th(){var a=yh();"gel"in a||(a.gel={});return a.gel}
function yh(){return t("ytcsi.data_")||Ah()}
function Ah(){var a={tick:{},info:{}};r("ytcsi.data_",a,void 0);return a}
function Ch(a,b){r("yt.timing."+(b||"")+"pingSent_",a,void 0)}
function Dh(){var a=sh(),b=a.pbr,c=a.vc,a=a.pbs;return b&&c&&a&&b<c&&c<a&&1==yh().info.yt_pvis}
;function Eh(a,b){P.call(this);this.B=this.l=a;this.U=b;this.D=!1;this.g={};this.aa=this.T=null;this.V=new R;rd(this,w(sd,this.V));this.j={};this.L=this.ba=this.i=this.ia=this.b=null;this.X=!1;this.M=this.C=this.w=this.R=null;this.ca={};this.Da=["onReady"];this.Y=new Fg(this);rd(this,w(sd,this.Y));this.ga=null;this.pa=NaN;this.Z={};Fh(this);this.G("onDetailedError",v(this.Ta,this));this.G("onTabOrderChange",v(this.Fa,this));this.G("onTabAnnounce",v(this.qa,this));this.G("WATCH_LATER_VIDEO_ADDED",v(this.Ua,
this));this.G("WATCH_LATER_VIDEO_REMOVED",v(this.Va,this));ub||(this.G("onMouseWheelCapture",v(this.Ra,this)),this.G("onMouseWheelRelease",v(this.Sa,this)));this.G("onAdAnnounce",v(this.qa,this));this.N=new Fg(this);rd(this,w(sd,this.N));this.ha=!1;this.fa=null}
z(Eh,P);var Gh=["drm.unavailable","fmt.noneavailable","html5.missingapi","html5.unsupportedads","html5.unsupportedlive"];l=Eh.prototype;l.oa=function(a,b){this.f||(Hh(this,a),Ih(this,b),this.D&&Jh(this))};
function Hh(a,b){a.ia=b;a.b=Eg(b);a.i=a.b.attrs.id||a.i;"video-player"==a.i&&(a.i=a.U,a.b.attrs.id=a.U);a.B.id==a.i&&(a.i+="-player",a.b.attrs.id=a.i);a.b.args.enablejsapi="1";a.b.args.playerapiid=a.U;a.ba||(a.ba=Kh(a,a.b.args.jsapicallback||"onYouTubePlayerReady"));a.b.args.jsapicallback=null;var c=a.b.attrs.width;c&&(a.B.style.width=Sb(Number(c)||c));if(c=a.b.attrs.height)a.B.style.height=Sb(Number(c)||c)}
l.Ia=function(){return this.ia};
function Jh(a){a.b.loaded||(a.b.loaded=!0,"0"!=a.b.args.autoplay?a.g.loadVideoByPlayerVars(a.b.args):a.g.cueVideoByPlayerVars(a.b.args))}
function Lh(a){var b=a.b&&a.b.args&&a.b.args.fflags;if(b&&0<=b.indexOf("web_player_disable_flash=true"))return!1;if(!p(a.b.disable.flash)){var b=a.b.disable;var c=Jg(Ig.getInstance(),a.b.minVersion);b.flash=!c}return!a.b.disable.flash}
function Mh(a,b){var c;(c=!b)||(c=5!=(Pg[b.errorCode]||5)?!1:(c=a.b&&a.b.args&&a.b.args.fflags)&&0<=c.indexOf("web_player_disable_flash_fallback=true")?!1:-1!=Gh.indexOf(b.errorCode));if(c&&Lh(a)){(c=Nh(a))&&c.stopVideo&&c.stopVideo();var d=a.b;c&&c.getUpdatedConfigurationData&&(c=c.getUpdatedConfigurationData(),d=Dg(c));d.args.autoplay=1;d.args.html5_unavailable="1";Hh(a,d);Ih(a,"flash")}}
function Ih(a,b){if(!a.f){if(!b){var c;if(!(c=!a.b.html5&&Lh(a))){if(!p(a.b.disable.html5)){c=!0;void 0!=a.b.args.deviceHasDisplay&&(c=a.b.args.deviceHasDisplay);if(2.2==Qg)var d=!0;else{a:{var e=c;c=t("yt.player.utils.videoElement_");c||(c=document.createElement("VIDEO"),r("yt.player.utils.videoElement_",c,void 0));try{if(c.canPlayType)for(var e=e?Yg:Zg,f=0;f<e.length;f++)if(c.canPlayType(e[f])){d=null;break a}d="fmt.noneavailable"}catch(g){d="html5.missingapi"}}d=!d}d&&(d=Oh(a)||a.b.assets.js);
a.b.disable.html5=!d;d||(a.b.args.html5_unavailable="1")}c=!!a.b.disable.html5}b=c?Lh(a)?"flash":"unsupported":"html5"}("flash"==b?a.lb:a.mb).call(a)}}
function Oh(a){var b=!0,c=Nh(a);c&&a.b&&(a=a.b,b=te(c,"version")==a.assets.js);return b&&!!t("yt.player.Application.create")}
l.mb=function(){if(!this.X){var a=Oh(this);if(a&&"html5"==Ph(this))this.L="html5",this.D||this.P();else if(Qh(this),this.L="html5",a&&this.w)this.l.appendChild(this.w),this.P();else{this.b.loaded=!0;var b=!1;this.R=v(function(){b=!0;var a=this.l,d=Eg(this.b);t("yt.player.Application.create")(a,d);this.P()},this);
this.X=!0;a?this.R():(Ne(this.b.assets.js,this.R),Lg(this.b.assets.css),Rh(this)&&!b&&r("yt.player.Application.create",null,void 0))}}};
l.lb=function(){var a=Eg(this.b);if(!this.C){var b=Nh(this);b&&(this.C=document.createElement("SPAN"),this.C.tabIndex=0,Gg(this.Y,this.C,"focus",this.ua),this.M=document.createElement("SPAN"),this.M.tabIndex=0,Gg(this.Y,this.M,"focus",this.ua),b.parentNode&&b.parentNode.insertBefore(this.C,b),b.parentNode&&b.parentNode.insertBefore(this.M,b.nextSibling))}a.attrs.width=a.attrs.width||"100%";a.attrs.height=a.attrs.height||"100%";if("flash"==Ph(this))this.L="flash",this.D||this.P();else{Qh(this);this.L=
"flash";this.b.loaded=!0;var b=Ig.getInstance(),c=(-1<b.i.indexOf("Gnash")&&-1==b.i.indexOf("AVM2")||9==b.b&&1==b.f||9==b.b&&0==b.f&&1==b.g?0:9<=b.b)||-1<navigator.userAgent.indexOf("Sony/COM2")&&!Jg(b,9,1,58)?a.url:a.urlV9As2;window!=window.top&&document.referrer&&(a.args.framer=document.referrer.substring(0,128));b=this.l;if(c){var b=q(b)?Mb(b):b,d=Ja(a.attrs);d.tabindex=0;var e=Ja(a.params);e.flashvars=Wb(a.args);if(ne){d.classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000";e.movie=c;var a=document.createElement("object");
for(g in d)a.setAttribute(g,d[g]);for(var f in e){var g=document.createElement("param");g.setAttribute("name",f);g.setAttribute("value",e[f]);a.appendChild(g)}}else{d.type="application/x-shockwave-flash";d.src=c;a=document.createElement("embed");a.setAttribute("name",d.id);for(var h in d)a.setAttribute(h,d[h]);for(var k in e)a.setAttribute(k,e[k])}f=document.createElement("div");f.appendChild(a);b.innerHTML=f.innerHTML}this.P()}};
l.ua=function(){Nh(this).focus()};
function Nh(a){var b=Mb(a.i);!b&&a.B&&a.B.querySelector&&(b=a.B.querySelector("#"+a.i));return b}
l.P=function(){if(!this.f){var a=Nh(this),b=!1;try{a&&a.getApiInterface&&a.getApiInterface()&&(b=!0)}catch(f){}if(b)if(this.X=!1,a.isNotServable&&a.isNotServable(this.b.args.video_id))Mh(this);else{Fh(this);this.D=!0;a=Nh(this);a.addEventListener&&(this.T=Sh(this,a,"addEventListener"));a.removeEventListener&&(this.aa=Sh(this,a,"removeEventListener"));for(var b=a.getApiInterface(),b=b.concat(a.getInternalApiInterface()),c=0;c<b.length;c++){var d=b[c];this.g[d]||(this.g[d]=Sh(this,a,d))}for(var e in this.j)this.T(e,
this.j[e]);Jh(this);this.ba&&this.ba(this.g);this.V.W("onReady",this.g)}else this.pa=W(v(this.P,this),50)}};
function Sh(a,b,c){var d=b[c];return function(){try{return a.ga=null,d.apply(b,arguments)}catch(e){"Bad NPObject as private data!"!=e.message&&"sendAbandonmentPing"!=c&&(e.message+=" ("+c+")",a.ga=e,U(e,"WARNING"))}}}
function Fh(a){a.D=!1;if(a.aa)for(var b in a.j)a.aa(b,a.j[b]);for(var c in a.Z)window.clearTimeout(parseInt(c,10));a.Z={};a.T=null;a.aa=null;for(var d in a.g)a.g[d]=null;a.g.addEventListener=v(a.G,a);a.g.removeEventListener=v(a.bb,a);a.g.destroy=v(a.dispose,a);a.g.getLastError=v(a.Ja,a);a.g.getPlayerType=v(a.Ka,a);a.g.getCurrentVideoConfig=v(a.Ia,a);a.g.loadNewVideoConfig=v(a.oa,a);a.g.isReady=v(a.nb,a)}
l.nb=function(){return this.D};
l.G=function(a,b){if(!this.f){var c=Kh(this,b);if(c){if(!(0<=wa(this.Da,a)||this.j[a])){var d=Th(this,a);this.T&&this.T(a,d)}this.V.subscribe(a,c);"onReady"==a&&this.D&&W(w(c,this.g),0)}}};
l.bb=function(a,b){if(!this.f){var c=Kh(this,b);c&&$d(this.V,a,c)}};
function Kh(a,b){var c=b;if("string"==typeof b){if(a.ca[b])return a.ca[b];c=function(){var a=t(b);a&&a.apply(n,arguments)};
a.ca[b]=c}return c?c:null}
function Th(a,b){var c="ytPlayer"+b+a.U;a.j[b]=c;n[c]=function(c){var d=W(function(){if(!a.f){a.V.W(b,c);var e=a.Z,g=String(d);g in e&&delete e[g]}},0);
Ia(a.Z,String(d))};
return c}
l.Fa=function(a){a=a?Ob:Nb;for(var b=a(document.activeElement);b&&(1!=b.nodeType||b==this.C||b==this.M||(b.focus(),b!=document.activeElement));)b=a(b)};
l.qa=function(a){De("a11y-announce",a)};
l.Ta=function(a){Mh(this,a)};
l.Ua=function(a){De("WATCH_LATER_VIDEO_ADDED",a)};
l.Va=function(a){De("WATCH_LATER_VIDEO_REMOVED",a)};
l.Ra=function(){if(!this.ha){if(yb){var a=document,b=a.scrollingElement?a.scrollingElement:eb||"CSS1Compat"!=a.compatMode?a.body||a.documentElement:a.documentElement,a=a.parentWindow||a.defaultView;this.fa=bb&&rb("10")&&a.pageYOffset!=b.scrollTop?new Ca(b.scrollLeft,b.scrollTop):new Ca(a.pageXOffset||b.scrollLeft,a.pageYOffset||b.scrollTop);Gg(this.N,window,"scroll",this.Ya);Gg(this.N,this.l,"touchmove",this.Xa)}else Gg(this.N,this.l,"mousewheel",this.va),Gg(this.N,this.l,"wheel",this.va);this.ha=
!0}};
l.Sa=function(){Hg(this.N);this.ha=!1};
l.va=function(a){a=a||window.event;a.returnValue=!1;a.preventDefault&&a.preventDefault()};
l.Ya=function(){window.scrollTo(this.fa.b,this.fa.f)};
l.Xa=function(a){a.preventDefault()};
l.Ka=function(){return this.L||Ph(this)};
l.Ja=function(){return this.ga};
function Ph(a){return(a=Nh(a))?"div"==a.tagName.toLowerCase()?"html5":"flash":null}
function Qh(a){rh("dcp");a.cancel();Fh(a);a.L=null;a.b&&(a.b.loaded=!1);var b=Nh(a);"html5"==Ph(a)?Oh(a)||!Rh(a)?a.w=b:(b&&b.destroy&&b.destroy(),a.w=null):b&&b.destroy&&b.destroy();for(var b=a.l,c;c=b.firstChild;)b.removeChild(c);Hg(a.Y);a.C=null;a.M=null}
l.cancel=function(){this.R&&Me(this.b.assets.js,this.R);window.clearTimeout(this.pa);this.X=!1};
l.o=function(){Qh(this);if(this.w&&this.b&&this.w.destroy)try{this.w.destroy()}catch(b){U(b)}this.ca=null;for(var a in this.j)n[this.j[a]]=null;this.ia=this.b=this.g=null;delete this.l;delete this.B;Eh.A.o.call(this)};
function Rh(a){return a.b&&a.b.args&&a.b.args.fflags?-1!=a.b.args.fflags.indexOf("player_destroy_old_version=true"):!1}
;var Uh={},Vh="player_uid_"+(1E9*Math.random()>>>0);function Wh(a){var b="player",b=q(b)?Mb(b):b;a=Dg(a);var c=Vh+"_"+(b[na]||(b[na]=++oa)),d=Uh[c];if(d)return d.oa(a),d.g;d=new Eh(b,c);Uh[c]=d;De("player-added",d.g);rd(d,w(Xh,d));W(function(){d.oa(a)},0);
return d.g}
function Xh(a){Uh[a.U]=null}
;function Yh(a,b,c){if(ma(a)){b="endSeconds startSeconds mediaContentUrl suggestedQuality videoId two_stage_token".split(" ");c={};for(var d=0;d<b.length;d++){var e=b[d];a[e]&&(c[e]=a[e])}return c}return{videoId:a,startSeconds:b,suggestedQuality:c}}
function Zh(a,b,c){q(a)&&(a={mediaContentUrl:a,startSeconds:b,suggestedQuality:c});b=/\/([ve]|embed)\/([^#?]+)/.exec(a.mediaContentUrl);a.videoId=b&&b[2]?b[2]:null;return Yh(a)}
function $h(a,b,c,d){if(ma(a)&&!ja(a)){b="playlist list listType index startSeconds suggestedQuality".split(" ");c={};for(d=0;d<b.length;d++){var e=b[d];a[e]&&(c[e]=a[e])}return c}b={index:b,startSeconds:c,suggestedQuality:d};q(a)&&16==a.length?b.list="PL"+a:b.playlist=a;return b}
function ai(a){var b=a.video_id||a.videoId;if(q(b)){var c=bg()||{},d=bg()||{};p(void 0)?d[b]=void 0:delete d[b];var e=x()+3E5,f=dg;if(f&&window.JSON){q(d)||(d=JSON.stringify(d,void 0));try{f.set("yt-player-two-stage-token",d,e)}catch(g){f.remove("yt-player-two-stage-token")}}(b=c[b])&&(a.two_stage_token=b)}}
function bi(a){return(0==a.search("cue")||0==a.search("load"))&&"loadModule"!=a}
;function ci(a){P.call(this);this.g=a;this.g.subscribe("command",this.ya,this);this.i={};this.j=!1}
z(ci,P);l=ci.prototype;l.start=function(){this.j||this.f||(this.j=!0,di(this.g,"RECEIVING"))};
l.ya=function(a,b){if(this.j&&!this.f){var c=b||{};switch(a){case "addEventListener":if(q(c.event)&&(c=c.event,!(c in this.i))){var d=v(this.eb,this,c);this.i[c]=d;this.addEventListener(c,d)}break;case "removeEventListener":q(c.event)&&ei(this,c.event);break;default:this.b.isReady()&&this.b[a]&&(c=fi(a,b||{}),c=this.b[a].apply(this.b,c),(c=gi(a,c))&&this.j&&!this.f&&di(this.g,a,c))}}};
l.eb=function(a,b){this.j&&!this.f&&di(this.g,a,this.ja(a,b))};
l.ja=function(a,b){if(null!=b)return{value:b}};
function ei(a,b){b in a.i&&(a.removeEventListener(b,a.i[b]),delete a.i[b])}
l.o=function(){var a=this.g;a.f||$d(a.b,"command",this.ya,this);this.g=null;for(var b in this.i)ei(this,b);ci.A.o.call(this)};function hi(a,b){ci.call(this,b);this.b=a;this.start()}
z(hi,ci);hi.prototype.addEventListener=function(a,b){this.b.addEventListener(a,b)};
hi.prototype.removeEventListener=function(a,b){this.b.removeEventListener(a,b)};
function fi(a,b){switch(a){case "loadVideoById":return b=Yh(b),ai(b),[b];case "cueVideoById":return b=Yh(b),ai(b),[b];case "loadVideoByPlayerVars":return ai(b),[b];case "cueVideoByPlayerVars":return ai(b),[b];case "loadPlaylist":return b=$h(b),ai(b),[b];case "cuePlaylist":return b=$h(b),ai(b),[b];case "seekTo":return[b.seconds,b.allowSeekAhead];case "playVideoAt":return[b.index];case "setVolume":return[b.volume];case "setPlaybackQuality":return[b.suggestedQuality];case "setPlaybackRate":return[b.suggestedRate];
case "setLoop":return[b.loopPlaylists];case "setShuffle":return[b.shufflePlaylist];case "getOptions":return[b.module];case "getOption":return[b.module,b.option];case "setOption":return[b.module,b.option,b.value];case "handleGlobalKeyDown":return[b.keyCode,b.shiftKey]}return[]}
function gi(a,b){switch(a){case "isMuted":return{muted:b};case "getVolume":return{volume:b};case "getPlaybackRate":return{playbackRate:b};case "getAvailablePlaybackRates":return{availablePlaybackRates:b};case "getVideoLoadedFraction":return{videoLoadedFraction:b};case "getPlayerState":return{playerState:b};case "getCurrentTime":return{currentTime:b};case "getPlaybackQuality":return{playbackQuality:b};case "getAvailableQualityLevels":return{availableQualityLevels:b};case "getDuration":return{duration:b};
case "getVideoUrl":return{videoUrl:b};case "getVideoEmbedCode":return{videoEmbedCode:b};case "getPlaylist":return{playlist:b};case "getPlaylistIndex":return{playlistIndex:b};case "getOptions":return{options:b};case "getOption":return{option:b}}}
hi.prototype.ja=function(a,b){switch(a){case "onReady":return;case "onStateChange":return{playerState:b};case "onPlaybackQualityChange":return{playbackQuality:b};case "onPlaybackRateChange":return{playbackRate:b};case "onError":return{errorCode:b}}return hi.A.ja.call(this,a,b)};
hi.prototype.o=function(){hi.A.o.call(this);delete this.b};function ii(a,b,c,d){P.call(this);this.g=b||null;this.B="*";this.i=c||null;this.sessionId=null;this.channel=d||null;this.D=!!a;this.w=v(this.C,this);window.addEventListener("message",this.w)}
aa(ii,P);
ii.prototype.C=function(a){if(!("*"!=this.i&&a.origin!=this.i||this.g&&a.source!=this.g)&&q(a.data)){try{var b=Ad(a.data)}catch(c){return}if(!(null==b||this.D&&(this.sessionId&&this.sessionId!=b.id||this.channel&&this.channel!=b.channel))&&b)switch(b.event){case "listening":"null"!=a.origin?this.i=this.B=a.origin:U(Error("MessageEvent origin is null"),"WARNING");this.g=a.source;this.sessionId=b.id;this.b&&(this.b(),this.b=null);break;case "command":this.j&&(this.l&&!(0<=wa(this.l,b.func))||this.j(b.func,
b.args))}}};
ii.prototype.sendMessage=function(a,b){var c=b||this.g;if(c){this.sessionId&&(a.id=this.sessionId);this.channel&&(a.channel=this.channel);try{var d=Bd(a);c.postMessage(d,this.B)}catch(e){U(e,"WARNING")}}};
ii.prototype.o=function(){window.removeEventListener("message",this.w);P.prototype.o.call(this)};function ji(a,b,c){ii.call(this,a,b,c||T("POST_MESSAGE_ORIGIN",void 0)||window.document.location.protocol+"//"+window.document.location.hostname,"widget");this.l=this.b=this.j=null}
aa(ji,ii);function ki(){var a=!!T("WIDGET_ID_ENFORCE"),a=this.f=new ji(a),b=v(this.ab,this);a.j=b;a.l=null;this.f.channel="widget";if(a=T("WIDGET_ID"))this.f.sessionId=a;this.i=[];this.l=!1;this.j={}}
l=ki.prototype;l.ab=function(a,b){if("addEventListener"==a&&b){var c=b[0];this.j[c]||"onReady"==c||(this.addEventListener(c,li(this,c)),this.j[c]=!0)}else this.Ba(a,b)};
l.Ba=function(){};
function li(a,b){return v(function(a){this.sendMessage(b,a)},a)}
l.addEventListener=function(){};
l.Ha=function(){this.l=!0;this.sendMessage("initialDelivery",this.ka());this.sendMessage("onReady");D(this.i,this.Aa,this);this.i=[]};
l.ka=function(){return null};
function mi(a,b){a.sendMessage("infoDelivery",b)}
l.Aa=function(a){this.l?this.f.sendMessage(a):this.i.push(a)};
l.sendMessage=function(a,b){this.Aa({event:a,info:void 0==b?null:b})};
l.dispose=function(){this.f=null};function ni(a){ki.call(this);this.b=a;this.g=[];this.addEventListener("onReady",v(this.Wa,this));this.addEventListener("onVideoProgress",v(this.ib,this));this.addEventListener("onVolumeChange",v(this.jb,this));this.addEventListener("onApiChange",v(this.cb,this));this.addEventListener("onPlaybackQualityChange",v(this.fb,this));this.addEventListener("onPlaybackRateChange",v(this.gb,this));this.addEventListener("onStateChange",v(this.hb,this))}
z(ni,ki);l=ni.prototype;l.Ba=function(a,b){if(this.b[a]){b=b||[];if(0<b.length&&bi(a)){var c=b;if(ma(c[0])&&!ja(c[0]))c=c[0];else{var d={};switch(a){case "loadVideoById":case "cueVideoById":d=Yh.apply(window,c);break;case "loadVideoByUrl":case "cueVideoByUrl":d=Zh.apply(window,c);break;case "loadPlaylist":case "cuePlaylist":d=$h.apply(window,c)}c=d}ai(c);b.length=1;b[0]=c}this.b[a].apply(this.b,b);bi(a)&&mi(this,this.ka())}};
l.Wa=function(){var a=v(this.Ha,this);this.f.b=a};
l.addEventListener=function(a,b){this.g.push({eventType:a,listener:b});this.b.addEventListener(a,b)};
l.ka=function(){if(!this.b)return null;var a=this.b.getApiInterface();za(a,"getVideoData");for(var b={apiInterface:a},c=0,d=a.length;c<d;c++){var e=a[c],f=e;if(0==f.search("get")||0==f.search("is")){var f=e,g=0;0==f.search("get")?g=3:0==f.search("is")&&(g=2);f=f.charAt(g).toLowerCase()+f.substr(g+1);try{var h=this.b[e]();b[f]=h}catch(k){}}}b.videoData=this.b.getVideoData();b.currentTimeLastUpdated_=x()/1E3;return b};
l.hb=function(a){a={playerState:a,currentTime:this.b.getCurrentTime(),duration:this.b.getDuration(),videoData:this.b.getVideoData(),videoStartBytes:0,videoBytesTotal:this.b.getVideoBytesTotal(),videoLoadedFraction:this.b.getVideoLoadedFraction(),playbackQuality:this.b.getPlaybackQuality(),availableQualityLevels:this.b.getAvailableQualityLevels(),videoUrl:this.b.getVideoUrl(),playlist:this.b.getPlaylist(),playlistIndex:this.b.getPlaylistIndex(),currentTimeLastUpdated_:x()/1E3,playbackRate:this.b.getPlaybackRate(),
mediaReferenceTime:this.b.getMediaReferenceTime()};this.b.getProgressState&&(a.progressState=this.b.getProgressState());this.b.getStoryboardFormat&&(a.storyboardFormat=this.b.getStoryboardFormat());mi(this,a)};
l.fb=function(a){mi(this,{playbackQuality:a})};
l.gb=function(a){mi(this,{playbackRate:a})};
l.cb=function(){for(var a=this.b.getOptions(),b={namespaces:a},c=0,d=a.length;c<d;c++){var e=a[c],f=this.b.getOptions(e);b[e]={options:f};for(var g=0,h=f.length;g<h;g++){var k=f[g],m=this.b.getOption(e,k);b[e][k]=m}}this.sendMessage("apiInfoDelivery",b)};
l.jb=function(){mi(this,{muted:this.b.isMuted(),volume:this.b.getVolume()})};
l.ib=function(a){a={currentTime:a,videoBytesLoaded:this.b.getVideoBytesLoaded(),videoLoadedFraction:this.b.getVideoLoadedFraction(),currentTimeLastUpdated_:x()/1E3,playbackRate:this.b.getPlaybackRate(),mediaReferenceTime:this.b.getMediaReferenceTime()};this.b.getProgressState&&(a.progressState=this.b.getProgressState());mi(this,a)};
l.dispose=function(){ni.A.dispose.call(this);for(var a=0;a<this.g.length;a++){var b=this.g[a];this.b.removeEventListener(b.eventType,b.listener)}this.g=[]};function oi(){P.call(this);this.b=new R;rd(this,w(sd,this.b))}
z(oi,P);oi.prototype.subscribe=function(a,b,c){return this.f?0:this.b.subscribe(a,b,c)};
oi.prototype.K=function(a){return this.f?!1:this.b.K(a)};
oi.prototype.l=function(a,b){this.f||this.b.W.apply(this.b,arguments)};function pi(a,b,c){oi.call(this);this.g=a;this.i=b;this.j=c}
z(pi,oi);function di(a,b,c){if(!a.f){var d=a.g;d.f||a.i!=d.b||(a={id:a.j,command:b},c&&(a.data=c),d.b.postMessage(Bd(a),d.i))}}
pi.prototype.o=function(){this.i=this.g=null;pi.A.o.call(this)};function qi(a,b,c){P.call(this);this.b=a;this.i=c;this.j=Cf(window,"message",v(this.l,this));this.g=new pi(this,a,b);rd(this,w(sd,this.g))}
z(qi,P);qi.prototype.l=function(a){var b;if(b=!this.f)if(b=a.origin==this.i)a:{b=this.b;do{b:{var c=a.source;do{if(c==b){c=!0;break b}if(c==c.parent)break;c=c.parent}while(null!=c);c=!1}if(c){b=!0;break a}b=b.opener}while(null!=b);b=!1}if(b&&(a=a.data,q(a))){try{a=Ad(a)}catch(d){return}a.command&&(b=this.g,b.f||b.l("command",a.command,a.data))}};
qi.prototype.o=function(){Df(this.j);this.b=null;qi.A.o.call(this)};function ri(){var a=Ja(si);return new Q(function(b,c){a.J=function(a){Ve(a)?b(a):c(new ti("Request failed, status="+a.status,"net.badstatus"))};
a.onError=function(){c(new ti("Unknown request error","net.unknown"))};
a.O=function(){c(new ti("Request timed out","net.timeout"))};
af("//googleads.g.doubleclick.net/pagead/id",a)})}
function ti(a,b){B.call(this,a+", errorCode="+b);this.errorCode=b;this.name="PromiseAjaxError"}
aa(ti,B);function ui(a){B.call(this,a.message||a.description||a.name);this.b=a instanceof Qd}
aa(ui,B);ui.prototype.name="BiscottiError";function vi(){B.call(this,"Biscotti ID is missing from server")}
aa(vi,B);vi.prototype.name="BiscottiMissingError";function wi(a,b){this.f=a;this.b=b}
wi.prototype.then=function(a,b,c){try{if(p(this.f))return a?Md(a.call(c,this.f)):Md(this.f);if(p(this.b)){if(!b)return Nd(this.b);var d=b.call(c,this.b);return!p(d)&&this.b.b?Nd(this.b):Md(d)}throw Error("Invalid Result state");}catch(e){return Nd(e)}};
Hd(wi);var si={format:"RAW",method:"GET",timeout:5E3,withCredentials:!0},xi=null;function yi(){xi||(xi=Pd(ri().then(zi),function(a){return Ai(2,a)}));
return xi}
function zi(a){a=a.responseText;if(0!=a.lastIndexOf(")]}'",0))throw new vi;a=JSON.parse(a.substr(4));if((Ea(window,"settings","experiments","flags","html5_serverside_ignore_biscotti_id_on_retry")||T("EXP_HTML5_SERVERSIDE_IGNORE_BISCOTTI_ID_ON_RETRY",!1)||V("html5_serverside_ignore_biscotti_id_on_retry"))&&1<(a.type||1))throw new vi;a=a.id;Bi(a);xi=new wi(a);Ci(18E5,2);return a}
function Ai(a,b){var c=new ui(b);Bi("");xi=new wi(void 0,c);0<a&&Ci(12E4,a-1);throw c;}
function Ci(a,b){W(function(){Pd(ri().then(zi,function(a){return Ai(b,a)}),u)},a)}
function Bi(a){r("yt.ads.biscotti.lastId_",a,void 0)}
;function Di(){}
function Ei(a){a&&!t("yt.ads.biscotti.getId_")&&r("yt.ads.biscotti.getId_",yi,void 0);try{try{var b=t("yt.ads.biscotti.getId_");var c=b?b():yi()}catch(d){c=Nd(d)}c.then(Fi,Di);W(Ei,18E5)}catch(d){U(d)}}
var Gi=0;
function Fi(a){a:{try{var b=window.top.location.href}catch(G){b=2;break a}b=null!=b?b==window.document.location.href?0:1:2}b={dt:fc,flash:Wa||"0",frm:b};b.u_tz=-(new Date).getTimezoneOffset();try{var c=A.history.length}catch(G){c=0}b.u_his=c;b.u_java=!!A.navigator&&"unknown"!==typeof A.navigator.javaEnabled&&!!A.navigator.javaEnabled&&A.navigator.javaEnabled();A.screen&&(b.u_h=A.screen.height,b.u_w=A.screen.width,b.u_ah=A.screen.availHeight,b.u_aw=A.screen.availWidth,b.u_cd=A.screen.colorDepth);A.navigator&&
A.navigator.plugins&&(b.u_nplug=A.navigator.plugins.length);A.navigator&&A.navigator.mimeTypes&&(b.u_nmime=A.navigator.mimeTypes.length);b.bid=a;b.ca_type=Va?"flash":"image";if(V("enable_server_side_search_pyv")||V("enable_server_side_mweb_search_pyv")){a=window;try{var d=a.screenX;var e=a.screenY}catch(G){}try{var f=a.outerWidth;var g=a.outerHeight}catch(G){}try{var h=a.innerWidth;var k=a.innerHeight}catch(G){}k=[a.screenLeft,a.screenTop,d,e,a.screen?a.screen.availWidth:void 0,a.screen?a.screen.availTop:
void 0,f,g,h,k];h=window.top||A;try{if(h.document&&!h.document.body)var m=new Da(-1,-1);else{var y=(h||window).document,C="CSS1Compat"==y.compatMode?y.documentElement:y.body;m=(new Da(C.clientWidth,C.clientHeight)).round()}var N=m}catch(G){N=new Da(-12245933,-12245933)}m=0;window.SVGElement&&document.createElementNS&&(m|=1);N={bc:m,bih:N.height,biw:N.width,brdim:k.join(),vis:{visible:1,hidden:2,prerender:3,preview:4}[ra.webkitVisibilityState||ra.mozVisibilityState||ra.visibilityState||""]||0,wgl:!!A.WebGLRenderingContext};
for(var ta in N)b[ta]=N[ta]}b.bsq=Gi++;gf("//www.youtube.com/ad_data_204",{La:!1,F:b})}
;function Hi(){this.b=T("ALT_PREF_COOKIE_NAME","PREF");var a=xc.get(""+this.b,void 0);if(a)for(var a=unescape(a).split("&"),b=0;b<a.length;b++){var c=a[b].split("="),d=c[0];(c=c[1])&&(Z[d]=c.toString())}}
ha(Hi);var Z=t("yt.prefs.UserPrefs.prefs_")||{};r("yt.prefs.UserPrefs.prefs_",Z,void 0);function Ii(a){if(/^f([1-9][0-9]*)$/.test(a))throw Error("ExpectedRegexMatch: "+a);}
function Ji(a){if(!/^\w+$/.test(a))throw Error("ExpectedRegexMismatch: "+a);}
function Ki(a){a=void 0!==Z[a]?Z[a].toString():null;return null!=a&&/^[A-Fa-f0-9]+$/.test(a)?parseInt(a,16):null}
Hi.prototype.get=function(a,b){Ji(a);Ii(a);var c=void 0!==Z[a]?Z[a].toString():null;return null!=c?c:b?b:""};
Hi.prototype.set=function(a,b){Ji(a);Ii(a);if(null==b)throw Error("ExpectedNotNull");Z[a]=b.toString()};
Hi.prototype.remove=function(a){Ji(a);Ii(a);delete Z[a]};
Hi.prototype.clear=function(){Z={}};var Li=null,Mi=null,Ni=null,Oi={};function Pi(a){Xf(a.payload_name,a.payload,V("enable_youtubei_innertube")?xg:tg,void 0,void 0)}
function Qi(a){var b=a.id;a=a.ve_type;var c=Jf++;a=new If(void 0,a,c,void 0,void 0);Oi[b]=a;b=hg();c=gg();b&&c&&Yf(yg(),b,c,a)}
function Ri(a){var b=a.csn;a=a.root_ve_type;if(b&&a&&(S("client-screen-nonce",b),S("ROOT_VE_TYPE",a),a=gg()))for(var c in Oi){var d=Oi[c];if(d){var e=b,f=a;Yf(yg(),e,f,d)}}}
function Si(a){Oi[a.id]=new If(a.tracking_params)}
function Ti(a){var b=hg();a=Oi[a.id];if(b&&a){var c=yg();Zf(c,{click:{csn:b,visualElement:Kf(a)}},void 0)}}
function Ui(a){a=a.ids;var b=hg();if(b){for(var c=[],d=0;d<a.length;d++){var e=Oi[a[d]];e&&c.push(e)}c.length&&$f(yg(),b,c)}}
function Vi(){var a=Li;a&&a.startInteractionLogging&&a.startInteractionLogging()}
;r("yt.setConfig",S,void 0);r("yt.config.set",S,void 0);r("yt.setMsg",qf,void 0);r("yt.msgs.set",qf,void 0);r("yt.logging.errors.log",mf,void 0);
r("writeEmbed",function(){var a=T("PLAYER_CONFIG",void 0);"1"!=a.privembed&&Ei(!0);"gvn"==a.args.ps&&(document.body.style.backgroundColor="transparent");var b=document.referrer,c=T("POST_MESSAGE_ORIGIN");window!=window.top&&b&&b!=document.URL&&(a.args.loaderUrl=b);T("LIGHTWEIGHT_AUTOPLAY")&&(a.args.autoplay="1");a.args.autoplay&&ai(a.args);Li=a=Wh(a);a.addEventListener("onScreenChanged",Ri);a.addEventListener("onLogClientVeCreated",Qi);a.addEventListener("onLogServerVeCreated",Si);a.addEventListener("onLogToGel",
Pi);a.addEventListener("onLogVeClicked",Ti);a.addEventListener("onLogVesShown",Ui);a.addEventListener("onReady",Vi);b=T("POST_MESSAGE_ID","player");T("ENABLE_JS_API")?Ni=new ni(a):T("ENABLE_POST_API")&&q(b)&&q(c)&&(Mi=new qi(window.parent,b,c),Ni=new hi(a,Mi.g));T("BG_P")&&(T("BG_I")||T("BG_IU"))&&Pe();uf()},void 0);
r("yt.www.watch.ads.restrictioncookie.spr",function(a){kf(a+"mac_204?action_fcts=1");return!0},void 0);
var Wi=qe(function(){rh("ol");var a=Hi.getInstance(),b=1<window.devicePixelRatio;if(!!((Ki("f"+(Math.floor(119/31)+1))||0)&67108864)!=b){var c="f"+(Math.floor(119/31)+1),d=Ki(c)||0,d=b?d|67108864:d&-67108865;0==d?delete Z[c]:Z[c]=d.toString(16).toString();var a=a.b,b=[],e;for(e in Z)b.push(e+"="+escape(Z[e]));xc.set(""+a,b.join("&"),63072E3,"/","youtube.com")}}),Xi=qe(function(){var a=Li;
a&&a.sendAbandonmentPing&&a.sendAbandonmentPing();T("PL_ATT")&&(Oe=null);for(var a=0,b=sf.length;a<b;a++){var c=sf[a];if(!isNaN(c)){var d=t("yt.scheduler.instance.cancelJob");d?d(c):window.clearTimeout(c)}}sf.length=0;Le("//static.doubleclick.net/instream/ad_status.js");tf=!1;S("DCLKSTAT",0);td(Ni,Mi);if(a=Li)a.removeEventListener("onScreenChanged",Ri),a.removeEventListener("onLogClientVeCreated",Qi),a.removeEventListener("onLogServerVeCreated",Si),a.removeEventListener("onLogToGel",Pi),a.removeEventListener("onLogVeClicked",
Ti),a.removeEventListener("onLogVesShown",Ui),a.removeEventListener("onReady",Vi),a.destroy();Oi={}});
window.addEventListener?(window.addEventListener("load",Wi),window.addEventListener("unload",Xi)):window.attachEvent&&(window.attachEvent("onload",Wi),window.attachEvent("onunload",Xi));}).call(this);
