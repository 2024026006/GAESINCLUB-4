-- Phase 3: 트리거 및 함수

-- 1. auth.users INSERT 시 public.users 자동 생성 (프로필 완성 전 기본 행)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 회원가입 complete 페이지에서 별도 INSERT 하므로 여기서는 아무것도 하지 않음
  -- 이 트리거는 Auth hook으로만 사용
  return new;
end;
$$;

-- 2. 방장 역할 이전 함수
create or replace function public.transfer_leadership(
  p_club_id uuid,
  p_new_leader_id uuid
)
returns void
language plpgsql
security definer
as $$
declare
  v_current_leader_id uuid;
begin
  -- 현재 방장 확인
  select user_id into v_current_leader_id
  from public.club_members
  where club_id = p_club_id and role = '방장'
  limit 1;

  if v_current_leader_id is null then
    raise exception '현재 방장을 찾을 수 없습니다.';
  end if;

  if v_current_leader_id = p_new_leader_id then
    raise exception '본인에게 방장 역할을 이전할 수 없습니다.';
  end if;

  -- 트랜잭션: 현재 방장 → 일반 회원, 신규 방장 지정
  update public.club_members
  set role = '일반 회원'
  where club_id = p_club_id and user_id = v_current_leader_id;

  update public.club_members
  set role = '방장'
  where club_id = p_club_id and user_id = p_new_leader_id;
end;
$$;

-- 3. 동아리당 방장 1명 유지 검증
create or replace function public.check_single_leader()
returns trigger
language plpgsql
as $$
begin
  if new.role = '방장' then
    if exists (
      select 1 from public.club_members
      where club_id = new.club_id and role = '방장' and id != new.id
    ) then
      raise exception '동아리당 방장은 1명만 가능합니다.';
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_check_single_leader
  before insert or update on public.club_members
  for each row execute function public.check_single_leader();

-- 4. 고정 공지 3개 초과 시 가장 오래된 고정 자동 해제
create or replace function public.check_pin_limit()
returns trigger
language plpgsql
as $$
declare
  v_oldest_pinned_id uuid;
  v_pin_count int;
begin
  if new.is_pinned = true then
    select count(*) into v_pin_count
    from public.notices
    where club_id = new.club_id and is_pinned = true and id != new.id;

    if v_pin_count >= 3 then
      -- 가장 오래된 고정 공지 해제
      select id into v_oldest_pinned_id
      from public.notices
      where club_id = new.club_id and is_pinned = true and id != new.id
      order by created_at asc
      limit 1;

      update public.notices
      set is_pinned = false
      where id = v_oldest_pinned_id;
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_check_pin_limit
  before insert or update on public.notices
  for each row execute function public.check_pin_limit();

-- 5. club_members INSERT 시 member_fee_status 자동 생성
create or replace function public.auto_member_fee_status()
returns trigger
language plpgsql
as $$
begin
  insert into public.member_fee_status (club_id, user_id, status)
  values (new.club_id, new.user_id, '미납')
  on conflict (club_id, user_id) do nothing;
  return new;
end;
$$;

create trigger trg_auto_member_fee_status
  after insert on public.club_members
  for each row execute function public.auto_member_fee_status();

-- 6. posts.updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

create trigger trg_chat_updated_at
  before update on public.chat_messages
  for each row execute function public.set_updated_at();

-- 7. 동아리 개설자 자동 방장 등록
create or replace function public.auto_assign_leader()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.club_members (club_id, user_id, role)
  values (new.id, auth.uid(), '방장');
  return new;
end;
$$;

create trigger trg_auto_assign_leader
  after insert on public.clubs
  for each row execute function public.auto_assign_leader();
