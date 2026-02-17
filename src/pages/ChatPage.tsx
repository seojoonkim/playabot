import { useChatStore } from '@/stores/chat-store';
import { useIdolStore } from '@/stores/idol-store';
import { useEffect, useRef, useState } from 'react';
import ChatLayout from '@/components/chat/ChatLayout';

type TransitionPhase = 'idle' | 'enter';

const PLAYA_IDOL_ID = 'playa';

export default function ChatPage() {
  const currentIdolId = useChatStore((s) => s.currentIdolId);
  const setCurrentIdol = useChatStore((s) => s.setCurrentIdol);
  const loadIdols = useIdolStore((s) => s.loadIdols);
  const idols = useIdolStore((s) => s.idols);
  const loading = useIdolStore((s) => s.loading);

  const [phase, setPhase] = useState<TransitionPhase>('idle');
  const [displayedIdolId, setDisplayedIdolId] = useState<string | null>(null);
  const initialSynced = useRef(false);

  // 아이돌 목록 로드
  useEffect(() => {
    loadIdols();
  }, [loadIdols]);

  // playa 아이돌 자동 선택 (선택 화면 없이 바로 채팅)
  useEffect(() => {
    if (loading || idols.length === 0 || initialSynced.current) return;
    initialSynced.current = true;

    const playaIdol = idols.find((i) => i.id === PLAYA_IDOL_ID);
    if (playaIdol && !currentIdolId) {
      setCurrentIdol(PLAYA_IDOL_ID);
    }
  }, [loading, idols, currentIdolId, setCurrentIdol]);

  // 트랜지션 처리
  useEffect(() => {
    if (currentIdolId && !displayedIdolId) {
      setPhase('enter');
      setDisplayedIdolId(currentIdolId);
      const timer = setTimeout(() => setPhase('idle'), 450);
      return () => clearTimeout(timer);
    }
  }, [currentIdolId, displayedIdolId]);

  if (loading || !displayedIdolId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="loading-spinner" />
          <div className="text-gray-400 text-sm animate-pulse">로딩 중...</div>
        </div>
      </div>
    );
  }

  const activeIdol = idols.find((i) => i.id === displayedIdolId);
  if (!activeIdol) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-400 text-sm">오류가 발생했습니다. 새로고침해 주세요.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div
        className={`w-full h-screen ${phase === 'enter' ? 'animate-page-slide-in' : ''}`}
        style={{ maxWidth: '600px' }}
      >
        <ChatLayout idol={activeIdol} />
      </div>
    </div>
  );
}
