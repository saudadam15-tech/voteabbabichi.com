const { serviceClient, send, clean } = require('./_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  try {
    const body = req.body || {};
    if (clean(body.website, 200)) return send(res, 200, { ok: true }); // honeypot
    const name = clean(body.name, 120) || null;
    const contact = clean(body.contact, 120) || null;
    const category = clean(body.category, 50);
    const details = clean(body.details, 5000);
    if (!category || !details || details.length < 10) {
      return send(res, 400, { error: 'Please select a category and provide at least 10 characters of feedback.' });
    }
    const reference_no = `FB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { error } = await serviceClient().from('feedback').insert({
      reference_no, name, contact, category, details,
      is_anonymous: !name && !contact,
      status: 'Received'
    });
    if (error) throw error;
    return send(res, 201, { ok: true, reference: reference_no });
  } catch (error) {
    console.error('Feedback submission failed:', error.message);
    return send(res, 500, { error: 'We could not save your feedback. Please try again later.' });
  }
};
