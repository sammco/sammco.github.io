/* 로그인 상태 표시 (메뉴 오른쪽): 로그인 전 "Login", 로그인 후 "닉네임 · Logout"
   - 서버 연결(supabase-js)을 한 번만 만들어서 페이지 안에서 같이 써요. (play.html 저장 기능도 이걸 씀)
   - 메뉴에 <span id="acct"></span> 이 있는 페이지에서만 표시돼요. */
(function(){
  var C=window.SAMMCO_PLAYER||{},live=!!(C.url&&C.anonKey),A=window.SAMMCO_ACCOUNT={live:live},cp=null;
  A.client=function(){
    if(!live)return Promise.resolve(null);
    if(cp)return cp;
    cp=new Promise(function(res){
      function make(){try{res(window.supabase.createClient(C.url,C.anonKey))}catch(e){res(null)}}
      if(window.supabase&&window.supabase.createClient)return make();
      var s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
      s.onload=make;s.onerror=function(){res(null)};document.head.appendChild(s);
    });
    return cp;
  };
  A.session=function(){
    return A.client().then(function(sb){return sb?sb.auth.getSession().then(function(r){return r.data.session}):null})
      .catch(function(){return null});
  };
  A.nickname=function(sess){
    return A.client().then(function(sb){return sb.from('profiles').select('nickname').eq('id',sess.user.id).maybeSingle()})
      .then(function(r){return (r&&r.data&&r.data.nickname)||''},function(){return ''});
  };
  A.logout=function(){return A.client().then(function(sb){return sb&&sb.auth.signOut()}).catch(function(){})};

  function link(text,href){var a=document.createElement('a');a.href=href;a.textContent=text;return a}
  function mount(){
    var el=document.getElementById('acct');if(!el)return;
    var st=document.createElement('style');
    st.textContent='#acct a{margin-left:26px}#acct .nick{opacity:.75}'+
      '@media(max-width:560px){nav{padding-left:14px!important;padding-right:14px!important;font-size:.95rem!important}nav a{padding:2px 6px!important}nav div a,#acct a{margin-left:6px!important}#acct .nick{display:none}}';
    document.head.appendChild(st);
    var here=location.pathname.split('/').pop()||'index.html';
    var loginHref='join.html?next='+encodeURIComponent(here+location.search);
    if(!live){el.appendChild(link('Login',loginHref));return}
    A.session().then(function(s){
      el.textContent='';
      if(!s){el.appendChild(link('Login',loginHref));return}
      A.nickname(s).then(function(n){
        el.textContent='';
        var me=link(n||'MY','join.html');me.className='nick';me.title='내 계정';
        var out=link('Logout','#');
        out.addEventListener('click',function(e){e.preventDefault();A.logout().then(function(){location.reload()})});
        el.appendChild(me);el.appendChild(out);
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
