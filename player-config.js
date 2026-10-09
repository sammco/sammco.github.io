/* 플레이어 계정(Supabase) 연결 설정
   - 비워두면 join.html은 "미리보기 모드"로 동작합니다 (화면만 확인, 서버 저장 없음).
   - Supabase 프로젝트 만든 뒤 Settings > API 에서 두 값을 복사해 붙여넣으세요.
   - anon key는 공개돼도 되는 키입니다. (service_role 키는 절대 넣지 마세요!)
   - 직원용(staff) 프로젝트와는 별개의 프로젝트를 쓰는 걸 전제로 합니다. */
window.SAMMCO_PLAYER = {
  url: '',      // 예: 'https://abcdxyz.supabase.co'
  anonKey: ''   // 예: 'eyJhbGciOi...'
};
