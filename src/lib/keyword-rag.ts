/**
 * 키워드 기반 RAG - PLAYA 멤버십 클럽 전용
 */

export interface KeywordMatch {
  keyword: string;
  section: string;
  content: string;
}

// PLAYA 키워드 → 관련 섹션 매핑
const KEYWORD_MAP: Record<string, { section: string; keywords: string[] }[]> = {
  pricing: [
    { section: '가격', keywords: ['가격', '비용', '얼마', '가입비', '연회비', '보증금', '결제', '카드', '이체', '환불', '양도'] },
  ],
  membership: [
    { section: '멤버십', keywords: ['멤버십', '회원', '가입', '입회', '추천', '초대', '법인', '개인', '평생', '만기'] },
  ],
  tennis: [
    { section: '테니스', keywords: ['테니스', '레슨', '코트', '슬롯', '코치', '배드민턴'] },
  ],
  fitness: [
    { section: '피트니스', keywords: ['피트니스', '헬스', '운동', 'pt', '트레이닝', '24시간', '새벽'] },
  ],
  restaurant: [
    { section: '본연', keywords: ['본연', '레스토랑', '식사', '예약', '와인', '콜키지', '룸'] },
  ],
  lounge: [
    { section: '라운지', keywords: ['라운지', '카페', '미팅룸', '대관', '도산대로'] },
  ],
  facility: [
    { section: '시설', keywords: ['시설', '주차', '사물함', '락커', '샤워', '수건', '운동복', 'wifi', '와이파이'] },
  ],
  guest: [
    { section: '게스트', keywords: ['게스트', '초대', '프렌즈', '패스', '지인', '동반'] },
  ],
  family: [
    { section: '가족', keywords: ['가족', '배우자', '자녀', '패밀리', '아이', '아들', '딸'] },
  ],
  location: [
    { section: '위치', keywords: ['위치', '주소', '어디', '논현', '파티오나인', '도산대로', '강남'] },
  ],
  hours: [
    { section: '운영시간', keywords: ['운영시간', '오픈', '몇시', '시간', '휴무', '영업'] },
  ],
  concierge: [
    { section: '컨시어지', keywords: ['컨시어지', '와인 구매', '부동산', '추천'] },
  ],
};

/**
 * 텍스트에서 매칭되는 키워드 카테고리 찾기
 */
export function findKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  const matched: string[] = [];
  
  for (const [category, mappings] of Object.entries(KEYWORD_MAP)) {
    for (const mapping of mappings) {
      for (const keyword of mapping.keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          if (!matched.includes(category)) {
            matched.push(category);
          }
          break;
        }
      }
    }
  }
  
  return matched;
}

/**
 * MD 컨텐츠에서 특정 섹션 추출 (## 헤딩 기준)
 */
export function extractSection(mdContent: string, sectionKeywords: string[]): string {
  const lines = mdContent.split('\n');
  const sections: string[] = [];
  let currentSection = '';
  let currentContent: string[] = [];
  let capturing = false;
  
  for (const line of lines) {
    if (line.startsWith('## ') || line.startsWith('### ')) {
      if (capturing && currentContent.length > 0) {
        sections.push(currentContent.join('\n'));
      }
      
      currentSection = line.toLowerCase();
      currentContent = [line];
      capturing = sectionKeywords.some(kw => 
        currentSection.includes(kw.toLowerCase())
      );
    } else if (capturing) {
      currentContent.push(line);
    }
  }
  
  if (capturing && currentContent.length > 0) {
    sections.push(currentContent.join('\n'));
  }
  
  return sections.join('\n\n');
}

/**
 * 키워드 카테고리에 해당하는 섹션 키워드 반환
 */
export function getSectionKeywords(categories: string[]): string[] {
  const sectionKeywords: string[] = [];
  
  for (const category of categories) {
    const mappings = KEYWORD_MAP[category];
    if (mappings) {
      for (const mapping of mappings) {
        sectionKeywords.push(mapping.section);
      }
    }
  }
  
  return sectionKeywords;
}

/**
 * 사용자 메시지 기반으로 관련 컨텍스트 추출
 */
export function getRelevantContext(
  userMessage: string,
  knowledgeFiles: Record<string, string>
): string {
  const matchedCategories = findKeywords(userMessage);
  
  if (matchedCategories.length === 0) {
    return '';
  }
  
  const sectionKeywords = getSectionKeywords(matchedCategories);
  const relevantSections: string[] = [];
  
  for (const [filename, content] of Object.entries(knowledgeFiles)) {
    const extracted = extractSection(content, sectionKeywords);
    if (extracted.trim()) {
      relevantSections.push(`[${filename}에서 추출]\n${extracted}`);
    }
  }
  
  if (relevantSections.length === 0) {
    return '';
  }
  
  return `\n\n---\n## 🔍 이 대화와 관련된 추가 정보 (참고해서 자연스럽게 답변하세요)\n\n${relevantSections.join('\n\n')}`;
}
