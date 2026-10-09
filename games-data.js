/* ───────────────────────────────────────────────
   SAMMCO 게임 목록 (여기 한 곳만 고치면 돼요)
   게임이 생기면 아래 배열에 한 줄씩 추가하세요.

   id          주소에 쓰는 영문 소문자 이름  → sammco.store/play.html?g=id
   title       게임 이름
   desc        한 줄 소개
   url         게임 폴더의 index.html 경로 (예: 'games/게임이름/index.html')
   ratio       화면 비율 가로/세로 (예: '16/9', '4/3', '9/16') → 모니터 틀이 이 비율에 맞춰 늘어나요
   orientation 'landscape' 가로 전용 / 'portrait' 세로 전용 / 'any' 둘 다
   thumb       대표 이미지 경로 (비워두면 구름 모양 기본 이미지)
─────────────────────────────────────────────── */
window.SAMMCO_SITE = {
  ads: false   // AdSense 승인이 나면 true로 바꾸세요 (양옆 광고 칸이 켜져요)
};

window.SAMMCO_GAMES = [
  {
    id: 'demo',
    title: '샘플 게임',
    desc: '화면 틀을 확인하기 위한 샘플이에요. 실제 게임을 올리면 이 줄을 교체하세요.',
    url: 'games/demo/index.html',
    ratio: '16/9',
    orientation: 'landscape',
    thumb: ''
  }
];
