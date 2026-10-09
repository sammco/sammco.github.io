/* 저장 관리자: 서버 요청을 최소로 줄이면서 "마지막 저장 시각"을 기록해요.
   - 자동 저장은 5분마다(± 최대 60초 어긋나게 시작 → 동접자 요청이 한꺼번에 몰리지 않아요)
   - 내용이 바뀌었을 때만 전체 저장, 안 바뀌었으면 시각만 갱신하는 아주 작은 요청(touch_save)
   - 탭을 숨기거나 닫을 때 한 번 더 저장
   - 저장 버튼은 10초에 한 번만, 바뀐 게 없으면 요청 자체를 안 보내요 */
(function(){
  var C=window.SAMMCO_PLAYER||{},S=window.SAMMCO_SAVE={};
  var INTERVAL=300000,JITTER=60000,MINGAP=10000;
  var sb=null,token=null,game=null,pending=null,lastJson=null,lastSend=0,timer=null,started=false,onStatus=function(){};
  S.live=!!(C.url&&C.anonKey);
  S.onStatus=function(f){onStatus=f};
  S.attach=function(client){sb=client};
  S.session=function(){return sb.auth.getSession().then(function(r){token=r.data.session?r.data.session.access_token:null;return r.data.session})};
  function rpc(name,args,keep){
    if(!token)return Promise.resolve(null);
    return fetch(C.url+'/rest/v1/rpc/'+name,{method:'POST',keepalive:!!keep,
      headers:{'Content-Type':'application/json',apikey:C.anonKey,Authorization:'Bearer '+token},
      body:JSON.stringify(args)}).then(function(r){return r.ok?r.json():Promise.reject(new Error('HTTP '+r.status))});
  }
  S.load=function(id){
    game=id;
    return rpc('load_game',{p_game:id}).then(function(r){
      if(r&&r.data!=null){pending=lastJson=JSON.stringify(r.data)}
      return r?{data:r.data,offlineSeconds:r.offline_seconds||0,maxOfflineSeconds:r.max_offline_seconds||0}:{data:null,offlineSeconds:0,maxOfflineSeconds:0};
    });
  };
  S.setData=function(obj){pending=JSON.stringify(obj)};
  S.dirty=function(){return pending!==null&&pending!==lastJson};
  function send(keep){
    lastSend=Date.now();
    var dirty=S.dirty(),sent=pending;
    var p=dirty?rpc('save_game',{p_game:game,p_data:JSON.parse(sent)},keep):rpc('touch_save',{p_game:game},keep);
    return p.then(function(res){
      if(dirty&&res&&res.ok)lastJson=sent;
      onStatus({kind:dirty?'saved':'touched',ok:!!(res&&res.ok),at:new Date()});
      return res;
    }).catch(function(){onStatus({kind:'error'});return null});
  }
  S.saveNow=function(){
    if(Date.now()-lastSend<MINGAP)return Promise.resolve({wait:true});
    if(!S.dirty())return Promise.resolve({unchanged:true});
    return S.session().then(function(){return send(false)});
  };
  function schedule(){
    timer=setTimeout(function(){S.session().then(function(){return send(false)}).then(schedule,schedule)},
      INTERVAL+(Math.random()*2-1)*JITTER);
  }
  function flush(){if(game&&token&&Date.now()-lastSend>3000)send(true)}
  S.start=function(){
    if(started||!game)return;started=true;
    schedule();
    document.addEventListener('visibilitychange',function(){if(document.visibilityState==='hidden')flush()});
    addEventListener('pagehide',flush);
  };
})();
