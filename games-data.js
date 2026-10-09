/* ───────────────────────────────────────────────
   SAMMCO 게임 목록 (여기 한 곳만 고치면 돼요)
   게임이 생기면 아래 배열에 한 줄씩 추가하세요.

   id          주소에 쓰는 영문 소문자 이름  → sammco.store/play.html?g=id
   title       게임 이름
   desc        한 줄 소개
   url         게임 폴더의 index.html 경로 (예: 'games/게임이름/index.html')
   ratio       화면 비율 가로/세로 (예: '16/9', '4/3', '9/16') → 가로 전용·세로 전용·도트 게임만 이 비율로 고정돼요
               (orientation 'any' 게임은 창 모양을 그대로 따라가서 ratio 를 안 써요)
   orientation 'landscape' 가로 전용(휴대폰 세로면 돌려달라는 안내) / 'portrait' 세로 전용 / 'any' 둘 다 가능(안내 없음, 휴대폰 화면 꽉 채움)
   thumb       대표 이미지 경로 (비워두면 구름 모양 기본 이미지)
   base        (도트 게임만) 기준 해상도 '320x180' → 화면이 이 크기의 정수 배로 커져서 도트가 선명해요. 도트가 아니면 비워두세요
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
    needsLogin: true
  }
];
