-- ============================================================
-- SAMMCO 플레이어 계정 규칙 (Supabase > SQL Editor 에 통째로 붙여넣고 Run)
-- 전제: Authentication > Providers > Email 에서
--       "Confirm email" 을 OFF 로 꺼두세요. (실제 이메일을 쓰지 않는 구조라서 필수)
-- ============================================================

-- 1) 프로필 테이블: 닉네임 + 생일만 저장
create table if not exists public.profiles (
  id        uuid primary key references auth.users(id) on delete cascade,
  nickname  text not null,
  birthday  date not null,
  created_at timestamptz not null default now(),
  constraint nickname_format check (nickname ~ '^[A-Za-z]{3,12}$'),
  constraint age_14_plus     check (birthday <= (current_date - interval '14 years')::date
                                    and birthday >= date '1900-01-01')
);
-- 닉네임 중복 방지 (대소문자 구분 없이)
create unique index if not exists profiles_nickname_lower on public.profiles (lower(nickname));

-- 2) 보안: 본인 것만 읽을 수 있고, 직접 쓰기는 불가 (가입은 아래 트리거만 처리)
alter table public.profiles enable row level security;
drop policy if exists "own profile read" on public.profiles;
create policy "own profile read" on public.profiles
  for select using (auth.uid() = id);

-- 3) 가입 시 자동 검사 + 프로필 생성
--    14세 미만이거나 닉네임 형식이 틀리면 계정 생성 자체가 거부됩니다. (화면을 우회해도 막힘)
create or replace function public.handle_new_player()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  nick text := new.raw_user_meta_data->>'nickname';
  bday date;
begin
  begin
    bday := (new.raw_user_meta_data->>'birthday')::date;
  exception when others then
    raise exception 'INVALID_BIRTHDAY';
  end;
  if nick is null or nick !~ '^[A-Za-z]{3,12}$' then
    raise exception 'INVALID_NICKNAME';
  end if;
  if bday is null or bday < date '1900-01-01' or bday > (current_date - interval '14 years')::date then
    raise exception 'UNDER_AGE';
  end if;
  insert into public.profiles (id, nickname, birthday) values (new.id, nick, bday);
  return new;
end $$;

drop trigger if exists on_auth_player_created on auth.users;
create trigger on_auth_player_created
  after insert on auth.users
  for each row execute function public.handle_new_player();
