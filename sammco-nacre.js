/* ───────────────────────────────────────────────
   SAMMCO 자개 은하 원판 (앨범 CD 전용 · 지금은 윷놀이만 discFx:'nacre')
   "자개 은하 원판 작업대"에서 확정한 그림 방식·값을 그대로 옮겼어요.
   - 밝기 경사로 상감 입체(법선)를 만들고, 기울기에 따라 자개 무지갯빛이 흘러요.
   - 자개 조각마다 기울기가 달라 각자 다른 순간에 번쩍여요. 별은 저절로 반짝여요.
   - 옻칠 광택 띠와 테두리 빛은 케이스가 기울면 미끄러져요. 원판 그림 자체는 돌지 않아요.
   - 빛은 왼쪽 위에 고정. 디스크가 돌아도 빛은 그대로, 그림만 돌아요.
   - WebGL 이 안 되는 기기에서는 원래 그림(라벨)만 보여요.
   값(작업대 확정): 무지갯빛 60 · 자개 범위 30 · 반짝임 13 · 입체감 40 · 옻칠 광택 60 · 별 반짝임 82 · 기울기 11 (은하 회전은 앨범에서 0)
─────────────────────────────────────────────── */
(function(){
  /* 은하 흐름(swirl)은 앨범에서 끔: 원판은 멈춰 있고, 앨범이 움직일 때 빛만 반응 (2026-10-14 결정 · 작업대 값은 25) */
  var DEF={iri:60,thr:30,spark:13,relief:40,gloss:60,twk:82,swirl:0,tiltMax:11};
  var VS='attribute vec2 aP;varying vec2 vUv;void main(){vUv=aP*.5+.5;vUv.y=1.-vUv.y;gl_Position=vec4(aP,0.,1.);}';
  var FS=[
  'precision highp float;varying vec2 vUv;uniform sampler2D uTex;uniform vec2 uTilt;uniform float uIri,uThr,uSpark,uRelief,uGloss,uTwk,uSwirl,uTime,uRot;',
  'float hs(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
  'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hs(i),hs(i+vec2(1,0)),f.x),mix(hs(i+vec2(0,1)),hs(i+vec2(1,1)),f.x),f.y);}',
  'void main(){',
  '  vec2 p=vUv*2.-1.;float r=length(p);if(r>1.)discard;float edge=smoothstep(1.,.992,r);',
  /* 디스크 회전: 화면 기준 위치(pw)와 디스크 기준 빛 방향을 따로 계산 */
  '  float rc=cos(uRot),rs=sin(uRot);vec2 pw=vec2(rc*p.x-rs*p.y,rs*p.x+rc*p.y);',
  /* 은하 흐름: 가운데로 갈수록 아주 천천히 돌아감 */
  '  float ang=uSwirl*.06*uTime*smoothstep(.75,0.,r)*(1.-r*.6);float cs=cos(ang),sn=sin(ang);',
  '  vec2 q=vec2(cs*p.x-sn*p.y,sn*p.x+cs*p.y);vec2 uv=r<.75?q*.5+.5:vUv;',
  '  vec3 alb=texture2D(uTex,uv).rgb;',
  '  float lum=dot(alb,vec3(.3,.55,.15));float mx=max(alb.r,max(alb.g,alb.b)),mn=min(alb.r,min(alb.g,alb.b)),sat=(mx-mn)/(mx+.001);',
  '  float nm=smoothstep(uThr,uThr+.25,lum);',
  /* 상감 입체: 밝기 경사로 만든 법선 */
  '  float d=1./1024.;float lx=dot(texture2D(uTex,uv+vec2(d,0.)).rgb-texture2D(uTex,uv-vec2(d,0.)).rgb,vec3(.33));float ly=dot(texture2D(uTex,uv+vec2(0.,d)).rgb-texture2D(uTex,uv-vec2(0.,d)).rgb,vec3(.33));',
  '  vec3 N=normalize(vec3(-lx*6.*uRelief,ly*6.*uRelief,1.));',
  /* 판 기울기 → 빛이 닿는 방향 (빛은 왼쪽 위 고정, 디스크가 돈 만큼 되돌려 계산) */
  '  vec3 L=normalize(vec3(-.5-uTilt.x*.9,.6+uTilt.y*.9,.7));L.xy=vec2(rc*L.x-rs*L.y,rs*L.x+rc*L.y);vec3 Vv=vec3(0.,0.,1.);vec3 H=normalize(L+Vv);',
  '  float diff=clamp(dot(N,L),0.,1.);',
  '  float ph=lum*2.1+dot(N.xy,vec2(1.4,-1.1))+uTilt.x*.9-uTilt.y*.7+vn(uv*7.)*.7;',
  '  vec3 iri=.5+.5*cos(6.2832*(vec3(0.,.33,.67)+ph));',
  '  vec3 c=alb*(.72+.38*diff);',
  '  c=mix(c,c*(.55+.9*iri)+iri*.07,nm*uIri*.9);',
  /* 조각 반짝임: 자개 조각마다 기울기가 달라 각자 다른 순간에 번쩍임 */
  '  vec2 cell=floor(uv*70.);vec2 tn=vec2(hs(cell),hs(cell+7.1))-.5;vec3 Nc=normalize(vec3(tn*.9,1.));',
  '  float g=pow(max(dot(Nc,H),0.),180.)*nm;c+=g*uSpark*2.2*mix(vec3(1.),iri,.4);',
  /* 별 반짝임: 작고 하얀 점만 */
  '  float star=smoothstep(.62,.9,lum)*(1.-smoothstep(.15,.4,sat));float tw=.5+.5*sin(uTime*(1.5+hs(cell)*3.)+hs(cell+3.3)*6.28);c+=star*tw*tw*uTwk*.6;',
  /* 옻칠 광택: 판이 기울면 미끄러지는 넓은 반사 띠 (화면 기준이라 디스크가 돌아도 제자리) */
  '  float t=(pw.x+pw.y)*.25+.5;float P0=.42-(uTilt.x+uTilt.y)*.34;',
  '  c+=vec3(1.,.97,.92)*(exp(-pow((t-P0)/.16,2.))*.12+exp(-pow((t-P0-.07)/.025,2.))*.08)*uGloss*(1.-nm*.4);',
  /* 테두리 빛 */
  '  c+=vec3(1.,.96,.9)*smoothstep(.965,.995,r)*(.15+.25*max(0.,dot(normalize(pw),normalize(vec2(-1.,-1.)-uTilt))))*uGloss;',
  '  c=c/(1.+c*.18);gl_FragColor=vec4(c,edge);}'].join('\n');

  var reduce=false;try{reduce=matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){}

  /* host 안에 원판 캔버스를 만들어요. 실패하면 null
     draw(기울기x, 기울기y, 디스크회전(라디안), 시간(초)) — 기울기는 작업대와 같은 -1~1 범위 */
  window.SAMMCO_NACRE={DEF:DEF,make:function(host,url,onReady,vals){
    var V={},k;for(k in DEF)V[k]=DEF[k];if(vals)for(k in vals)V[k]=vals[k];
    var w=host.clientWidth||300,S=Math.max(320,Math.min(900,Math.round(w*Math.min(2,window.devicePixelRatio||1))));
    var cv=document.createElement('canvas');cv.className='ncv';cv.width=cv.height=S;
    var gl=null;try{gl=cv.getContext('webgl',{antialias:true,alpha:true,premultipliedAlpha:false})}catch(e){}
    if(!gl)return null;
    function sh(t,src){var o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);return gl.getShaderParameter(o,gl.COMPILE_STATUS)?o:null}
    var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return null;
    var P=gl.createProgram();gl.attachShader(P,vs);gl.attachShader(P,fs);gl.linkProgram(P);if(!gl.getProgramParameter(P,gl.LINK_STATUS))return null;
    gl.useProgram(P);
    var bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,1,1,-1,-1,1,1,-1,1]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(P,'aP');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    function U(n){return gl.getUniformLocation(P,n)}
    var uTilt=U('uTilt'),uTime=U('uTime'),uRot=U('uRot');
    gl.uniform1f(U('uIri'),V.iri/100);gl.uniform1f(U('uThr'),V.thr/100);gl.uniform1f(U('uSpark'),V.spark/100);gl.uniform1f(U('uRelief'),V.relief/100);
    gl.uniform1f(U('uGloss'),V.gloss/100);gl.uniform1f(U('uTwk'),V.twk/100);gl.uniform1f(U('uSwirl'),V.swirl/100);gl.uniform1i(U('uTex'),0);
    var ready=false,img=new Image();
    img.onload=function(){try{
      var t=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      ready=true;api.draw(0,0,0,0);if(onReady)onReady()}catch(e){}};
    img.src=url;host.appendChild(cv);
    var api={canvas:cv,tiltMax:V.tiltMax,
      draw:function(tx,ty,rot,time){if(!ready)return;gl.viewport(0,0,S,S);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uTilt,tx||0,ty||0);gl.uniform1f(uRot,rot||0);gl.uniform1f(uTime,reduce?0:(time||0));gl.drawArrays(gl.TRIANGLES,0,6)},
      get ready(){return ready}};
    return api;
  }};
})();
