import { useChatStore } from '@/stores/chat-store';
import { useIdolStore } from '@/stores/idol-store';
import { useEffect, useRef } from 'react';
import ChatLayout from '@/components/chat/ChatLayout';
import type { IdolMeta } from '@/types/idol';

const PLAYA_IDOL_ID = 'playa';

// 스피너 없이 즉시 렌더링할 기본값
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

export default function ChatPage() {
  const currentIdolId = useChatStore((s) => s.currentIdolId);
  const setCurrentIdol = useChatStore((s) => s.setCurrentIdol);
  const loadIdols = useIdolStore((s) => s.loadIdols);
  const idols = useIdolStore((s) => s.idols);
  const loading = useIdolStore((s) => s.loading);
  const initialSynced = useRef(false);

  // 아이돌 목록 로드
  useEffect(() => {
    loadIdols();
  }, [loadIdols]);

  // playa 아이돌 자동 선택
  useEffect(() => {
    if (loading || idols.length === 0 || initialSynced.current) return;
    initialSynced.current = true;

    const playaIdol = idols.find((i) => i.id === PLAYA_IDOL_ID);
    if (playaIdol && !currentIdolId) {
      setCurrentIdol(PLAYA_IDOL_ID);
    }
  }, [loading, idols, currentIdolId, setCurrentIdol]);

  // 로딩 중에도 fallback으로 즉시 렌더링 (스피너 없음)
  const activeIdol = idols.find((i) => i.id === PLAYA_IDOL_ID) ?? PLAYA_FALLBACK;

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full h-screen" style={{ maxWidth: '600px' }}>
        <ChatLayout idol={activeIdol} />
      </div>
    </div>
  );
}
