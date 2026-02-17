export const config = {
  supportsResponseStreaming: true,
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    return res.status(500).json({ error: 'OPENROUTER_API_KEY not configured' });
  }

  const { system, messages, max_tokens } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  // SSE 헤더
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    // OpenAI 호환 메시지 포맷
    const openaiMessages = [];
    if (system) {
      openaiMessages.push({ role: 'system', content: system });
    }
    openaiMessages.push(...messages);

    const modelUsed = 'openai/gpt-4o';

    const body = {
      model: modelUsed,
      max_tokens: max_tokens || 1024,
      messages: openaiMessages,
      stream: true,
    };

    const apiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openrouterKey}`,
        'HTTP-Referer': 'https://playabot.vercel.app',
        'X-Title': 'PLAYA Concierge',
      },
      body: JSON.stringify(body),
    });

    if (!apiRes.ok) {
      const errText = await apiRes.text();
      res.write(`data: ${JSON.stringify({ type: 'error', error: `API ${apiRes.status}: ${errText}` })}\n\n`);
      res.end();
      return;
    }

    const reader = apiRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);
          const delta = event.choices?.[0]?.delta;

          if (delta?.content) {
            res.write(`data: ${JSON.stringify({ type: 'text', text: delta.content })}\n\n`);
          }

          if (event.error) {
            res.write(`data: ${JSON.stringify({ type: 'error', error: event.error?.message || '알 수 없는 오류' })}\n\n`);
          }
        } catch {
          // 파싱 실패 라인 스킵
        }
      }
    }

    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: message })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: message });
    }
  }
}
