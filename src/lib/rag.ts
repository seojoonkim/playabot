import { supabase } from './supabase';
import { createEmbedding } from './embeddings';

export interface RAGSearchResult {
  id: number;
  content: string;
  category: string;
  source: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface RAGSearchOptions {
  category?: string;
  topK?: number;
  threshold?: number;
}

/**
 * PLAYA 지식 기반 similarity search
 */
export async function searchKnowledge(
  query: string,
  options: RAGSearchOptions = {}
): Promise<RAGSearchResult[]> {
  if (!supabase) {
    console.warn('Supabase not configured, returning empty results');
    return [];
  }

  const { category, topK = 5, threshold = 0.7 } = options;

  const queryEmbedding = await createEmbedding(query);

  const { data, error } = await supabase.rpc('match_playa_knowledge', {
    query_embedding: queryEmbedding,
    match_threshold: threshold,
    match_count: topK,
    filter_category: category || null,
  });

  if (error) {
    console.error('RAG search error:', error);
    return [];
  }

  return data as RAGSearchResult[];
}

/**
 * RAG 컨텍스트를 시스템 프롬프트에 주입
 */
export function buildRAGContext(results: RAGSearchResult[]): string {
  if (results.length === 0) return '';

  const contextParts = results.map((r) => {
    const label = r.category || 'general';
    return `[${label}] ${r.content}`;
  });

  return `\n\n---
## 🔍 관련 정보 (참고해서 자연스럽게 답변하세요)

${contextParts.join('\n\n')}

---
위 정보를 직접 인용하지 말고, 자연스럽게 대화에 녹여서 답변하세요.
`;
}

/**
 * 사용자 메시지에서 RAG 컨텍스트 가져오기
 */
export async function getRAGContext(
  userMessage: string,
): Promise<string> {
  try {
    const results = await searchKnowledge(userMessage, {
      topK: 3,
      threshold: 0.75,
    });
    return buildRAGContext(results);
  } catch (error) {
    console.error('Failed to get RAG context:', error);
    return '';
  }
}
