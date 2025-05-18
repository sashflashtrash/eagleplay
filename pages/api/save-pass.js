// pages/api/save-pass.js
import { supabase } from '../../lib/supabaseClient';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { id, name, ...rest } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name ist erforderlich' });
    }

    const upsertData = id ? { id, name, ...rest } : { name, ...rest };

    const { error } = await supabase
      .from('passes')
      .upsert(upsertData, { onConflict: ['id'] });

    if (error) {
      console.error("POST Fehler:", error);
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ success: true });
  } else if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('passes')
      .select('*');

    console.log("🟢 Supabase-Daten:", data);
    console.error("🔴 Supabase-Fehler:", error);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(200).json(data);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} not allowed`);
  }
}
