/* ───────────────────────────────────────────────
   SAMMCO 게임 목록 (여기 한 곳만 고치면 돼요)
   게임이 생기면 아래 배열에 한 줄씩 추가하세요.

   id          주소에 쓰는 영문 소문자 이름  → sammco.store/play.html?g=id
   title       게임 이름
   desc        한 줄 소개
   url         게임 폴더의 index.html 경로 (예: 'games/게임이름/index.html')
               비워두면 플레이 없이 앨범에 "준비 중" 디스크로만 나와요 (연구중 소개용)
   ratio       화면 비율 가로/세로 (예: '16/9', '4/3', '9/16') → 가로 전용·세로 전용·도트 게임만 이 비율로 고정돼요
               (orientation 'any' 게임은 창 모양을 그대로 따라가서 ratio 를 안 써요)
   pcFlex      true 로 하면 컴퓨터에서는 창 모양 그대로 채우고 휴대폰은 orientation 방향만 (예: 윷놀이)
   orientation 'landscape' 가로 전용(휴대폰 세로면 돌려달라는 안내) / 'portrait' 세로 전용 / 'any' 둘 다 가능(안내 없음, 휴대폰 화면 꽉 채움)
   thumb       대표 이미지 경로 (게임 화면 아래 '다른 게임' 카드에 쓰여요)
   discFx      'nacre' 로 하면 디스크를 "자개 은하 원판 작업대" 방식으로 그려요 (케이스 기울기 따라 자개 빛·별 반짝임). 지금은 윷놀이만
   disc        앨범 CD 디스크 라벨 이미지 (정사각형, 가운데 구멍 자리는 비워두기). 비우면 thumb 가 인쇄돼요
   base        (도트 게임만) 기준 해상도 '320x180' → 화면이 이 크기의 정수 배로 커져서 도트가 선명해요. 도트가 아니면 비워두세요
   section     'lab' 으로 적으면 WEB 목록 대신 '연구중(Lab)' 페이지에 나와요 (비워두면 WEB 목록)
   labNote     (연구중 게임만) 소개 아래 작은 글씨 한 줄
   needsLogin  기본은 로그인한 사람만 실행 가능. false 로 적은 게임만 로그인 없이 실행돼요
─────────────────────────────────────────────── */
window.SAMMCO_SITE = {
  ads: false   // AdSense 승인이 나면 true로 바꾸세요 (양옆 광고 칸이 켜져요)
};

window.SAMMCO_GAMES = [
  {
    id: 'candy-match',
    title: 'Candy Match',
    desc: '같은 사탕을 맞춰서 터뜨리는 퍼즐 게임',
    url: 'games/candy-match/index.html',
    ratio: '16/9',
    orientation: 'any',
    thumb: 'games/candy-match/thumb.png',
    disc: 'discs/candy-match.jpg',
    needsLogin: true
  },
  {
    id: 'chicken-shop',
    title: '치킨집 영업 시제품',
    desc: '치킨과 감자튀김을 튀겨 세트로 포장하고 손님에게 파는 영업 게임',
    url: 'games/chicken-shop/index.html',
    ratio: '16/9',
    orientation: 'landscape',
    thumb: 'games/chicken-shop/thumb.png',
    disc: 'discs/chicken-shop.jpg',
    needsLogin: true,
    section: 'lab',
    labNote: '2026 · 웹 시제품 · 로그인 후 플레이'
  },
  {
    id: 'yut',
    title: '윷놀이',
    desc: '복주머니를 모으는 웹 윷놀이',
    url: 'games/yut/index.html',
    ratio: '16/9',
    orientation: 'landscape',
    pcFlex: true,
    thumb: 'games/yut/thumb.png',
    disc: 'discs/yut.jpg',
    discFx: 'nacre',
    needsLogin: true,
    section: 'lab',
    labNote: '2026 · 웹 시제품 · 온라인 대전 준비 중'
  }
];
