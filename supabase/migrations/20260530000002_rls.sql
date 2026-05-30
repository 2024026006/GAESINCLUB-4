-- Phase 2: Row Level Security

-- 모든 테이블 RLS 활성화
alter table public.users enable row level security;
alter table public.clubs enable row level security;
alter table public.club_members enable row level security;
alter table public.join_requests enable row level security;
alter table public.notices enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.gallery_items enable row level security;
alter table public.events enable row level security;
alter table public.event_votes enable row level security;
alter table public.fees enable row level security;
alter table public.member_fee_status enable row level security;
alter table public.chat_messages enable row level security;
alter table public.notifications enable row level security;

-- 헬퍼 함수: 현재 유저가 특정 동아리의 부원인지 확인
create or replace function public.is_club_member(p_club_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.club_members
    where club_id = p_club_id and user_id = auth.uid()
  );
$$;

-- 헬퍼 함수: 현재 유저의 동아리 내 역할 확인
create or replace function public.get_club_role(p_club_id uuid)
returns text
language sql
security definer
stable
as $$
  select role from public.club_members
  where club_id = p_club_id and user_id = auth.uid()
  limit 1;
$$;

-- ===== users =====
create policy "본인 프로필 읽기" on public.users
  for select using (auth.uid() = id);

create policy "같은 동아리 부원 프로필 읽기" on public.users
  for select using (
    exists (
      select 1 from public.club_members cm1
      join public.club_members cm2 on cm1.club_id = cm2.club_id
      where cm1.user_id = auth.uid() and cm2.user_id = users.id
    )
  );

create policy "본인 프로필 수정" on public.users
  for update using (auth.uid() = id);

create policy "본인 프로필 생성" on public.users
  for insert with check (auth.uid() = id);

-- ===== clubs =====
create policy "인증 사용자 동아리 목록 조회" on public.clubs
  for select using (auth.role() = 'authenticated');

create policy "인증 사용자 동아리 개설" on public.clubs
  for insert with check (auth.role() = 'authenticated');

create policy "방장만 동아리 수정" on public.clubs
  for update using (
    public.get_club_role(id) = '방장'
  );

create policy "방장만 동아리 삭제" on public.clubs
  for delete using (
    public.get_club_role(id) = '방장'
  );

-- ===== club_members =====
create policy "부원 목록 조회" on public.club_members
  for select using (
    public.is_club_member(club_id)
  );

create policy "방장이 부원 추가" on public.club_members
  for insert with check (
    public.get_club_role(club_id) = '방장'
  );

create policy "방장이 역할 수정" on public.club_members
  for update using (
    public.get_club_role(club_id) = '방장'
  );

create policy "방장이 부원 삭제" on public.club_members
  for delete using (
    public.get_club_role(club_id) = '방장'
    or (user_id = auth.uid())  -- 본인 탈퇴
  );

-- ===== join_requests =====
create policy "신청자 본인 읽기" on public.join_requests
  for select using (user_id = auth.uid());

create policy "해당 동아리 방장 읽기" on public.join_requests
  for select using (
    public.get_club_role(club_id) = '방장'
  );

create policy "인증 사용자 신청" on public.join_requests
  for insert with check (
    auth.uid() = user_id
    and auth.role() = 'authenticated'
  );

create policy "방장 신청 처리" on public.join_requests
  for update using (
    public.get_club_role(club_id) = '방장'
  );

-- ===== notices =====
create policy "부원 공지 조회" on public.notices
  for select using (public.is_club_member(club_id));

create policy "방장·임원 공지 작성" on public.notices
  for insert with check (
    public.get_club_role(club_id) in ('방장', '임원')
  );

create policy "방장·임원 공지 수정" on public.notices
  for update using (
    public.get_club_role(club_id) in ('방장', '임원')
  );

create policy "방장·임원 공지 삭제" on public.notices
  for delete using (
    public.get_club_role(club_id) in ('방장', '임원')
  );

-- ===== posts =====
create policy "부원 게시글 조회" on public.posts
  for select using (public.is_club_member(club_id));

create policy "부원 게시글 작성" on public.posts
  for insert with check (
    public.is_club_member(club_id) and auth.uid() = author_id
  );

create policy "본인 게시글 수정" on public.posts
  for update using (auth.uid() = author_id);

create policy "본인·방장 게시글 삭제" on public.posts
  for delete using (
    auth.uid() = author_id
    or public.get_club_role(club_id) = '방장'
  );

-- ===== comments =====
create policy "부원 댓글 조회" on public.comments
  for select using (
    exists (
      select 1 from public.posts p
      where p.id = comments.post_id
      and public.is_club_member(p.club_id)
    )
  );

create policy "부원 댓글 작성" on public.comments
  for insert with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.posts p
      where p.id = comments.post_id
      and public.is_club_member(p.club_id)
    )
  );

create policy "본인·방장 댓글 삭제" on public.comments
  for delete using (
    auth.uid() = author_id
    or exists (
      select 1 from public.posts p
      where p.id = comments.post_id
      and public.get_club_role(p.club_id) = '방장'
    )
  );

-- ===== gallery_items =====
create policy "부원 갤러리 조회" on public.gallery_items
  for select using (public.is_club_member(club_id));

create policy "부원 갤러리 업로드" on public.gallery_items
  for insert with check (
    public.is_club_member(club_id) and auth.uid() = uploader_id
  );

create policy "업로더·방장 갤러리 삭제" on public.gallery_items
  for delete using (
    auth.uid() = uploader_id
    or public.get_club_role(club_id) = '방장'
  );

-- ===== events =====
create policy "부원 행사 조회" on public.events
  for select using (public.is_club_member(club_id));

create policy "방장·임원 행사 추가" on public.events
  for insert with check (
    public.get_club_role(club_id) in ('방장', '임원')
  );

create policy "방장·임원 행사 수정" on public.events
  for update using (
    public.get_club_role(club_id) in ('방장', '임원')
  );

create policy "방장·임원 행사 삭제" on public.events
  for delete using (
    public.get_club_role(club_id) in ('방장', '임원')
  );

-- ===== event_votes =====
create policy "부원 투표 조회" on public.event_votes
  for select using (
    exists (
      select 1 from public.events e
      where e.id = event_votes.event_id
      and public.is_club_member(e.club_id)
    )
  );

create policy "부원 투표" on public.event_votes
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.events e
      where e.id = event_votes.event_id
      and public.is_club_member(e.club_id)
    )
  );

create policy "본인 투표 수정" on public.event_votes
  for update using (auth.uid() = user_id);

-- ===== fees =====
create policy "부원 회비 조회" on public.fees
  for select using (public.is_club_member(club_id));

create policy "방장·임원·총무 회비 추가" on public.fees
  for insert with check (
    public.get_club_role(club_id) in ('방장', '임원', '총무')
  );

create policy "방장·임원·총무 회비 수정" on public.fees
  for update using (
    public.get_club_role(club_id) in ('방장', '임원', '총무')
  );

-- ===== member_fee_status =====
create policy "부원 납부 현황 조회" on public.member_fee_status
  for select using (public.is_club_member(club_id));

create policy "방장·임원·총무 납부 상태 관리" on public.member_fee_status
  for all using (
    public.get_club_role(club_id) in ('방장', '임원', '총무')
  );

-- ===== chat_messages =====
create policy "부원 채팅 조회" on public.chat_messages
  for select using (public.is_club_member(club_id));

create policy "부원 채팅 전송" on public.chat_messages
  for insert with check (
    public.is_club_member(club_id) and auth.uid() = sender_id
  );

create policy "본인 채팅 수정" on public.chat_messages
  for update using (auth.uid() = sender_id);

create policy "본인·방장 채팅 삭제" on public.chat_messages
  for delete using (
    auth.uid() = sender_id
    or public.get_club_role(club_id) = '방장'
  );

-- ===== notifications =====
create policy "본인 알림 조회" on public.notifications
  for select using (user_id = auth.uid());
