module.exports = (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed.' });
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url || !anonKey) return res.status(503).json({ error: 'Portal configuration is incomplete.' });
  return res.status(200).json({ supabaseUrl: url, supabaseAnonKey: anonKey });
};
