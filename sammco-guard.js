/* 복제 방지(가벼운 버전): 우리 도메인에서만 게임이 실행되게 해요.
   - 다른 사이트가 파일을 그대로 가져가 올리면 이 안내만 보여요.
   - 완전한 보호는 아니에요. 코드를 고치면 우회할 수 있어서 "어렵게 만드는" 용도예요.
   - 도메인을 바꾸면 아래 목록도 같이 바꾸세요. (localhost / 내 컴퓨터 파일 열기는 테스트용으로 허용) */
(function(){
  var ok=['sammco.store','www.sammco.store','localhost','127.0.0.1',''];
  if(location.protocol==='file:'||ok.indexOf(location.hostname)>-1){
    /* 게임 파일 주소로 바로 들어오면(사이트 틀 밖) 게임 화면(play.html)으로 보내요 → 로그인 확인을 거치게 */
    var m=location.pathname.match(/\/games\/([a-z0-9-]+)\/(index\.html)?$/);
    if(m&&window.top===window.self&&location.protocol!=='file:')location.replace('../../play.html?g='+m[1]);
    return;
  }
  document.documentElement.innerHTML='<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#e6dcfa;font-family:system-ui,sans-serif;text-align:center;padding:24px"><div><p style="font-size:1.1rem;margin:0 0 10px">이 게임은 SAMMCO 공식 사이트에서만 실행돼요.</p><a href="https://sammco.store" style="color:#7052cd;font-weight:700">sammco.store 로 가기</a></div></body>';
  throw new Error('domain-locked');
})();
