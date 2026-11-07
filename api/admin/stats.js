const { requireAdmin, send } = require('../_lib/supabase');
module.exports = async (req, res) => {
  if (req.method !== 'GET') return send(res, 405, { error: 'Method not allowed.' });
  try {
    const auth = await requireAdmin(req);
    if (auth.error) return send(res, auth.status, { error: auth.error });
    const db = auth.db;
    const [vAll, vNew, fAll, fNew, fReview, fProgress] = await Promise.all([
      db.from('volunteers').select('id', { count: 'exact', head: true }),
      db.from('volunteers').select('id', { count: 'exact', head: true }).eq('status', 'New'),
      db.from('feedback').select('id', { count: 'exact', head: true }),
      db.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'Received'),
      db.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'Under Review'),
      db.from('feedback').select('id', { count: 'exact', head: true }).eq('status', 'In Progress')
    ]);
    const failure = [vAll,vNew,fAll,fNew,fReview,fProgress].find(x => x.error);
    if (failure) throw failure.error;
    return send(res, 200, { volunteers: vAll.count || 0, newVolunteers: vNew.count || 0, feedback: fAll.count || 0, newFeedback: fNew.count || 0, underReview: fReview.count || 0, inProgress: fProgress.count || 0 });
  } catch (e) { console.error(e); return send(res, 500, { error: 'Unable to load dashboard statistics.' }); }
};
