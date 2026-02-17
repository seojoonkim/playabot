/**
 * PLAYA 상담 데이터 임베딩 스크립트
 * 사용법: npx tsx scripts/embed-playa.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 환경변수 로드
const dotenvPath = resolve(__dirname, '../.env.local');
const envContent = readFileSync(dotenvPath, 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env.SUPABASE_URL || process.env.SUPABASE_URL!;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY!;
const OPENAI_KEY = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface KnowledgeChunk {
  content: string;
  category: string;
  source: string;
  metadata?: Record<string, unknown>;
}

// --- 1. 분석 파일에서 청크 추출 ---

function parseAnalysisFile(filePath: string): KnowledgeChunk[] {
  const content = readFileSync(filePath, 'utf-8');
  const chunks: KnowledgeChunk[] = [];

  // FAQ 섹션 추출
  const faqRegex = /\*\*Q\d+\.\s*(.+?)\*\*\s*\n>\s*A:\s*(.+?)(?=\n\n|\*\*Q|\n---)/gs;
  let match;
  while ((match = faqRegex.exec(content)) !== null) {
    chunks.push({
      content: `질문: ${match[1].trim()}\n답변: ${match[2].trim()}`,
      category: 'faq',
      source: 'playa-analysis',
      metadata: { type: 'faq' },
    });
  }

  // 응답 템플릿 추출
  const templateSections = [
    { name: '첫 인사 (신규 문의)', category: 'template' },
    { name: '브로셔 전달', category: 'template' },
    { name: '계약 정보 수집', category: 'template' },
    { name: '가입비/연회비 안내', category: 'template' },
    { name: '테니스 레슨 확인', category: 'template' },
    { name: '라운지 예약 확정', category: 'template' },
  ];

  for (const tmpl of templateSections) {
    const regex = new RegExp(`\\d+\\.\\s*\\*\\*${tmpl.name.replace(/[()]/g, '\\$&')}\\*\\*\\s*\\n\`\`\`\\n([\\s\\S]*?)\`\`\``, 'g');
    const m = regex.exec(content);
    if (m) {
      chunks.push({
        content: `[응답 템플릿: ${tmpl.name}]\n${m[1].trim()}`,
        category: 'template',
        source: 'playa-analysis',
        metadata: { type: 'response_template', name: tmpl.name },
      });
    }
  }

  // 리드 수집 플로우
  const leadSection = content.match(/## 4\. 리드 수집 플로우[\s\S]*?(?=\n## 5\.)/);
  if (leadSection) {
    chunks.push({
      content: leadSection[0].trim(),
      category: 'process',
      source: 'playa-analysis',
      metadata: { type: 'lead_flow' },
    });
  }

  // 대화 흐름 단계
  const flowSection = content.match(/## 5\. 대화 흐름 단계[\s\S]*?(?=\n## 6\.)/);
  if (flowSection) {
    chunks.push({
      content: flowSection[0].trim(),
      category: 'process',
      source: 'playa-analysis',
      metadata: { type: 'conversation_flow' },
    });
  }

  // 직원 응답 패턴
  const toneSection = content.match(/## 3\. 직원 응답 패턴[\s\S]*?(?=\n## 4\.)/);
  if (toneSection) {
    chunks.push({
      content: toneSection[0].trim(),
      category: 'tone',
      source: 'playa-analysis',
      metadata: { type: 'tone_guide' },
    });
  }

  return chunks;
}

// --- 2. 실제 상담 세션에서 의미 있는 대화 추출 ---

function parseChatSessions(filePath: string): KnowledgeChunk[] {
  const raw = readFileSync(filePath, 'utf-8');
  const sessions = JSON.parse(raw);
  const chunks: KnowledgeChunk[] = [];

  // 의미 있는 Q&A 패턴 추출 (고객 질문 + 직원 답변 쌍)
  for (const session of sessions) {
    if (!session.messages || session.messages.length < 2) continue;

    const messages = session.messages;
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      const next = messages[i + 1];

      // 고객 질문 → 직원 답변 패턴
      if (msg.role === 'user' && next.role === 'manager') {
        const question = (msg.text || msg.content || '').trim();
        const answer = (next.text || next.content || '').trim();

        if (!question || !answer || question.length < 10 || answer.length < 20) continue;

        // 가격/시설/멤버십 관련 대화만 필터
        const keywords = ['가격', '비용', '얼마', '가입', '멤버십', '회원', '테니스', '레슨', '시설', '운영', '오픈',
          '주차', '예약', '본연', '라운지', '프렌즈', '패스', '게스트', '초대', '슬롯', '피트니스',
          '환불', '양도', '법인', '연회비', '가입비', '보증금', '결제', '계약'];

        const isRelevant = keywords.some(kw => question.includes(kw) || answer.includes(kw));
        if (!isRelevant) continue;

        chunks.push({
          content: `고객: ${question}\n상담사: ${answer}`,
          category: 'conversation',
          source: 'playa-chats',
          metadata: { sessionId: session.id || session.sessionId },
        });
      }
    }

    // 최대 100개 대화 청크
    if (chunks.length >= 100) break;
  }

  return chunks;
}

// --- 3. 핵심 정보 수동 청크 ---

function getManualChunks(): KnowledgeChunk[] {
  return [
    {
      content: `PLAYA는 서울 강남에 위치한 invite-only 프리미엄 멤버십 클럽입니다. 슬로건은 "Wellness Meets Connection"이며, 기존 회원의 추천으로만 가입할 수 있습니다. 현재 400명 한정 모집 중이며, 가격은 모집 인원에 따라 계속 상승합니다.`,
      category: 'general',
      source: 'manual',
    },
    {
      content: `평생회원 가입비: 개인 2,000만원 + 연회비 570만원. 보증금 멤버십: 보증금 6,000만원 + 연회비 570만원 (5년 만기 후 보증금 전액 반환). 법인 2인: 보증금 1억1,000만원 + 연회비 1,140만원. 배우자 연회비 400만원, 만 13세 이상 자녀 연회비 200만원.`,
      category: 'pricing',
      source: 'manual',
    },
    {
      content: `플라야 시설 (논현로 742, 파티오나인 3층): 테니스 코트, 스크린 골프, 배드민턴 코트, 피트니스(테크노짐 머신 25대, 약 40평, 24시간 운영). 직원 상주 07:00~16:00. 샤워실 프라이빗 부스 3개. 개인 사물함. 수건/양말/운동복 상의 제공. WiFi: entrepreneur`,
      category: 'facility',
      source: 'manual',
    },
    {
      content: `플라야 라운지 (도산대로 212, 1-3층): 240평 규모. 커피/티 제공. 운영시간 오전 10시~오후 10시, 일/월 휴무. 발렛 주차 무료. 라운지 룸 대관 가능(서비스 차지 있음).`,
      category: 'facility',
      source: 'manual',
    },
    {
      content: `본연 레스토랑 (논현로 742, 파티오나인 7층): 회원 우선 예약, 룸 미니멈 차지(100만원) 면제, 예약금 면제. 와인 두 번째 병 최대 40% 할인, 콜키지 한 병 무료. 취소 규정: 5일 전 무료, 이후 단계별 수수료.`,
      category: 'facility',
      source: 'manual',
    },
    {
      content: `테니스 코트 예약: 카카오톡 하단 "시설 예약" 버튼, 20분 단위, 하루 최대 2시간. 슬롯(Slot): 별도 예약 없이 고정 이용, 주 2회 각 20분(총 40분), 가입 순서 선착순. 레슨비: 주중 40분 7만원, 주말 8만원. PT 1:1 시간당 99,000원.`,
      category: 'sports',
      source: 'manual',
    },
    {
      content: `프렌즈 패스(게스트 초대): 정회원 연 5장 무료 제공. 게스트 이름/전화번호/방문일 알려주면 QR코드 발급. 추가 구매 인당 55,000원. 회원 동행 필수. 지하주차장 3시간 무료(리셉션 아이패드에서 차량번호 등록).`,
      category: 'benefit',
      source: 'manual',
    },
    {
      content: `법인 가입: 법인무기명 회원권이나 지정 사용자만 지문/QR 등록 후 이용 가능. 동시 사용 시 인원수만큼 회원권 추가 구매 필요. 복리후생비로 비용 처리 가능. 부가세 환급 가능.`,
      category: 'membership',
      source: 'manual',
    },
    {
      content: `가입비 환불: 가입비는 호텔 회원권처럼 자산 취득 개념. 다른 회원 추천받은 분께 양도 가능. 셧다운 시 가입 기간 비례 환불 공제. 결제: 카드/계좌이체 모두 가능. 현금 이체 시 본연 상품권 등 추가 혜택. 입금 계좌: 기업은행 55105141004011 (주)컨센서스`,
      category: 'pricing',
      source: 'manual',
    },
    {
      content: `패밀리 패스: 배우자 연 400만원, 만 13세 이상 자녀 200만원, 만 13세 미만 별도 연회비 없음. 초등학생까지 동반 입장 가능.`,
      category: 'membership',
      source: 'manual',
    },
  ];
}

// --- 4. 임베딩 생성 ---

async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const batchSize = 20;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    console.log(`  임베딩 생성 중... ${i + 1}~${Math.min(i + batchSize, texts.length)} / ${texts.length}`);

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: batch,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${err}`);
    }

    const data = await response.json();
    allEmbeddings.push(...data.data.map((d: any) => d.embedding));

    // Rate limit 방지
    if (i + batchSize < texts.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  return allEmbeddings;
}

// --- Main ---

async function main() {
  console.log('🚀 PLAYA 지식 임베딩 시작\n');

  // 분석 파일 파싱
  const analysisPath = resolve(__dirname, '../../clawd/compound/playa-analysis.md');
  console.log('📄 playa-analysis.md 파싱...');
  const analysisChunks = parseAnalysisFile(analysisPath);
  console.log(`  → ${analysisChunks.length}개 청크 추출`);

  // 상담 세션 파싱
  const chatsPath = resolve(__dirname, '../../clawd/compound/playa-chats.json');
  console.log('💬 playa-chats.json 파싱...');
  let chatChunks: KnowledgeChunk[] = [];
  try {
    chatChunks = parseChatSessions(chatsPath);
    console.log(`  → ${chatChunks.length}개 대화 청크 추출`);
  } catch (e) {
    console.log(`  → 파싱 실패 (구조 불일치), 수동 청크만 사용`);
  }

  // 수동 핵심 청크
  console.log('📝 수동 핵심 정보 청크...');
  const manualChunks = getManualChunks();
  console.log(`  → ${manualChunks.length}개 청크`);

  const allChunks = [...manualChunks, ...analysisChunks, ...chatChunks];
  console.log(`\n총 ${allChunks.length}개 청크 임베딩 예정\n`);

  // 기존 데이터 삭제
  console.log('🗑️  기존 playa_knowledge 데이터 삭제...');
  const { error: deleteError } = await supabase.from('playa_knowledge').delete().neq('id', 0);
  if (deleteError) {
    console.log(`  ⚠️  삭제 실패 (테이블 미존재?): ${deleteError.message}`);
    console.log('  → SQL 마이그레이션을 먼저 실행해주세요: supabase/migrations/playa_rag.sql');
    return;
  }

  // 임베딩 생성
  console.log('🧠 임베딩 생성 중...');
  const texts = allChunks.map(c => c.content);
  const embeddings = await createEmbeddings(texts);

  // Supabase에 삽입
  console.log('\n💾 Supabase에 저장 중...');
  const records = allChunks.map((chunk, i) => ({
    content: chunk.content,
    embedding: embeddings[i],
    category: chunk.category,
    source: chunk.source,
    metadata: chunk.metadata || {},
  }));

  // 배치 삽입 (50개씩)
  for (let i = 0; i < records.length; i += 50) {
    const batch = records.slice(i, i + 50);
    const { error } = await supabase.from('playa_knowledge').insert(batch);
    if (error) {
      console.error(`  ❌ 삽입 실패 (${i}~${i + batch.length}):`, error.message);
    } else {
      console.log(`  ✅ ${i + 1}~${i + batch.length} 저장 완료`);
    }
  }

  console.log(`\n🎉 완료! 총 ${allChunks.length}개 청크 임베딩 및 저장`);
}

main().catch(console.error);
