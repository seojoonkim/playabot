import { useChatStore } from '@/stores/chat-store';
import { useIdolStore } from '@/stores/idol-store';
import { useEffect, useRef, useMemo } from 'react';
import ChatLayout from '@/components/chat/ChatLayout';
import type { IdolMeta } from '@/types/idol';
import { PLAYA_SYSTEM_PROMPT } from '@/constants/prompt-template';

const PLAYA_IDOL_ID = 'playa';

const PLAYA_FALLBACK: IdolMeta = {
  id: 'playa',
  nameKo: '플라야 컨시어지',
  nameEn: 'PLAYA Concierge',
  group: 'PLAYA',
  agencyId: 'playa',
  profileImageUrl: '/playa-logo.jpg',
  themeColor: '#1a1a2e',
  themeColorSecondary: '#16213e',
  tagline: 'PLAYA 프라이빗 멤버십 클럽',
  greeting: '안녕하세요. 플라야 컨시어지입니다.',
  firstVisitGreeting: '안녕하세요. 플라야 컨시어지입니다. 기존 회원이신가요, 아니면 처음으로 문의 주신 건가요?',
  language: 'ko',
  isBuiltIn: true,
  createdAt: 0,
  updatedAt: 0,
};

// 날짜 포맷
function getCurrentDate(): string {
  const now = new Date();
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}`;
}

// 시간대별 인사
function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '좋은 아침입니다, ';
  if (hour >= 12 && hour < 14) return '안녕하세요, ';
  if (hour >= 14 && hour < 18) return '안녕하세요, ';
  if (hour >= 18 && hour < 22) return '안녕하세요, ';
  return '늦은 시간에 문의 주셨군요, ';
}

// 위젯 embed용 — iframe 내에서 렌더링, 배경/스크롤 없이 채팅만 표시
export default function EmbedPage() {
  const currentIdolId = useChatStore((s) => s.currentIdolId);
  const setCurrentIdol = useChatStore((s) => s.setCurrentIdol);
  const loadIdols = useIdolStore((s) => s.loadIdols);
  const idols = useIdolStore((s) => s.idols);
  const loading = useIdolStore((s) => s.loading);
  const initialSynced = useRef(false);

  // URL 파라미터에서 회원 정보 읽기
  const memberInfo = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      name: params.get('name') || '',
      email: params.get('email') || '',
      phone: params.get('phone') || '',
      membership: params.get('membership') || '',
      locker: params.get('locker') || '',
    };
  }, []);

  const isMember = !!memberInfo.name;

  // 회원 정보가 있으면 시스템 프롬프트에 컨텍스트 추가
  const systemPromptOverride = useMemo(() => {
    const base = PLAYA_SYSTEM_PROMPT.replace('{{currentDate}}', getCurrentDate());
    if (!isMember) return undefined;

    const memberContext = `
[현재 상담 중인 회원 정보 — 이미 로그인된 기존 회원]
- 이름: ${memberInfo.name}${memberInfo.email ? `\n- 이메일: ${memberInfo.email}` : ''}${memberInfo.phone ? `\n- 전화번호: ${memberInfo.phone}` : ''}${memberInfo.membership ? `\n- 회원권 유형: ${memberInfo.membership}` : ''}${memberInfo.locker ? `\n- 사물함: ${memberInfo.locker}` : ''}

[중요 지침]
- 이 회원은 플라야 앱에 로그인된 기존 회원입니다.
- "기존 회원이신가요" 질문 절대 생략 (이미 확인됨)
- "${memberInfo.name}님"으로 바로 호칭
- 성함 재확인 불필요
- 바로 도움 요청 사항을 물어볼 것`;

    return base + '\n\n' + memberContext;
  }, [isMember, memberInfo]);

  // 회원용 맞춤 인사
  const initialGreeting = useMemo(() => {
    if (!isMember) return undefined;
    const timePrefix = getTimeGreeting();
    return `${timePrefix}${memberInfo.name}님. 플라야 컨시어지입니다. 무엇을 도와드릴까요? 😊`;
  }, [isMember, memberInfo.name]);

  useEffect(() => {
    loadIdols();
  }, [loadIdols]);

  useEffect(() => {
    if (loading || idols.length === 0 || initialSynced.current) return;
    initialSynced.current = true;
    const playaIdol = idols.find((i) => i.id === PLAYA_IDOL_ID);
    if (playaIdol && !currentIdolId) {
      setCurrentIdol(PLAYA_IDOL_ID);
    }
  }, [loading, idols, currentIdolId, setCurrentIdol]);

  const activeIdol = idols.find((i) => i.id === PLAYA_IDOL_ID) ?? PLAYA_FALLBACK;

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', backgroundColor: '#fff' }}>
      <ChatLayout
        idol={activeIdol}
        systemPromptOverride={systemPromptOverride}
        initialGreeting={initialGreeting}
      />
    </div>
  );
}
