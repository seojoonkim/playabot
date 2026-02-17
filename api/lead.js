import { createClient } from '@supabase/supabase-js';

export const config = {
  maxDuration: 10,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  const { name, phone, email, interest, message_summary } = req.body;

  if (!name && !phone) {
    return res.status(400).json({ error: '이름 또는 연락처가 필요합니다' });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from('playa_leads')
      .insert({
        name: name || null,
        phone: phone || null,
        email: email || null,
        interest: interest || null,
        message_summary: message_summary || null,
      })
      .select()
      .single();

    if (error) {
      console.error('[lead] Supabase error:', error);
      return res.status(500).json({ error: '저장 중 오류가 발생했습니다' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (e) {
    console.error('[lead] Exception:', e);
    return res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
}
