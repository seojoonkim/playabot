import { useState, useRef, useEffect, useCallback } from 'react';

export interface Attachment {
  base64: string;
  mimeType: string;
  name: string;
  previewUrl: string;
}

interface Props {
  onSend: (text: string, attachments?: Attachment[]) => void;
  disabled: boolean;
  themeColor: string;
  language?: string;
}

function getPlaceholder(_language?: string): string {
  return '플라야에 대해 궁금한 점을 물어보세요...';
}

const getSpeechRecognition = () =>
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function ChatInput({ onSend, disabled, themeColor, language }: Props) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const expandedRef = useRef<HTMLTextAreaElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      !window.navigator.userAgent.includes('Safari') ||
      window.navigator.userAgent.includes('CriOS') ||
      window.navigator.userAgent.includes('FxiOS');
    setIsStandalone(standalone);
    setSpeechSupported(!!getSpeechRecognition());
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (formRef.current && window.visualViewport) {
        const bottomInset =
          window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop;
        formRef.current.style.paddingBottom = isStandalone
          ? 'max(1rem, env(safe-area-inset-bottom))'
          : `${Math.max(50, bottomInset)}px`;
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      handleResize();
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [isStandalone]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && attachments.length === 0) return;
    onSend(text, attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments((prev) => {
      prev.forEach((a) => URL.revokeObjectURL(a.previewUrl));
      return [];
    });
    if (inputRef.current) inputRef.current.style.height = 'auto';
  };

  const handleKeyDown = (_e: React.KeyboardEvent) => {
    // Enter = 줄바꿈 (발송은 버튼으로만)
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const sh = inputRef.current.scrollHeight;
      inputRef.current.style.height = `${Math.min(sh, 200)}px`;
      setIsMultiLine(sh > 52);
    }
  }, [text]);

  useEffect(() => {
    if (!disabled && inputRef.current) inputRef.current.focus();
  }, [disabled]);

  // 이미지 첨부
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;

    const newAttachments: Attachment[] = await Promise.all(
      files.slice(0, 5).map(async (file) => {
        const previewUrl = URL.createObjectURL(file);
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1] || '');
          };
          reader.readAsDataURL(file);
        });
        return { base64, mimeType: file.type, name: file.name, previewUrl };
      }),
    );

    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 5));
    e.target.value = '';
  }, []);

  const removeAttachment = useCallback((idx: number) => {
    setAttachments((prev) => {
      const item = prev[idx];
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  }, []);

  // 음성 인식
  const toggleListening = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let interim = '';
      let finalText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (finalText) setText((prev) => prev + finalText);
      setInterimTranscript(interim);
    };
    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };
    recognition.onerror = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening]);

  const hasContent = text.trim().length > 0 || attachments.length > 0;

  return (
    <>
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="fixed left-1/2 -translate-x-1/2 w-full bg-white/95 backdrop-blur-md border-t border-gray-100 px-3 pt-2 flex flex-col gap-2"
      style={{
        maxWidth: '600px',
        bottom: 0,
        paddingBottom: isStandalone ? 'max(1rem, env(safe-area-inset-bottom))' : '50px',
      }}
    >
      {/* 이미지 미리보기 — 메신저 스타일 */}
      {attachments.length > 0 && (
        <div className="flex gap-2 px-1 pb-1 overflow-x-auto scrollbar-hide">
          {attachments.map((att, idx) => (
            <div
              key={idx}
              className="relative shrink-0 rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              style={{ width: 72, height: 72 }}
            >
              <img
                src={att.previewUrl}
                alt={att.name}
                className="w-full h-full object-cover"
              />
              {/* X 삭제 버튼 */}
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                style={{ fontSize: 11, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 입력 행 */}
      <div className="flex items-center gap-2">
        {/* 이미지 첨부 버튼 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 active:scale-90 transition-all flex items-center justify-center shrink-0"
          title="이미지 첨부"
        >
          {/* 이미지 아이콘 */}
          <svg
            className="text-gray-500"
            style={{ width: 18, height: 18 }}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </button>

        {/* 텍스트 입력창 + 마이크 */}
        <div className="relative flex-1">
          <textarea
            ref={inputRef}
            value={isListening && interimTranscript ? text + interimTranscript : text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder(language)}
            rows={1}
            className="w-full pl-4 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-[15px] outline-none
              focus:border-purple-300 focus:ring-2 focus:ring-purple-50 transition-all duration-200
              resize-none leading-relaxed scrollbar-hide"
            style={{
              minHeight: '42px',
              maxHeight: '200px',
              paddingRight: isMultiLine ? '2.5rem' : '2.75rem',
            }}
            autoFocus
          />

          {/* 확대 버튼 — 멀티라인일 때 우상단 */}
          {isMultiLine && (
            <button
              type="button"
              onClick={() => setIsExpanded(true)}
              className="absolute top-2 right-2.5 w-6 h-6 flex items-center justify-center rounded-md bg-gray-200/80 hover:bg-gray-300 transition-colors"
              title="입력창 확대"
            >
              <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-5h-4m4 0v4m0-4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          )}

          {/* 마이크 버튼 — 우하단 (항상) */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-2.5 bottom-2 w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                isListening ? 'text-red-500 animate-pulse' : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isListening ? '음성 인식 중지' : '음성으로 입력'}
            >
              <svg style={{ width: 20, height: 20 }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zm-1 3a1 1 0 012 0v8a1 1 0 01-2 0V4zm-6 8a7 7 0 0014 0h-2a5 5 0 01-10 0H5zm7 7v3h-2v-3a9.02 9.02 0 01-6.93-5.5l1.87-.7A7.002 7.002 0 0012 21a7.002 7.002 0 007.06-5.2l1.87.7A9.02 9.02 0 0114 19v3h-2v-3z" />
              </svg>
            </button>
          )}
        </div>

        {/* 전송 버튼 */}
        <button
          type="submit"
          disabled={!hasContent}
          className="w-10 h-10 rounded-full flex items-center justify-center text-white
            disabled:opacity-30 transition-all duration-200 hover:shadow-lg active:scale-90 shrink-0"
          style={{
            backgroundColor: hasContent ? themeColor : '#d1d5db',
            boxShadow: hasContent ? `0 4px 12px -2px ${themeColor}40` : 'none',
          }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </form>

    {/* 전체화면 확대 입력 모달 */}
    {isExpanded && (
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        {/* 상단 바 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <span className="text-sm font-medium text-gray-500">메시지 작성</span>
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title="축소"
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v4m0-4h4m6 0h4m0 0v4m0-4l-5 5M9 15l-5 5m0 0h4m-4 0v-4m16 4l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
        </div>

        {/* 확대 textarea */}
        <textarea
          ref={expandedRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={getPlaceholder(language)}
          className="flex-1 px-5 py-4 text-[16px] leading-relaxed outline-none resize-none text-gray-800"
          autoFocus
        />

        {/* 하단 전송 버튼 */}
        <div
          className="flex items-center justify-end px-4 py-3 border-t border-gray-100"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            disabled={!hasContent}
            onClick={(e) => { setIsExpanded(false); handleSubmit(e as any); }}
            className="w-11 h-11 rounded-full flex items-center justify-center text-white
              disabled:opacity-30 transition-all duration-200 active:scale-90"
            style={{ backgroundColor: hasContent ? themeColor : '#d1d5db' }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </button>
        </div>
      </div>
    )}
    </>
  );
}
