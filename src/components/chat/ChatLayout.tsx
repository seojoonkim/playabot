import { useEffect, useRef, useCallback, useState } from 'react';
import type { IdolMeta } from '@/types/idol';
import { useSystemPrompt } from '@/hooks/use-system-prompt';
import { useChat } from '@/hooks/use-chat';
import { useChatStore } from '@/stores/chat-store';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput, { type Attachment } from './ChatInput';

interface Props {
  idol: IdolMeta;
}

// 시간대별 인사 prefix
function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '좋은 아침입니다. ';
  if (hour >= 12 && hour < 14) return '점심 시간이시군요. ';
  if (hour >= 14 && hour < 18) return '안녕하세요. ';
  if (hour >= 18 && hour < 22) return '편안한 저녁이시길 바랍니다. ';
  return '늦은 시간에 문의 주셨군요. ';
}

// PLAYA 컨시어지 첫 인사
function getFirstVisitGreeting(idol: IdolMeta): string {
  const timeGreeting = getTimeGreeting();
  if (idol.firstVisitGreeting) {
    return timeGreeting + idol.firstVisitGreeting;
  }
  return timeGreeting + '플라야 컨시어지입니다. 기존 회원이신가요, 아니면 처음으로 문의 주신 건가요?';
}

// 재방문 인사
function getReturningGreeting(_language: string = 'ko'): string {
  const timeGreeting = getTimeGreeting();
  return timeGreeting + '다시 찾아주셨군요. 추가로 궁금하신 점이 있으시면 편하게 말씀해 주세요.';
}

export default function ChatLayout({ idol }: Props) {
  const { systemPrompt, knowledge } = useSystemPrompt(idol);
  const { messages, isStreaming, error, sendMessage, addAssistantMessage, historyLoaded } =
    useChat(systemPrompt, knowledge);

  const initialMessageSent = useRef(false);
  
  // 메시지 큐잉: AI 응답 중에 입력하면 대기
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // 아이돌이 먼저 인사하기 (첫 방문 vs 재방문 구분)
  useEffect(() => {
    if (historyLoaded && messages.length === 0 && !initialMessageSent.current) {
      initialMessageSent.current = true;
      
      // 첫 방문 여부 확인 (localStorage)
      const visitKey = `mim_visited_${idol.id}`;
      const hasVisitedBefore = localStorage.getItem(visitKey) === 'true';
      
      // 인사말 결정
      let greeting: string;
      if (hasVisitedBefore) {
        // 재방문 - 시간대별 인사
        greeting = getReturningGreeting(idol.language || 'ko');
        console.log('[ChatLayout] Returning user greeting:', greeting);
      } else {
        // 첫 방문 - 아이돌별 개성 있는 인사
        greeting = getFirstVisitGreeting(idol);
        // 첫 방문 기록 저장
        localStorage.setItem(visitKey, 'true');
        console.log('[ChatLayout] First visit greeting:', greeting);
      }
      
      // 자연스러운 딜레이 (0.3~0.6초)
      const delay = 300 + Math.random() * 300;
      setTimeout(() => {
        addAssistantMessage(greeting);
      }, delay);
    }
  }, [historyLoaded, messages.length, idol.id, idol.language, addAssistantMessage]);

  // Handle message sending - queue if AI is responding
  const handleSendMessage = useCallback((text: string, attachments?: Attachment[]) => {
    if (isStreaming) {
      setPendingMessage(text);
      return;
    }
    sendMessage(text, false, attachments);
  }, [sendMessage, isStreaming]);
  
  // AI 응답 완료 후 대기 메시지 전송
  useEffect(() => {
    if (!isStreaming && pendingMessage) {
      const msg = pendingMessage;
      setPendingMessage(null);
      // 약간의 딜레이 후 전송 (자연스러운 UX)
      setTimeout(() => sendMessage(msg), 100);
    }
  }, [isStreaming, pendingMessage, sendMessage]);

  // Save conversation on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      useChatStore.getState().persistMessages();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="flex flex-col h-screen shadow-xl overflow-hidden overflow-x-hidden" style={{ backgroundColor: '#111111' }}>
      <ChatHeader idol={idol} />

      {!historyLoaded ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="loading-spinner" />
            <div className="text-gray-300 text-sm">
              {idol.language === 'ja' ? '読み込み中...' : idol.language === 'en' ? 'Loading...' : '로딩중...'}
            </div>
          </div>
        </div>
      ) : (
        <MessageList
          messages={messages}
          idol={idol}
          isStreaming={isStreaming}
        />
      )}

      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-xs text-center animate-shake">
          {error}
        </div>
      )}

      {/* Desktop: input fixed to viewport bottom */}
      <div className="animate-input-in mt-auto">
        <ChatInput
          onSend={handleSendMessage}
          disabled={!historyLoaded}
          themeColor={idol.themeColor}
          language={idol.language}
        />
      </div>
    </div>
  );
}
