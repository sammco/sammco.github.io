-- ============================================================
-- SAMMCO 게임 저장 / 오프라인 시간 규칙 (supabase-players.sql 을 먼저 실행한 뒤 이 파일을 Run)
-- 핵심: 시간 계산은 전부 "서버 시계"로 해요. 기기 시계를 바꿔도 소용없어요.
-- ============================================================

-- 1) 오프라인으로 흘러갈 수 있는 최대 시간(초). 600 = 10분. 나중에 바꾸려면 이 숫자를 고치세요.
alter table public.profiles add column if not exists max_offline_seconds integer not null default 600;

-- 2) 게임별 저장 데이터
create table if not exists public.game_saves (
  user_id   uuid not null references auth.users(id) on delete cascade,
  game_id   text not null check (game_id ~ '^[a-z0-9_-]{1,32}$'),
  data      jsonb,
  last_seen timestamptz not null default now(),   -- 마지막으로 저장/접속 신호를 보낸 서버 시각
  saved_at  timestamptz not null default now(),   -- 마지막으로 내용을 저장한 서버 시각
  primary key (user_id, game_id)
);
alter table public.game_saves enable row level security;
drop policy if exists "own saves read" on public.game_saves;
create policy "own saves read" on public.game_saves for select using (auth.uid() = user_id);
-- 쓰기 정책은 일부러 만들지 않아요. 저장은 아래 함수로만 가능해요. (한도 규칙을 우회하지 못하게)

-- 3) 불러오기: 저장 데이터 + 오프라인으로 지난 시간(최대치 적용) 돌려주고, 접속 시각을 지금으로 갱신
create or replace function public.load_game(p_game text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); rec public.game_saves; mx int; off int;
begin
  if uid is null then raise exception 'NOT_LOGGED_IN'; end if;
  if p_game !~ '^[a-z0-9_-]{1,32}$' then raise exception 'INVALID_GAME'; end if;
  select max_offline_seconds into mx from public.profiles where id = uid;
  mx := coalesce(mx, 0);
  select * into rec from public.game_saves where user_id = uid and game_id = p_game;
  if not found then
    insert into public.game_saves (user_id, game_id, saved_at)
      values (uid, p_game, now() - interval '1 minute');   -- 처음 저장이 5초 제한에 걸리지 않게
    return jsonb_build_object('data', null, 'offline_seconds', 0, 'max_offline_seconds', mx);
  end if;
  off := least(greatest(extract(epoch from now() - rec.last_seen), 0)::int, mx);
  update public.game_saves set last_seen = now() where user_id = uid and game_id = p_game;
  return jsonb_build_object('data', rec.data, 'offline_seconds', off, 'max_offline_seconds', mx);
end $$;

-- 4) 저장: 크기 제한(50,000자), 5초 안에 또 오면 무시
create or replace function public.save_game(p_game text, p_data jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid(); n int;
begin
  if uid is null then raise exception 'NOT_LOGGED_IN'; end if;
  if p_game !~ '^[a-z0-9_-]{1,32}$' then raise exception 'INVALID_GAME'; end if;
  if length(p_data::text) > 50000 then raise exception 'DATA_TOO_LARGE'; end if;
  insert into public.game_saves as g (user_id, game_id, data, last_seen, saved_at)
    values (uid, p_game, p_data, now(), now())
  on conflict (user_id, game_id) do update
    set data = excluded.data, last_seen = now(), saved_at = now()
    where g.saved_at < now() - interval '5 seconds';
  get diagnostics n = row_count;
  return jsonb_build_object('ok', n > 0);
end $$;

-- 5) 접속 신호: 시각만 갱신하는 아주 작은 요청 (20초 안에 또 오면 무시)
create or replace function public.touch_save(p_game text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'NOT_LOGGED_IN'; end if;
  update public.game_saves set last_seen = now()
    where user_id = uid and game_id = p_game and last_seen < now() - interval '20 seconds';
  return jsonb_build_object('ok', true);
end $$;

-- 6) 로그인한 사람만 호출 가능
revoke execute on function public.load_game(text), public.save_game(text, jsonb), public.touch_save(text) from public, anon;
grant  execute on function public.load_game(text), public.save_game(text, jsonb), public.touch_save(text) to authenticated;
