const https = require('https');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request' }) };
  }

  const { name, email, message } = body;
  if (!name || !email || !message) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) };
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br>');

  const emailData = JSON.stringify({
    from: 'David Chen Photography <noreply@davidchenphotography.com>',
    to: ['David@davidchenphotography.com'],
    reply_to: `${name} <${email}>`,
    subject: `New message from ${name}`,
    html: `
      <p><strong>Name:</strong> ${safeName}</p>
      <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
      <p><strong>Message:</strong></p>
      <p>${safeMessage}</p>
    `
  });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY not set');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  return new Promise((resolve) => {
    const options = {
      hostname: 'api.resend.com',
      port: 443,
      path: '/emails',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(emailData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve({ statusCode: 200, body: JSON.stringify({ success: true }) });
        } else {
          console.error('Resend API error:', res.statusCode, data);
          resolve({ statusCode: 500, body: JSON.stringify({ error: 'Failed to send email' }) });
        }
      });
    });

    req.on('error', (e) => {
      console.error('Request error:', e);
      resolve({ statusCode: 500, body: JSON.stringify({ error: 'Network error' }) });
    });

    req.write(emailData);
    req.end();
  });
};
