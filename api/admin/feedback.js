const { requireAdmin, send, clean } = require('../_lib/supabase');
const ALLOWED = ["Received", "Under Review", "Assigned", "In Progress", "Resolved"];
module.exports = async (req, res) => {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) return send(res, auth.status, { error: auth.error });
    if (req.method === 'GET') {
      const limit = Math.min(Math.max(parseInt(req.query.limit || '100', 10) || 100, 1), 200);
      const status = clean(req.query.status, 40);
      let query = auth.db.from('feedback').select('*').order('created_at', { ascending: false }).limit(limit);
      if (status && status !== 'All') query = query.eq('status', status);
      const { data, error } = await query;
      if (error) throw error;
      return send(res, 200, { items: data || [] });
    }
    if (req.method === 'PATCH') {
      const id = clean(req.body?.id, 60);
      const status = clean(req.body?.status, 40);
      if (!id || !ALLOWED.includes(status)) return send(res, 400, { error: 'Invalid record or status.' });
      const { data, error } = await auth.db.from('feedback').update({ status }).eq('id', id).select('id,status').single();
      if (error) throw error;
      return send(res, 200, { item: data });
    }
    return send(res, 405, { error: 'Method not allowed.' });
  } catch (e) { console.error(e); return send(res, 500, { error: 'Unable to process this request.' }); }
};
