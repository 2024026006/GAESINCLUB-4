export type Role = '방장' | '임원' | '총무' | '일반 회원'
export type RecruitStatus = '모집 중' | '모집 마감'
export type Category = '교양' | '학술' | '문화' | '봉사' | '체육' | '종교'
export type EnrollStatus = '재학' | '휴학' | '졸업'
export type JoinRequestStatus = '대기' | '승인' | '거절'
export type FeeType = '입금' | '지출'
export type MemberFeeStatus = '납부 완료' | '미납'
export type VoteOption = '참석' | '불참' | '미정'

export interface User {
  id: string
  name: string
  student_id: string
  college: string
  department: string
  phone: string
  status: EnrollStatus
  created_at: string
}

export interface Club {
  id: string
  name: string
  category: Category
  recruit_status: RecruitStatus
  intro: string
  founded_year: number
  created_at: string
}

export interface ClubMember {
  id: string
  club_id: string
  user_id: string
  role: Role
  joined_at: string
  user?: User
  club?: Club
}

export interface JoinRequest {
  id: string
  club_id: string
  user_id: string
  status: JoinRequestStatus
  requested_at: string
  processed_at: string | null
  user?: User
  club?: Club
}

export interface Notice {
  id: string
  club_id: string
  author_id: string
  title: string
  content: string
  is_pinned: boolean
  images: string[]
  created_at: string
  author?: User
}

export interface Post {
  id: string
  club_id: string
  author_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  author?: User
  comment_count?: number
}

export interface Comment {
  id: string
  post_id: string
  author_id: string
  content: string
  created_at: string
  author?: User
}

export interface GalleryItem {
  id: string
  club_id: string
  uploader_id: string
  url: string
  file_type: string
  caption: string | null
  created_at: string
  uploader?: User
}

export interface Event {
  id: string
  club_id: string
  author_id: string
  title: string
  description: string | null
  start_at: string
  end_at: string | null
  created_at: string
  author?: User
  votes?: EventVote[]
}

export interface EventVote {
  id: string
  event_id: string
  user_id: string
  vote: VoteOption
  user?: User
}

export interface Fee {
  id: string
  club_id: string
  author_id: string
  type: FeeType
  amount: number
  description: string
  receipt_url: string | null
  created_at: string
  author?: User
}

export interface MemberFeeStatusRecord {
  id: string
  club_id: string
  user_id: string
  status: MemberFeeStatus
  user?: User
}

export interface ChatMessage {
  id: string
  club_id: string
  sender_id: string
  content: string | null
  image_url: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
  sender?: User
}
