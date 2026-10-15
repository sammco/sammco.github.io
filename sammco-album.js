/* ───────────────────────────────────────────────
   SAMMCO 게임 앨범 (WEB 게임 · 연구중 페이지 공용) — 3D CD 케이스
   - 투명 CD 케이스(뒷판·옆면·경첩·뚜껑) 안의 디스크에 게임별 라벨(disc, 없으면 thumb)이 인쇄돼요.
   - 옆으로 밀기(휴대폰) · 끌기 · ‹ › 화살표 · 키보드 ← → 로 다음 게임
   - 가운데 케이스를 마우스로 끌면 케이스가 돌아가요.
   - 케이스(또는 PLAY)를 누르면 뚜껑이 열리고 디스크가 돌면서 게임이 시작돼요. (자개 원판 디스크는 돌지 않아요)
   - url 이 없는 게임은 "준비 중" 디스크로만 나와요 (열리지 않음)
   사용: SAMMCO_ALBUM(넣을 곳, 게임 목록, {tag:'연구중', sheen:'rainbow'|'silver'})
─────────────────────────────────────────────── */
(function(){
  var CSS=''+
  '.album{position:relative;max-width:1200px;margin:0 auto;padding:0 0 4px;--w:min(330px,66vw);--d:calc(var(--w)*.075)}'+
  '.album .track{display:flex;gap:clamp(10px,3vw,40px);overflow-x:auto;overflow-y:hidden;scroll-snap-type:x mandatory;'+
    'padding:40px calc(50% - var(--w)/2) 30px;scrollbar-width:none;-webkit-overflow-scrolling:touch;overscroll-behavior-x:contain}'+
  '.album .track::-webkit-scrollbar{display:none}'+
  '.album .track.drag{scroll-snap-type:none;user-select:none}'+
  '.album .slide{flex:0 0 var(--w);scroll-snap-align:center;text-align:center;transition:opacity .45s}'+
  '.album .slide:not(.on){opacity:.5}'+
  /* 3D 무대 */
  '.album .stage{position:relative;width:var(--w);height:var(--w);perspective:calc(var(--w)*3.2);touch-action:pan-x pan-y;cursor:pointer;outline:none}'+
  '.album .stage:focus-visible .lid{box-shadow:0 0 0 3px #a98bea}'+
  '.album .soon .stage{cursor:default}'+
  '.album .ground{position:absolute;left:12%;right:12%;bottom:-9%;height:12%;border-radius:50%;background:radial-gradient(closest-side,rgba(90,60,170,.28),rgba(90,60,170,0));filter:blur(4px);pointer-events:none}'+
  '.album .obj{position:absolute;inset:0;transform-style:preserve-3d;'+
    'transform:scale(var(--sc,1)) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));transition:transform .5s cubic-bezier(.2,.8,.2,1)}'+
  '.album .obj.live{transition:none}'+
  '.album .f{position:absolute;backface-visibility:visible}'+
  '.album .sway{position:absolute;inset:0;transform-style:preserve-3d}'+
  '.album .slide.on:not(.open) .sway{animation:sammcoSway 7s ease-in-out infinite alternate}'+
  '.album .stage.held .sway{animation-play-state:paused}'+
  '@keyframes sammcoSway{from{transform:rotateY(-7deg) rotateX(2deg)}to{transform:rotateY(7deg) rotateX(-2deg)}}'+
  /* 뒷판 */
  '.album .back{inset:0;border-radius:6px;transform:translateZ(calc(var(--d)/-2));'+
    'background:linear-gradient(150deg,rgba(255,255,255,.42),rgba(232,226,250,.22) 60%,rgba(255,255,255,.36));'+
    'border:1px solid rgba(255,255,255,.95);box-shadow:inset 0 0 0 4px rgba(255,255,255,.25),inset 0 0 0 5px rgba(140,125,190,.25)}'+
  '.album .back::after{content:"";position:absolute;inset:6%;border-radius:50%;border:1px solid rgba(255,255,255,.7)}'+
  /* 옆면 4개 */
  '.album .eh{left:0;width:100%;height:var(--d);top:calc(50% - var(--d)/2);'+
    'background:linear-gradient(90deg,rgba(255,255,255,.7),rgba(230,224,248,.45),rgba(255,255,255,.7));border:1px solid rgba(255,255,255,.95)}'+
  '.album .e-top{transform:rotateX(90deg) translateZ(calc(var(--w)/2))}'+
  '.album .e-bot{transform:rotateX(-90deg) translateZ(calc(var(--w)/2))}'+
  '.album .ev{top:0;height:100%;width:var(--d);left:calc(50% - var(--d)/2);'+
    'background:linear-gradient(180deg,rgba(255,255,255,.7),rgba(230,224,248,.45),rgba(255,255,255,.7));border:1px solid rgba(255,255,255,.95)}'+
  '.album .e-right{transform:rotateY(90deg) translateZ(calc(var(--w)/2))}'+
  '.album .e-left{transform:rotateY(-90deg) translateZ(calc(var(--w)/2));'+
    'background:repeating-linear-gradient(180deg,rgba(255,255,255,.9) 0 11%,rgba(205,195,235,.55) 11% 13%);}'+
  /* 디스크 */
  '.album .disc{inset:8.5%;border-radius:50%;transform:translateZ(calc(var(--d)/-2 + 3px))}'+
  '.album .spin{position:absolute;inset:0;border-radius:50%;overflow:hidden;isolation:isolate;'+
    'background:conic-gradient(from 20deg,#f4f4f7,#d9d9e0,#fbfbfd,#cfcfd8,#f4f4f7,#e2dcf3,#f8f8fb,#d4d4dc,#f4f4f7);'+
    'box-shadow:0 0 0 1px rgba(255,255,255,.9),0 3px 10px rgba(60,40,120,.22);'+
    '-webkit-mask:radial-gradient(circle,transparent 0 6.6%,#000 7%);mask:radial-gradient(circle,transparent 0 6.6%,#000 7%)}'+
  '.album .label{position:absolute;inset:2.4%;border-radius:50%;background-color:#d9ccf7;background-position:center;background-size:cover;'+
    'background-image:radial-gradient(circle at 30% 60%,#fff 0 12%,transparent 13%),radial-gradient(circle at 50% 48%,#fff 0 16%,transparent 17%),radial-gradient(circle at 70% 60%,#fff 0 12%,transparent 13%),linear-gradient(#cdbcf5,#e6dcfa)}'+
  '.album .sheen{position:absolute;inset:-20%;border-radius:50%;pointer-events:none;mix-blend-mode:screen;opacity:.55;transform:rotate(var(--sh,0deg))}'+
  '.album.silver .sheen{background:conic-gradient(from 0deg,rgba(255,255,255,0) 0deg,rgba(255,255,255,.7) 35deg,rgba(220,208,250,.5) 60deg,rgba(255,255,255,0) 100deg,'+
    'rgba(255,255,255,0) 180deg,rgba(255,255,255,.65) 215deg,rgba(220,208,250,.45) 240deg,rgba(255,255,255,0) 280deg)}'+
  '.album.rainbow .sheen{opacity:.5;background:conic-gradient(from 0deg,rgba(255,170,200,0) 0deg,rgba(255,170,200,.75) 25deg,rgba(255,230,150,.75) 45deg,rgba(160,240,200,.75) 65deg,'+
    'rgba(150,200,255,.75) 85deg,rgba(205,170,255,.75) 105deg,rgba(255,255,255,0) 135deg,rgba(255,255,255,0) 180deg,rgba(255,170,200,.7) 205deg,rgba(255,230,150,.7) 225deg,'+
    'rgba(160,240,200,.7) 245deg,rgba(150,200,255,.7) 265deg,rgba(205,170,255,.7) 285deg,rgba(255,255,255,0) 315deg)}'+
  /* 자개 원판 (게임별 discFx:'nacre'): WebGL 로 그려요. WebGL 이 안 되는 기기에서는 원래 그림만 보여요 */
  '.album .nacre .sheen{display:none}'+
  '.album .ncv{position:absolute;left:2.4%;top:2.4%;width:95.2%;height:95.2%;border-radius:50%;display:block}'+
  '.album .gl .label{visibility:hidden}'+
  '.album .hub{position:absolute;inset:0;border-radius:50%;pointer-events:none;'+
    'background:radial-gradient(circle,transparent 0 7%,rgba(255,255,255,.92) 7.4% 13%,rgba(150,140,180,.35) 13.3% 13.8%,rgba(255,255,255,.55) 14% 16.5%,rgba(0,0,0,.08) 16.8% 17.2%,transparent 17.5%)}'+
  /* 뚜껑이 열릴 때 디스크가 빠르게 돎 — 자개 원판(윷놀이)은 돌지 않음 (2026-10-15 결정) */
  '.album .slide.open:not(.nacre) .spin{animation:sammcoSpin .7s cubic-bezier(.4,0,.2,1) infinite}'+
  /* 마우스를 올리면 디스크가 천천히 돎 — 자개 원판(윷놀이)은 멈춰 있고 빛만 반응 */
  '@media (hover:hover){.album .slide.on:not(.open):not(.nacre) .stage:hover .spin{animation:sammcoSpin 6s linear infinite}}'+
  '@keyframes sammcoSpin{to{transform:rotate(360deg)}}'+
  /* 뚜껑 (왼쪽 경첩 기준으로 열림) */
  '.album .lid{inset:0;border-radius:6px;transform-origin:left center;transform:translateZ(calc(var(--d)/2)) rotateY(var(--lid,0deg));'+
    'transition:transform .65s cubic-bezier(.3,.7,.2,1);'+
    'background:linear-gradient(118deg,rgba(255,255,255,.58) 0 14%,rgba(255,255,255,.06) 14.5% 60%,rgba(255,255,255,.3) 60.5% 68%,rgba(255,255,255,.06) 68.5%);'+
    'background-size:220% 100%;background-position:var(--gx,50%) 0;'+
    'border:1px solid rgba(255,255,255,.98);box-shadow:inset 0 0 0 5px rgba(255,255,255,.22),inset 0 0 0 6px rgba(150,135,200,.25)}'+
  '.album .lid::before{content:"";position:absolute;inset:4.5%;border-radius:4px;border:1px solid rgba(255,255,255,.75)}'+
  '.album .lid::after{content:"";position:absolute;left:0;top:6%;bottom:6%;width:5%;border-right:1px solid rgba(255,255,255,.85);'+
    'background:repeating-linear-gradient(180deg,rgba(255,255,255,.55) 0 12%,rgba(255,255,255,.15) 12% 14%)}'+
  '.album .slide.open .lid{--lid:-128deg}'+
  /* 글 */
  '.album .meta{margin-top:30px;padding:0 6px}'+
  '.album .meta .tag{display:inline-block;border:2px solid #111;border-radius:99px;padding:0 14px;font-size:.8rem;font-weight:700;margin-bottom:8px}'+
  '.album .meta h2{font-size:clamp(1.25rem,2.6vw,1.6rem);letter-spacing:-.02em;line-height:1.3}'+
  '.album .meta p{margin:6px 0 0;color:#555;font-size:.95rem}'+
  '.album .meta small{display:block;margin-top:6px;color:#8a8a8a;font-size:.85rem}'+
  '.album .meta .pill{margin-top:16px}'+
  '.album .meta .hint{display:block;margin-top:10px;color:#8a8a8a;font-size:.8rem}'+
  '.album .slide:not(.on) .meta{visibility:hidden}'+
  /* 넘기기 버튼 */
  '.album .nav{position:absolute;top:calc(40px + var(--w)/2);transform:translateY(-50%);width:46px;height:46px;border-radius:50%;'+
    'border:2px solid #111;background:rgba(255,255,255,.7);color:#111;font-size:20px;line-height:1;display:flex;align-items:center;justify-content:center;'+
    'transition:color .25s,border-color .25s,opacity .25s;z-index:5}'+
  '.album .nav:hover{color:#9f7ae6;border-color:#9f7ae6}'+
  '.album .nav:disabled{opacity:0;pointer-events:none}'+
  '.album .prev{left:max(12px,calc(50% - var(--w)/2 - 100px))}'+
  '.album .next{right:max(12px,calc(50% - var(--w)/2 - 100px))}'+
  '@media (max-width:620px){.album .nav{width:38px;height:38px;font-size:17px;background:rgba(255,255,255,.85)}.album .prev{left:6px}.album .next{right:6px}}'+
  '.album .dots{display:flex;justify-content:center;gap:9px;margin-top:6px}'+
  '.album .dots button{width:9px;height:9px;padding:0;border-radius:50%;border:2px solid #111;background:transparent;transition:background .25s,border-color .25s}'+
  '.album .dots button.on{background:#9f7ae6;border-color:#9f7ae6}'+
  '.album.one .nav,.album.one .dots{display:none}'+
  '.album .empty{text-align:center;color:#666;padding:40px 20px}'+
  '@media(prefers-reduced-motion:reduce){.album .obj,.album .lid{transition:none}.album .spin,.album .sway{animation:none!important}}';

  function el(tag,cls,txt){var e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.SAMMCO_ALBUM=function(root,games,opt){
    opt=opt||{};
    if(!document.getElementById('sammco-album-css')){var st=el('style');st.id='sammco-album-css';st.textContent=CSS;document.head.appendChild(st)}
    root.classList.add('album',opt.sheen==='silver'?'silver':'rainbow');root.innerHTML='';
    if(!games.length){root.appendChild(el('p','empty',opt.empty||'곧 게임이 올라와요.'));return}
    if(games.length===1)root.classList.add('one');
    var track=el('div','track'),slides=[],dots=el('div','dots');
    track.setAttribute('aria-label','게임 앨범 (옆으로 넘겨 보세요)');

    games.forEach(function(g,i){
      var play=g.url?'play.html?g='+encodeURIComponent(g.id):null;
      var s=el('div','slide'+(play?'':' soon')+(g.discFx==='nacre'?' nacre':''));s._play=play;s._u={rx:-12,ry:-22};
      var stage=el('div','stage');stage.tabIndex=0;stage.setAttribute('role',play?'button':'img');
      stage.setAttribute('aria-label',play?g.title+' — 눌러서 케이스를 열고 플레이':g.title+' (준비 중)');
      var obj=el('div','obj');
      ['back','eh e-top','eh e-bot','ev e-right','ev e-left'].forEach(function(c){obj.appendChild(el('div','f '+c))});
      var disc=el('div','f disc'),spin=el('div','spin'),label=el('div','label');
      var art=g.disc||g.thumb;   /* 디스크 라벨: disc 이미지가 있으면 그것, 없으면 썸네일 */
      if(art)label.style.backgroundImage='url("'+String(art).replace(/"/g,'%22')+'")';
      spin.appendChild(label);spin.appendChild(el('div','sheen'));disc.appendChild(spin);disc.appendChild(el('div','hub'));
      if(g.discFx==='nacre'&&art&&window.SAMMCO_NACRE){   /* 자개 조각 하나하나가 빛을 받는 디스크 (WebGL) */
        var nr=null;try{nr=SAMMCO_NACRE.make(spin,art,function(){s.classList.add('gl');s._dirty=true})}catch(e){}
        if(nr){s._nacre=nr;s._spin=spin}}
      obj.appendChild(disc);obj.appendChild(el('div','f lid'));
      var sway=el('div','sway');s._sway=sway;sway.appendChild(obj);stage.appendChild(el('div','ground'));stage.appendChild(sway);
      var meta=el('div','meta');
      if(opt.tag||!play)meta.appendChild(el('span','tag',play?opt.tag:'준비 중'));
      meta.appendChild(el('h2','',g.title));
      if(g.desc)meta.appendChild(el('p','',g.desc));
      if(g.labNote)meta.appendChild(el('small','',g.labNote));
      if(play){var a=el('a','pill','PLAY');a.href=play;a.addEventListener('click',function(e){e.preventDefault();open(i)});meta.appendChild(a);
        meta.appendChild(el('span','hint',matchMedia('(hover:hover)').matches?'케이스를 끌면 돌아가요 · 누르면 열려요':'케이스를 누르면 열려요'))}
      s.appendChild(stage);s.appendChild(meta);track.appendChild(s);slides.push(s);s._obj=obj;s._stage=stage;
      var d=el('button');d.type='button';d.setAttribute('aria-label',(i+1)+'번째 게임: '+g.title);
      d.addEventListener('click',function(){go(i)});dots.appendChild(d);
      stage.addEventListener('click',function(){if(spun)return;if(i!==cur){go(i);return}open(i)});
      stage.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();if(i!==cur)go(i);else open(i)}});
    });
    var prev=el('button','nav prev','‹'),next=el('button','nav next','›');
    prev.type=next.type='button';prev.setAttribute('aria-label','이전 게임');next.setAttribute('aria-label','다음 게임');
    root.appendChild(prev);root.appendChild(track);root.appendChild(next);root.appendChild(dots);

    /* 뚜껑 열기 → 게임 시작 */
    var opening=false;
    function open(i){
      var s=slides[i];if(!s._play||opening)return;
      opening=true;s._u.rx=-12;s._u.ry=-24;apply(s,0);s.classList.add('open');
      setTimeout(function(){location.href=s._play},reduce?0:900);
    }
    /* 뒤로 가기로 돌아오면 닫힌 상태로 */
    addEventListener('pageshow',function(){opening=false;slides.forEach(function(s){s.classList.remove('open');s._u.rx=-12;s._u.ry=-22});layout()});

    var cur=-1;
    function center(i){var s=slides[i];return s.offsetLeft+s.offsetWidth/2-track.clientWidth/2}
    function go(i,instant){i=Math.max(0,Math.min(slides.length-1,i));track.scrollTo({left:center(i),behavior:instant?'auto':'smooth'})}
    function apply(s,off){
      /* 가운데에서 멀어질수록 케이스가 돌아가고 작아져요 (넘길 때 입체감) */
      var o=Math.max(-1.6,Math.min(1.6,off)),ry=s._u.ry-o*38,rx=s._u.rx,sc=1-Math.min(1,Math.abs(o))*.2;
      s._obj.style.setProperty('--ry',ry.toFixed(2)+'deg');s._obj.style.setProperty('--rx',rx.toFixed(2)+'deg');s._obj.style.setProperty('--sc',sc.toFixed(3));
      s._obj.style.setProperty('--sh',(ry*1.6).toFixed(1)+'deg');s._dirty=true;s._obj.style.setProperty('--gx',(50+ry*.9).toFixed(1)+'%');
    }
    /* 자개 원판 빛: 케이스 각도(끌기·흔들림·넘기기)를 작업대의 "판 기울기"로 바꿔 매 순간 다시 그림
       케이스 기본 자세(rx -12°, ry -22°)가 작업대에서 판이 반듯할 때와 같아요. 기울기 11° = 작업대 끝까지 */
    function nacreLoop(t){
      requestAnimationFrame(nacreLoop);if(document.hidden)return;
      slides.forEach(function(s,i){
        if(!s._nacre||!s._nacre.ready||Math.abs(i-cur)>1)return;
        var on=i===cur;if(!on&&!s._dirty)return;s._dirty=false;
        var ry=parseFloat(s._obj.style.getPropertyValue('--ry'))||0,rx=parseFloat(s._obj.style.getPropertyValue('--rx'))||0,swY=0,swX=0,rot=0;
        try{if(on){var m=getComputedStyle(s._sway).transform;if(m&&m!=='none'){var M=new DOMMatrixReadOnly(m);swY=-Math.asin(Math.max(-1,Math.min(1,M.m13)))*57.3;swX=Math.asin(Math.max(-1,Math.min(1,M.m23)))*57.3}}
          var sm=getComputedStyle(s._spin).transform;if(sm&&sm!=='none'){var Q=new DOMMatrixReadOnly(sm);rot=Math.atan2(Q.m12,Q.m11)}}catch(e){}
        var k=s._nacre.tiltMax||11,cl=function(v){return Math.max(-1.4,Math.min(1.4,v))};
        s._nacre.draw(cl((ry+swY+22)/k),cl(-(rx+swX+12)/k),rot,t/1000);
      });
    }
    if(slides.some(function(s){return s._nacre}))requestAnimationFrame(nacreLoop);
    function layout(){
      var mid=track.scrollLeft+track.clientWidth/2,best=0,bd=1e9;
      slides.forEach(function(s,i){var c=s.offsetLeft+s.offsetWidth/2,d=c-mid;apply(s,d/(s.offsetWidth||1));if(Math.abs(d)<bd){bd=Math.abs(d);best=i}});
      if(best!==cur){cur=best;
        slides.forEach(function(s,i){s.classList.toggle('on',i===cur);if(i!==cur&&!s.classList.contains('open')){s._u.rx=-12;s._u.ry=-22}});
        Array.prototype.forEach.call(dots.children,function(d,i){d.classList.toggle('on',i===cur);d.setAttribute('aria-current',i===cur?'true':'false')});
        prev.disabled=cur===0;next.disabled=cur===slides.length-1;
      }
    }
    var raf=0;track.addEventListener('scroll',function(){if(!raf)raf=requestAnimationFrame(function(){raf=0;slides.forEach(function(s){s._obj.classList.add('live')});layout()})},{passive:true});
    var settle=0;track.addEventListener('scroll',function(){clearTimeout(settle);settle=setTimeout(function(){slides.forEach(function(s){s._obj.classList.remove('live')})},120)},{passive:true});
    prev.addEventListener('click',function(){go(cur-1)});
    next.addEventListener('click',function(){go(cur+1)});
    addEventListener('keydown',function(e){
      if(e.target&&/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
      if(e.key==='ArrowLeft'){go(cur-1);e.preventDefault()}else if(e.key==='ArrowRight'){go(cur+1);e.preventDefault()}
    });

    /* 마우스: 가운데 케이스 위에서 끌면 케이스 회전, 그 밖에서 끌면 앨범 넘기기 */
    var mode=null,sx=0,sy=0,sl=0,base=null,spun=false,startI=0;
    track.addEventListener('pointerdown',function(e){
      if(e.pointerType!=='mouse'||e.button!==0||opening)return;
      var s=slides[cur];sx=e.clientX;sy=e.clientY;spun=false;startI=cur;
      if(s&&s._stage.contains(e.target)){mode='rot';base={rx:s._u.rx,ry:s._u.ry};s._stage.classList.add('held')}else{mode='scroll';sl=track.scrollLeft}
    });
    addEventListener('pointermove',function(e){
      if(!mode)return;var dx=e.clientX-sx,dy=e.clientY-sy;
      if(!spun&&Math.abs(dx)+Math.abs(dy)>6){spun=true;if(mode==='scroll')track.classList.add('drag');else slides[cur]._obj.classList.add('live')}
      if(!spun)return;e.preventDefault();
      if(mode==='rot'){var s=slides[cur];s._u.ry=base.ry+dx*.45;s._u.rx=Math.max(-50,Math.min(40,base.rx-dy*.35));apply(s,0)}
      else track.scrollLeft=sl-dx;
    });
    addEventListener('pointerup',function(e){
      if(!mode)return;var m=mode;mode=null;
      if(m==='scroll'&&spun){var dx=e.clientX-sx,t=indexAt();track.classList.remove('drag');if(t===startI&&Math.abs(dx)>40)t=startI+(dx<0?1:-1);go(t)}
      if(m==='rot'){slides[cur]._stage.classList.remove('held');if(spun)slides[cur]._obj.classList.remove('live')}
      setTimeout(function(){spun=false},60);
    });
    function indexAt(){var mid=track.scrollLeft+track.clientWidth/2,best=0,bd=1e9;slides.forEach(function(s,i){var d=Math.abs(s.offsetLeft+s.offsetWidth/2-mid);if(d<bd){bd=d;best=i}});return best}
    track.addEventListener('dragstart',function(e){e.preventDefault()});
    addEventListener('resize',function(){go(cur<0?0:cur,true);layout()});
    layout();go(0,true);layout();
  };
})();
