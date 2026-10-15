/* =====================================================================
   말 상점 목록 — 이 파일만 고치면 상점에 말이 추가·변경됩니다.

   한 줄 = 말 하나
     id    : 영어·숫자로 된 고유 이름 (다른 말과 겹치면 안 됨)
     name  : 상점에 보이는 이름
     price : 복돈 가격 (0이면 처음부터 가지고 있음)
     type  : 'motif' 또는 'full'
       motif → 도자기 모양은 그대로, 몸통에 무늬만 넣음.
               무늬 그림은 흰색으로 그린 투명 배경 SVG/PNG.
               게임에서 자리별 안료색(청화·진사·백상감·철화)으로 바꿔 칠함.
               그림 영역: 정사각형 (권장 260×260)
       full  → 말 전체를 그림 한 장으로 바꿈. 색은 그림 그대로.
               그림 영역: 가로 32 : 세로 54 비율 (권장 320×540), 바닥 가운데가 말의 발 위치
     file  : skins 폴더 안의 그림 파일 경로

   순서대로 상점에 나옵니다. 첫 번째 말은 기본 말입니다 (가격 0 권장).
   ===================================================================== */
window.YUT_SKINS = [
  { id: 'basic', name: '기본 무늬', price: 0,   type: 'motif', file: 'skins/basic.svg' },
  { id: 'plum',  name: '매화문',    price: 300, type: 'motif', file: 'skins/plum.svg'  },
  { id: 'cloud', name: '운문',      price: 400, type: 'motif', file: 'skins/cloud.svg' },
  { id: 'lotus', name: '연판문',    price: 500, type: 'motif', file: 'skins/lotus.svg' },
  { id: 'chrys', name: '국화문',    price: 800, type: 'motif', file: 'skins/chrys.svg' },
];
