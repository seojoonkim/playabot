import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

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
  return '메시지를 입력하세요...';
}

const getSpeechRecognition = () =>
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function ChatInput({ onSend, disabled, themeColor: _themeColor, language }: Props) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const expandedRef = useRef<HTMLTextAreaElement>(null);

  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    setSpeechSupported(!!getSpeechRecognition());
  }, []);

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
          reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
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
        if (event.results[i].isFinal) finalText += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (finalText) setText((prev) => prev + finalText);
      setInterimTranscript(interim);
    };
    recognition.onend = () => { setIsListening(false); setInterimTranscript(''); };
    recognition.onerror = () => { setIsListening(false); setInterimTranscript(''); };
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
        className="w-full px-3 pt-2 flex flex-col gap-2"
        style={{
          backgroundColor: '#111111',
          paddingBottom: isStandalone
            ? 'max(1rem, env(safe-area-inset-bottom))'
            : '1rem',
        }}
      >
        {/* 이미지 미리보기 */}
        {attachments.length > 0 && (
          <div className="flex gap-2 px-1 pb-1 overflow-x-auto scrollbar-hide">
            {attachments.map((att, idx) => (
              <div
                key={idx}
                className="relative shrink-0 rounded-2xl overflow-hidden"
                style={{ width: 72, height: 72 }}
              >
                <img src={att.previewUrl} alt={att.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeAttachment(idx)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"
                  style={{ fontSize: 11 }}
                >✕</button>
              </div>
            ))}
          </div>
        )}

        {/* 입력 행 — 한 줄이면 중앙, 멀티라인이면 하단 정렬 */}
        <div className={`flex gap-2 ${isMultiLine ? 'items-end' : 'items-center'}`}>

          {/* + 버튼 */}
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all"
            style={{ backgroundColor: '#2c2c2e' }}
            title="이미지 첨부"
          >
            <svg style={{ width: 20, height: 20 }} fill="none" stroke="white" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>

          {/* 텍스트 입력창 */}
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={isListening && interimTranscript ? text + interimTranscript : text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={getPlaceholder(language)}
              rows={1}
              className="w-full pl-4 py-2.5 rounded-2xl text-[15px] outline-none resize-none leading-relaxed scrollbar-hide"
              style={{
                minHeight: '42px',
                maxHeight: '200px',
                paddingRight: text.length > 0 ? '2.5rem' : '3rem',
                backgroundColor: '#1c1c1e',
                color: '#ffffff',
                caretColor: '#ffffff',
              }}
              autoFocus
            />

            {/* 확대 버튼 — 멀티라인일 때 우상단 */}
            {isMultiLine && (
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                className="absolute top-2 right-2.5 w-6 h-6 rounded-md flex items-center justify-center active:scale-90 transition-all"
                style={{ backgroundColor: '#3a3a3c' }}
                title="입력창 확대"
              >
                {/* ↙↗ expand 아이콘 */}
                <svg style={{ width: 12, height: 12 }} fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 14v6h6M20 10V4h-6M14 10l6-6M10 14l-6 6" />
                </svg>
              </button>
            )}

            {/* 마이크 버튼 — 텍스트 없을 때만 표시 */}
            {speechSupported && text.length === 0 && (
              <button
                type="button"
                onClick={toggleListening}
                className={`absolute right-2.5 w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                  isListening ? 'bg-red-500' : ''
                } ${isMultiLine ? 'bottom-2' : 'top-1/2 -translate-y-1/2'}`}
                title={isListening ? '음성 인식 중지' : '음성으로 입력'}
              >
                {/* 마이크 아이콘 */}
                <svg style={{ width: 24, height: 24 }} fill="none" stroke={isListening ? 'white' : '#8e8e93'} strokeWidth={1.6} viewBox="0 0 24 24">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path strokeLinecap="round" d="M5 10a7 7 0 0014 0" />
                  <line x1="12" y1="19" x2="12" y2="22" strokeLinecap="round" />
                  <line x1="9" y1="22" x2="15" y2="22" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          {/* 전송 버튼 — 흰색 원형 + ↑ 화살표 */}
          <button
            type="submit"
            disabled={!hasContent}
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 active:scale-90 transition-all"
            style={{
              backgroundColor: hasContent ? '#ffffff' : '#2c2c2e',
              transition: 'background-color 0.2s',
            }}
          >
            <svg style={{ width: 18, height: 18 }} fill="none" stroke={hasContent ? '#111' : '#636366'} strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
            </svg>
          </button>
        </div>
      </form>

      {/* 전체화면 확대 입력 모달 — Portal로 body에 직접 렌더링 */}
      {isExpanded && createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col" style={{ backgroundColor: '#111111' }}>
          {/* 상단 바 */}
          <div className="flex items-center justify-end px-4 py-3">
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white active:scale-95 transition-all"
              style={{ backgroundColor: '#3a3a3c' }}
            >
              {/* 축소 아이콘 */}
              <svg style={{ width: 12, height: 12 }} fill="none" stroke="white" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 14v6h6M20 10V4h-6M10 14l-6 6M14 10l6-6" />
              </svg>
              축소
            </button>
          </div>

          {/* 확대 textarea */}
          <textarea
            ref={expandedRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={getPlaceholder(language)}
            className="flex-1 px-5 py-2 text-[16px] leading-relaxed outline-none resize-none"
            style={{ backgroundColor: '#111111', color: '#ffffff', caretColor: '#ffffff' }}
            autoFocus
          />

          {/* 하단 전송 */}
          <div
            className="flex items-center justify-end px-4 py-3"
            style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
          >
            <button
              type="button"
              disabled={!hasContent}
              onClick={(e) => { setIsExpanded(false); handleSubmit(e as any); }}
              className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-all disabled:opacity-40"
              style={{ backgroundColor: '#ffffff' }}
            >
              <svg style={{ width: 20, height: 20 }} fill="none" stroke="#111" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m-7 7l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
