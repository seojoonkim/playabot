import { PLAYA_SYSTEM_PROMPT } from '@/constants/prompt-template';
import type { IdolMeta, KnowledgeCategory } from '@/types/idol';
import type { RelationType } from '@/stores/user-store';

export interface UserInfo {
  name: string;
  birthday: string;
  relationType: RelationType;
}

// 날짜 포맷
function getCurrentDate(): string {
  const now = new Date();
  const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${days[now.getDay()]}`;
}

export function assembleSystemPrompt(
  _meta: IdolMeta,
  _knowledge: Record<KnowledgeCategory, string>,
  _groupInfo?: string,
  _userInfo?: UserInfo,
): string {
  // PLAYA 컨시어지 전용 프롬프트
  const prompt = PLAYA_SYSTEM_PROMPT.replace('{{currentDate}}', getCurrentDate());
  return prompt.trim();
}
