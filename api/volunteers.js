const { serviceClient, send, clean } = require('./_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return send(res, 405, { error: 'Method not allowed.' });
  try {
    const body = req.body || {};
    if (clean(body.website, 200)) return send(res, 200, { ok: true }); // honeypot
    const full_name = clean(body.full_name, 120);
    const phone = clean(body.phone, 30);
    const ward = clean(body.ward, 50);
    const volunteer_area = clean(body.volunteer_area, 50);
    if (!full_name || !phone || !ward || !volunteer_area || body.consent !== true) {
      return send(res, 400, { error: 'Please complete the required fields and consent checkbox.' });
    }
    if (phone.replace(/\D/g, '').length < 7) return send(res, 400, { error: 'Please enter a valid phone number.' });
    const reference_no = `VOL-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const { error } = await serviceClient().from('volunteers').insert({
      reference_no, full_name, phone, ward, volunteer_area, consent: true, status: 'New'
    });
    if (error) throw error;
    return send(res, 201, { ok: true, reference: reference_no });
  } catch (error) {
    console.error('Volunteer submission failed:', error.message);
    return send(res, 500, { error: 'We could not save your registration. Please try again later.' });
  }
};
