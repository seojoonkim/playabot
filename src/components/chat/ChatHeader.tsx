import { useState } from 'react';
import type { IdolMeta } from '@/types/idol';
import { useChatStore } from '@/stores/chat-store';
import { useIntimacyStore } from '@/stores/intimacy-store';

interface Props {
  idol: IdolMeta;
}

interface LeadFormData {
  name: string;
  phone: string;
  interest: string;
}

// 상담 신청 모달
function LeadModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState<LeadFormData>({ name: '', phone: '', interest: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('이름과 연락처를 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          interest: form.interest || null,
        }),
      });
      if (!res.ok) throw new Error('서버 오류');
      setSubmitted(true);
    } catch {
      setError('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-up">
        {submitted ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">접수 완료</h3>
            <p className="text-sm text-gray-500 mb-6">감사합니다. 곧 연락드리겠습니다.</p>
            <button
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors"
            >
              닫기
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">상담 신청</h3>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">
              연락처를 남겨주시면 담당자가 상세 안내를 드리겠습니다.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">이름 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="홍길동"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">연락처 *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">관심 멤버십</label>
                <select
                  value={form.interest}
                  onChange={(e) => setForm({ ...form, interest: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all"
                >
                  <option value="">선택 안함</option>
                  <option value="평생회원">평생회원</option>
                  <option value="만기5년">만기 5년 회원</option>
                  <option value="미정">아직 미정</option>
                </select>
              </div>
              {error && (
                <p className="text-xs text-red-500">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl bg-gray-900 text-white font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {submitting ? '전송 중...' : '상담 신청하기'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default function ChatHeader({ idol }: Props) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [showLeadModal, setShowLeadModal] = useState(false);

  const clearMessages = useChatStore((s) => s.clearMessages);
  const isStreaming = useChatStore((s) => s.isStreaming);

  // 친밀도 (내부 상태용, UI에서 숨김)
  useIntimacyStore((s) => s.getOrCreateIntimacy(idol.id));

  const handleReset = () => {
    clearMessages();
    setShowResetModal(false);
  };

  return (
    <>
      <div
        className="sticky top-0 z-10 px-4 pb-3 pt-[calc(env(safe-area-inset-top,44px)+8px)] flex items-center gap-3 text-white shadow-md animate-header-in"
        style={{
          background: `linear-gradient(135deg, ${idol.themeColor}, ${idol.themeColorSecondary})`,
        }}
      >
        {/* 로고/프로필 */}
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold bg-white/20 shrink-0 overflow-hidden ring-2 ring-white/30">
          {idol.profileImageUrl ? (
            <img
              src={idol.profileImageUrl}
              alt={idol.nameKo}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span>P</span>
          )}
        </div>

        {/* 이름 및 상태 */}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">플라야 컨시어지</div>
          <div className="text-xs opacity-80 flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-yellow-300' : 'bg-green-300'} animate-pulse`} />
            <span>{isStreaming ? '답변 중...' : '온라인'}</span>
          </div>
        </div>

        {/* 상담 신청 버튼 */}
        <button
          onClick={() => setShowLeadModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 transition-all duration-200 text-xs font-medium"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          상담 신청
        </button>

        {/* 초기화 버튼 */}
        <button
          onClick={() => setShowResetModal(true)}
          className="flex items-center gap-1 px-2 py-1.5 rounded-full hover:bg-white/20 active:bg-red-500/50 active:scale-90 transition-all duration-200 text-xs font-medium"
          title="대화 초기화"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          초기화
        </button>
      </div>

      {/* 상담 신청 모달 */}
      {showLeadModal && (
        <LeadModal onClose={() => setShowLeadModal(false)} />
      )}

      {/* 초기화 확인 모달 */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-xl animate-scale-up">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">대화를 초기화할까요?</h3>
              <p className="text-sm text-gray-500 mb-6">모든 대화 내용이 삭제됩니다.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition-colors"
                >
                  초기화
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
