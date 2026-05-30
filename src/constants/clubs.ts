import type { Category } from '@/types'

export interface ClubSeed {
  name: string
  category: Category
  founded_year: number
  description: string
}

export const OFFICIAL_CLUBS: ClubSeed[] = [
  // 교양
  { name: '다이다이', category: '교양', founded_year: 2020, description: '공예 등 DIY 활동을 통한 창의력 향상' },
  { name: 'Roll Dice', category: '교양', founded_year: 2017, description: '보드게임을 통한 건전문화 조성' },
  { name: 'Youth Culture', category: '교양', founded_year: 2024, description: '트렌드에 맞는 패션 정보 전달' },
  // 학술
  { name: 'AVES', category: '학술', founded_year: 1985, description: '영어 회화력 향상' },
  { name: '가온', category: '학술', founded_year: 2011, description: '취업을 위한 실무능력 향상' },
  { name: '한별', category: '학술', founded_year: 1979, description: '별 관측 및 천문 연구' },
  { name: '보이는소리', category: '학술', founded_year: 2024, description: '청인과 농인 간 소통 활성화 및 수어 인식 개선' },
  { name: 'VITALL', category: '학술', founded_year: 2024, description: '계절별 식생 관찰 및 생태연구·기록' },
  // 문화
  { name: 'SIVA CREW', category: '문화', founded_year: 1994, description: '댄스를 통한 건전한 문화 정착' },
  { name: '극예술연구회(시네씨아)', category: '문화', founded_year: 1968, description: '연극을 통한 정서함양 및 문화 창달' },
  { name: '꼴로르', category: '문화', founded_year: 1998, description: '미술을 통한 미적 자아실현' },
  { name: '민속연구회', category: '문화', founded_year: 1979, description: '풍물 등 민족문화 창달과 공동체 정신 함양' },
  { name: '블랙홀', category: '문화', founded_year: 1988, description: '락 음악 활동' },
  { name: '소용돌이', category: '문화', founded_year: 1971, description: '음악 활동' },
  { name: '소울로직', category: '문화', founded_year: 2010, description: '흑인음악 문화' },
  { name: '아르페지오', category: '문화', founded_year: 1989, description: '통기타 음악을 통한 정서함양' },
  { name: '푸른소리', category: '문화', founded_year: 1996, description: '음악 활동 및 거리공연' },
  { name: '홀리보이스', category: '문화', founded_year: 1984, description: '합창 활동' },
  { name: '폴리포니', category: '문화', founded_year: 1980, description: '클래식 기타를 통한 인격도야' },
  { name: 'RHEIN Philharmonic', category: '문화', founded_year: 2019, description: '관현악단 합주 및 음악적 소통 교감' },
  { name: '징검다리사진반', category: '문화', founded_year: 1967, description: '아마추어 사진예술 보급' },
  { name: '창문학동인회', category: '문화', founded_year: 1964, description: '문예창작 및 감상을 통한 인격함양' },
  { name: '늘해랑', category: '문화', founded_year: 2020, description: '액션 치어리딩' },
  { name: '어뮤즈먼트', category: '문화', founded_year: 2021, description: '뮤지컬을 통한 학생 문화생활 고취' },
  // 봉사
  { name: 'RCY', category: '봉사', founded_year: 1963, description: '적십자 이념 구현 및 봉사활동' },
  { name: '로타랙트', category: '봉사', founded_year: 1980, description: '청소년 자아개발 및 사회 봉사활동' },
  { name: '어울림', category: '봉사', founded_year: 2014, description: '지식 및 재능 봉사를 통한 인격함양' },
  { name: '위더스', category: '봉사', founded_year: 2012, description: '집수리 봉사를 통한 희망 나눔' },
  { name: 'ADOZ in Green On', category: '봉사', founded_year: 1999, description: '교내 환경 인식 고취' },
  { name: '아이펫츄', category: '봉사', founded_year: 2023, description: '유기동물에 대한 인식 개선' },
  // 체육
  { name: '타우루스', category: '체육', founded_year: 2025, description: '야구를 통한 체력 증진과 친목 도모' },
  { name: '바이펙스', category: '체육', founded_year: 2016, description: '자전거를 통한 체육문화 확산' },
  { name: '화랑검우회', category: '체육', founded_year: 1989, description: '검도를 통한 심신단련' },
  { name: '물밑세상', category: '체육', founded_year: 1993, description: '수중 생태계 관찰 및 심신단련' },
  { name: '반쪽날개', category: '체육', founded_year: 2000, description: '농구를 통한 여가선용 및 체력증진' },
  { name: '수영사랑', category: '체육', founded_year: 1990, description: '수영 인구 저변확대와 친목 도모' },
  { name: '콕콕', category: '체육', founded_year: 2016, description: '배드민턴을 통한 건강증진 및 친목도모' },
  { name: '태극태권도연구회', category: '체육', founded_year: 1998, description: '태권도를 통한 체력증진과 정신함양' },
  { name: '페가수스', category: '체육', founded_year: 2001, description: '승마를 통한 심신수련 및 호연지기' },
  { name: '푸른밀가루', category: '체육', founded_year: 1999, description: '농구 실력 향상 및 친목 도모' },
  { name: '엣지', category: '체육', founded_year: 2023, description: '스키를 통한 심신 연마' },
  { name: 'Light Weight', category: '체육', founded_year: 2023, description: '근력 운동을 통한 신체 단련과 정신 수련' },
  { name: '북두칠성', category: '체육', founded_year: 2024, description: '탁구를 통한 건전한 체육활동과 협동심 증진' },
  // 종교
  { name: 'C.C.C', category: '종교', founded_year: 1967, description: '대학생 신앙 선교 및 복음화' },
  { name: 'I.V.F', category: '종교', founded_year: 2005, description: '캠퍼스 복음화' },
  { name: 'I.Y.F', category: '종교', founded_year: 2001, description: '국제 청소년 선교 및 교육' },
  { name: 'SFC', category: '종교', founded_year: 1998, description: '전도와 선교운동 양성 및 복음화' },
  { name: '가톨릭학생회', category: '종교', founded_year: 1966, description: '신앙심 고취 및 캠퍼스 복음화' },
  { name: '불교학생회', category: '종교', founded_year: 1965, description: '불타의 해명을 통한 자아실현' },
  { name: '네비게이토', category: '종교', founded_year: 1997, description: '예수 그리스도 사상 전파' },
]

export const OFFICIAL_CLUB_NAMES = OFFICIAL_CLUBS.map((c) => c.name)
