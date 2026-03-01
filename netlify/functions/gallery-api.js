const crypto = require('crypto');

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY    = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const ADMIN_PASS = process.env.ADMIN_PASSWORD;

const HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

function basicAuth() {
  return 'Basic ' + Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
}

function sign(params) {
  const str = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('&') + API_SECRET;
  return crypto.createHash('sha1').update(str).digest('hex');
}

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: HEADERS, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers: HEADERS, body: JSON.stringify({ error: 'Method not allowed' }) };

  let body;
  try { body = JSON.parse(event.body || '{}'); } catch { return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON' }) }; }

  const action = event.queryStringParameters?.action;

  // ── Auth ──────────────────────────────────────────────────────────────────
  if (action === 'auth') {
    const ok = body.password === ADMIN_PASS;
    return { statusCode: ok ? 200 : 401, headers: HEADERS, body: JSON.stringify(ok ? { success: true } : { error: 'Wrong password' }) };
  }

  // All other actions require valid password
  if (body.password !== ADMIN_PASS) {
    return { statusCode: 401, headers: HEADERS, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    // ── Save Config ───────────────────────────────────────────────────────
    if (action === 'save-config') {
      const configJson = JSON.stringify(body.config);
      const timestamp  = Math.round(Date.now() / 1000).toString();
      const params     = { invalidate: 'true', overwrite: 'true', public_id: 'gallery-config', timestamp };
      const signature  = sign(params);

      const fd = new FormData();
      fd.append('file',       new Blob([configJson], { type: 'application/json' }), 'gallery-config.json');
      fd.append('public_id',  'gallery-config');
      fd.append('overwrite',  'true');
      fd.append('invalidate', 'true');
      fd.append('timestamp',  timestamp);
      fd.append('api_key',    API_KEY);
      fd.append('signature',  signature);

      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/raw/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    // ── Delete Photo(s) ────────────────────────────────────────────────────
    if (action === 'delete-photo') {
      const ids = body.publicIds || (body.publicId ? [body.publicId] : []);
      if (ids.length === 0) return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'No photo IDs provided' }) };
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image/upload`,
        { method: 'DELETE', headers: { Authorization: basicAuth(), 'Content-Type': 'application/json' }, body: JSON.stringify({ public_ids: ids }) }
      );
      const data = await res.json();
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    // ── List Photos (for admin initial load) ─────────────────────────────
    if (action === 'list-photos') {
      const folder = body.folder || '';
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?prefix=${encodeURIComponent(folder)}&type=upload&max_results=500`,
        { headers: { Authorization: basicAuth() } }
      );
      const data = await res.json();
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify(data) };
    }

    // ── Create Gallery (returns a unique ID) ─────────────────────────────
    if (action === 'create-gallery') {
      const prefix = body.type === 'public' ? 'pg-' : 'g-';
      const id = prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
      return { statusCode: 200, headers: HEADERS, body: JSON.stringify({ id }) };
    }

    return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Unknown action' }) };

  } catch (err) {
    return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: err.message }) };
  }
};
