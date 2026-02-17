-- PLAYA Knowledge RAG 테이블 및 RPC
-- 실행: Supabase SQL Editor에서 실행

-- 1. 테이블 생성 (기존 idol_knowledge와 별도)
CREATE TABLE IF NOT EXISTS playa_knowledge (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  category TEXT NOT NULL DEFAULT 'general',
  source TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스
CREATE INDEX IF NOT EXISTS idx_playa_knowledge_category ON playa_knowledge(category);
CREATE INDEX IF NOT EXISTS idx_playa_knowledge_embedding ON playa_knowledge 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- 3. RPC: match_playa_knowledge
CREATE OR REPLACE FUNCTION match_playa_knowledge(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id BIGINT,
  content TEXT,
  category TEXT,
  source TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pk.id,
    pk.content,
    pk.category,
    pk.source,
    pk.metadata,
    1 - (pk.embedding <=> query_embedding) AS similarity
  FROM playa_knowledge pk
  WHERE 1 - (pk.embedding <=> query_embedding) > match_threshold
    AND (filter_category IS NULL OR pk.category = filter_category)
  ORDER BY pk.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. RLS 정책
ALTER TABLE playa_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read" ON playa_knowledge
  FOR SELECT USING (true);

CREATE POLICY "Allow service role insert" ON playa_knowledge
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow service role update" ON playa_knowledge
  FOR UPDATE USING (true);

CREATE POLICY "Allow service role delete" ON playa_knowledge
  FOR DELETE USING (true);
