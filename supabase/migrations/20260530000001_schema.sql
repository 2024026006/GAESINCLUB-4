-- Phase 1: 전체 테이블 스키마

create extension if not exists "uuid-ossp";

-- users (Supabase Auth 연동)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  student_id char(10) unique not null,
  college text not null,
  department text not null,
  phone text not null,
  status text not null check (status in ('재학', '휴학', '졸업')),
  created_at timestamptz not null default now()
);

-- clubs
create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  category text not null check (category in ('교양', '학술', '문화', '봉사', '체육', '종교')),
  recruit_status text not null check (recruit_status in ('모집 중', '모집 마감')) default '모집 중',
  intro text not null check (char_length(intro) <= 100) default '',
  founded_year int not null,
  created_at timestamptz not null default now()
);

-- club_members
create table public.club_members (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('방장', '임원', '총무', '일반 회원')),
  joined_at timestamptz not null default now(),
  unique (club_id, user_id)
);

-- join_requests
create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null check (status in ('대기', '승인', '거절')) default '대기',
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (club_id, user_id)
);

-- notices
create table public.notices (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  content text not null,
  is_pinned boolean not null default false,
  images text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- comments
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

-- gallery_items
create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  uploader_id uuid not null references public.users(id) on delete cascade,
  url text not null,
  file_type text not null,
  caption text,
  created_at timestamptz not null default now()
);

-- events
create table public.events (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz,
  created_at timestamptz not null default now()
);

-- event_votes
create table public.event_votes (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  vote text not null check (vote in ('참석', '불참', '미정')),
  unique (event_id, user_id)
);

-- fees
create table public.fees (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  author_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('입금', '지출')),
  amount int not null check (amount > 0),
  description text not null,
  receipt_url text,
  created_at timestamptz not null default now()
);

-- member_fee_status
create table public.member_fee_status (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null check (status in ('납부 완료', '미납')) default '미납',
  unique (club_id, user_id)
);

-- chat_messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text,
  image_url text,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- notifications (알림 로그)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}',
  sent_at timestamptz not null default now(),
  success boolean not null default false
);

-- 인덱스
create index on public.club_members (club_id);
create index on public.club_members (user_id);
create index on public.join_requests (club_id, status);
create index on public.notices (club_id, is_pinned);
create index on public.posts (club_id, created_at desc);
create index on public.comments (post_id);
create index on public.events (club_id, start_at);
create index on public.chat_messages (club_id, created_at desc);
create index on public.fees (club_id, created_at desc);
