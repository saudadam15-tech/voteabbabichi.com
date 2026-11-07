const { createClient } = require('@supabase/supabase-js');

function getEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function serviceClient() {
  return createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
}

async function requireAdmin(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return { error: 'Authentication required.', status: 401 };
  const authClient = createClient(getEnv('SUPABASE_URL'), getEnv('SUPABASE_ANON_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data?.user) return { error: 'Your session is invalid or expired. Please sign in again.', status: 401 };
  if (data.user.app_metadata?.role !== 'admin') return { error: 'Administrator access is required.', status: 403 };
  return { user: data.user, db: serviceClient() };
}

function send(res, status, body) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.status(status).json(body);
}

function clean(value, max = 5000) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

module.exports = { getEnv, serviceClient, requireAdmin, send, clean };
