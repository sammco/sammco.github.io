/* ───────────────────────────────────────────────
   SAMMCO 사이트 연동 (윷놀이 전용)
   - 복돈·말 외형·도감(profile)을 브라우저 저장소 대신 "사이트 계정"에 저장해요.
   - index.html 의 게임 코드는 그대로 두고, 이 파일이 저장 통로만 바꿔요.
     (게임 코드 앞에 <script src="sammco-bridge.js"></script> 한 줄만 있으면 됨)
   - 사이트 밖에서 파일을 직접 열면(테스트) 예전처럼 브라우저에 저장돼요.
─────────────────────────────────────────────── */
(function(){
  if(window.parent===window)return;                     /* 사이트 틀(iframe) 안에서만 동작 */
  var ORIGIN=location.origin==='null'?'*':location.origin,KEY=/^yutproto_/,loaded=false;
  function send(m){try{parent.postMessage(m,ORIGIN)}catch(e){}}

  /* 1) 게임이 브라우저 저장소에 읽고 쓰는 것을 가로채요 */
  var LS=null;try{LS=window.localStorage}catch(e){}
  if(LS){
    var _get=Storage.prototype.getItem,_set=Storage.prototype.setItem;
    Storage.prototype.getItem=function(k){if(this===LS&&KEY.test(k))return null;return _get.call(this,k)};
    Storage.prototype.setItem=function(k,v){
      if(this===LS&&KEY.test(k)){
        if(loaded&&k==='yutproto_profile'){try{send({sammco:'save',data:{v:1,profile:JSON.parse(v)}})}catch(e){}}
        return;                                            /* 브라우저에는 남기지 않음 */
      }
      return _set.call(this,k,v);
    };
  }

  /* 2) 불러오는 동안(최대 2초) 화면을 잠깐 막아서, 불러오기 전에 상점을 누르는 일을 막아요 */
  var veil=document.createElement('div');
  veil.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(10,20,22,.55);color:#e8e2d0;font:16px "Gowun Dodum","Apple SD Gothic Neo","Malgun Gothic",sans-serif;letter-spacing:.05em';
  veil.textContent='불러오는 중…';
  function addVeil(){if(document.body&&!veil.parentNode)document.body.appendChild(veil)}
  if(document.body)addVeil();else document.addEventListener('DOMContentLoaded',addVeil);
  var veilT=setTimeout(function(){if(veil.parentNode)veil.remove()},2000);

  /* 3) 사이트가 계정 기록을 보내주면 그것을 기준으로 바꿔 끼워요 */
  addEventListener('message',function(e){
    if(e.source!==window.parent)return;
    if(location.origin!=='null'&&e.origin!==location.origin)return;
    var d=e.data;if(!d||d.sammco!=='load'||loaded)return;
    loaded=true;clearTimeout(veilT);if(veil.parentNode)veil.remove();
    var saved=d.data&&d.data.profile;
    try{
      /* 게임 코드의 profile 을 계정 기록으로 교체 (기록이 없으면 처음 상태) */
      profile=Object.assign({bokdon:0,skins:['basic'],skin:'basic',augSeen:[],misSeen:{},synSeen:[]},saved||{});
      /* 말 목록 파일(skins/skins.js)이 안 불러와졌으면 정리하지 않아요.
         정리하면 목록에 없는 말이 보유 목록에서 지워진 채 계정에 저장될 수 있어서예요. */
      if(Array.isArray(window.YUT_SKINS)&&window.YUT_SKINS.length)fixSkins();
      /* 로비 안내 문구를 사이트 저장에 맞게 바꿔요 (브라우저에만 저장 → 계정에 저장) */
      var _rl=renderLobby;
      renderLobby=function(){_rl();var n=document.querySelector('#lobby .note');
        if(n)n.textContent='시제품 안내: 온라인 서버가 아직 없어서 매칭은 AI로 채워집니다. 복돈·도감·말 외형은 SAMMCO 계정에 저장됩니다.'};
      var lob=document.getElementById('lobby');if(lob&&!lob.hidden)renderLobby();
    }catch(err){}
  });
  send({sammco:'ready'});
})();
