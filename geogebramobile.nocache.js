function geogebramobile(){var L='',ec='\n-',sb='" for "gwt:onLoadErrorFn"',qb='" for "gwt:onPropertyErrorFn"',Tb='"<script src=\\"',eb='"><\/script>',V='#',dc=');',Xb='-\n',fc='-><\/scr',Ub='.cache.js\\"><\/scr" + "ipt>"',X='/',Kb='05AA7FFBA90767CE54D6489B6240C504',Lb='13DA80950E4A407D096DF5F91C67576B',Mb='1F6D62FB75345A82BBCEFC2574374C09',Nb='85D8D729EFD0509381F88987E4D7AB12',Qb=':',kb='::',Vb='<scr',db='<script id="',nb='=',W='?',xb='ActiveXObject',Ob='BA3A0EA56212BEC7DEB8430132183510',pb='Bad handler "',yb='ChromeTab.ChromeFrame',Hb='Cross-site hosted mode not yet implemented. See issue ',Rb='DOMContentLoaded',Pb='F93A4BDCE5EE9473DF65AC0901C3BE8F',fb='SCRIPT',cb='__gwt_marker_geogebramobile',gb='base',$='baseUrl',P='begin',O='bootstrap',wb='chromeframe',Z='clear.cache.gif',mb='content',cc='document.write(',U='end',$b='evtGroup: "loadExternalRefs", millis:(new Date()).getTime(),',ac='evtGroup: "moduleStartup", millis:(new Date()).getTime(),',Eb='gecko',Fb='gecko1_8',M='geogebramobile',ab='geogebramobile.nocache.js',jb='geogebramobile::',Q='gwt.codesvr=',R='gwt.hosted=',S='gwt.hybrid',rb='gwt:onLoadErrorFn',ob='gwt:onPropertyErrorFn',lb='gwt:property',Ib='http://code.google.com/p/google-web-toolkit/issues/detail?id=2079',Db='ie6',Cb='ie8',Bb='ie9',Y='img',gc='ipt>',Wb='ipt><!-',Sb='loadExternalRefs',hb='meta',Zb='moduleName:"geogebramobile", sessionId:window.__gwtStatsSessionId, subSystem:"startup",',T='moduleStartup',Ab='msie',ib='name',ub='opera',zb='safari',_='script',Jb='selectingPermutation',N='startup',_b='type: "end"});',bc='type: "moduleRequested"});',bb='undefined',Gb='unknown',tb='user.agent',vb='webkit',Yb='window.__gwtStatsEvent && window.__gwtStatsEvent({';var l=window,m=document,n=l.__gwtStatsEvent?function(a){return l.__gwtStatsEvent(a)}:null,o=l.__gwtStatsSessionId?l.__gwtStatsSessionId:null,p,q,r=L,s={},t=[],u=[],v=[],w=0,x,y;n&&n({moduleName:M,sessionId:o,subSystem:N,evtGroup:O,millis:(new Date).getTime(),type:P});if(!l.__gwt_stylesLoaded){l.__gwt_stylesLoaded={}}if(!l.__gwt_scriptsLoaded){l.__gwt_scriptsLoaded={}}function z(){var b=false;try{var c=l.location.search;return (c.indexOf(Q)!=-1||(c.indexOf(R)!=-1||l.external&&l.external.gwtOnLoad))&&c.indexOf(S)==-1}catch(a){}z=function(){return b};return b}
function A(){if(p&&q){p(x,M,r,w);n&&n({moduleName:M,sessionId:o,subSystem:N,evtGroup:T,millis:(new Date).getTime(),type:U})}}
function B(){function e(a){var b=a.lastIndexOf(V);if(b==-1){b=a.length}var c=a.indexOf(W);if(c==-1){c=a.length}var d=a.lastIndexOf(X,Math.min(c,b));return d>=0?a.substring(0,d+1):L}
function f(a){if(a.match(/^\w+:\/\//)){}else{var b=m.createElement(Y);b.src=a+Z;a=e(b.src)}return a}
function g(){var a=D($);if(a!=null){return a}return L}
function h(){var a=m.getElementsByTagName(_);for(var b=0;b<a.length;++b){if(a[b].src.indexOf(ab)!=-1){return e(a[b].src)}}return L}
function i(){var a;if(typeof isBodyLoaded==bb||!isBodyLoaded()){var b=cb;var c;m.write(db+b+eb);c=m.getElementById(b);a=c&&c.previousSibling;while(a&&a.tagName!=fb){a=a.previousSibling}if(c){c.parentNode.removeChild(c)}if(a&&a.src){return e(a.src)}}return L}
function j(){var a=m.getElementsByTagName(gb);if(a.length>0){return a[a.length-1].href}return L}
var k=g();if(k==L){k=h()}if(k==L){k=i()}if(k==L){k=j()}if(k==L){k=e(m.location.href)}k=f(k);r=k;return k}
function C(){var b=document.getElementsByTagName(hb);for(var c=0,d=b.length;c<d;++c){var e=b[c],f=e.getAttribute(ib),g;if(f){f=f.replace(jb,L);if(f.indexOf(kb)>=0){continue}if(f==lb){g=e.getAttribute(mb);if(g){var h,i=g.indexOf(nb);if(i>=0){f=g.substring(0,i);h=g.substring(i+1)}else{f=g;h=L}s[f]=h}}else if(f==ob){g=e.getAttribute(mb);if(g){try{y=eval(g)}catch(a){alert(pb+g+qb)}}}else if(f==rb){g=e.getAttribute(mb);if(g){try{x=eval(g)}catch(a){alert(pb+g+sb)}}}}}}
function D(a){var b=s[a];return b==null?null:b}
function E(a,b){var c=v;for(var d=0,e=a.length-1;d<e;++d){c=c[a[d]]||(c[a[d]]=[])}c[a[e]]=b}
function F(a){var b=u[a](),c=t[a];if(b in c){return b}var d=[];for(var e in c){d[c[e]]=e}if(y){y(a,d,b)}throw null}
u[tb]=function(){var c=navigator.userAgent.toLowerCase();var d=function(a){return parseInt(a[1])*1000+parseInt(a[2])};if(function(){return c.indexOf(ub)!=-1}())return ub;if(function(){return c.indexOf(vb)!=-1||function(){if(c.indexOf(wb)!=-1){return true}if(typeof window[xb]!=bb){try{var b=new ActiveXObject(yb);if(b){b.registerBhoIfNeeded();return true}}catch(a){}}return false}()}())return zb;if(function(){return c.indexOf(Ab)!=-1&&m.documentMode>=9}())return Bb;if(function(){return c.indexOf(Ab)!=-1&&m.documentMode>=8}())return Cb;if(function(){var a=/msie ([0-9]+)\.([0-9]+)/.exec(c);if(a&&a.length==3)return d(a)>=6000}())return Db;if(function(){return c.indexOf(Eb)!=-1}())return Fb;return Gb};t[tb]={gecko1_8:0,ie6:1,ie8:2,ie9:3,opera:4,safari:5};geogebramobile.onScriptLoad=function(a){geogebramobile.onScriptLoad=null;p=a;A()};if(z()){alert(Hb+Ib);return}C();B();n&&n({moduleName:M,sessionId:o,subSystem:N,evtGroup:O,millis:(new Date).getTime(),type:Jb});var G;try{E([Db],Kb);E([ub],Lb);E([zb],Mb);E([Bb],Nb);E([Fb],Ob);E([Cb],Pb);G=v[F(tb)];var H=G.indexOf(Qb);if(H!=-1){w=Number(G.substring(H+1));G=G.substring(0,H)}}catch(a){return}var I;function J(){if(!q){q=true;A();if(m.removeEventListener){m.removeEventListener(Rb,J,false)}if(I){clearInterval(I)}}}
if(m.addEventListener){m.addEventListener(Rb,function(){J()},false)}var I=setInterval(function(){if(/loaded|complete/.test(m.readyState)){J()}},50);n&&n({moduleName:M,sessionId:o,subSystem:N,evtGroup:O,millis:(new Date).getTime(),type:U});n&&n({moduleName:M,sessionId:o,subSystem:N,evtGroup:Sb,millis:(new Date).getTime(),type:P});var K=Tb+r+G+Ub;m.write(Vb+Wb+Xb+Yb+Zb+$b+_b+Yb+Zb+ac+bc+cc+K+dc+ec+fc+gc)}
geogebramobile();
