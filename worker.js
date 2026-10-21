// Vayal Nad Stay Worker.
//  - /api/*            guest feedback + moderated reviews (D1)
//  - /assets/img/*.mp4 HTTP Range support so videos can be seeked
// Everything else is served straight from the static assets.

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' };
const MAX_PER_HOUR = 3;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

async function sha256Hex(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function safeEqual(a, b) {
  const x = new TextEncoder().encode(a);
  const y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

function isAdmin(request, env) {
  const header = request.headers.get('Authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  return Boolean(env.ADMIN_TOKEN) && Boolean(token) && safeEqual(token, env.ADMIN_TOKEN);
}

async function submitFeedback(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid request.' }, 400);
  }

  // Honeypot: real visitors never fill this hidden field.
  if (body.website) return json({ ok: true });

  const name = String(body.name || '').trim();
  const comment = String(body.comment || '').trim();
  const rating = Number(body.rating);

  if (name.length < 1 || name.length > 60) return json({ error: 'Please enter your name (up to 60 characters).' }, 400);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json({ error: 'Please choose a star rating.' }, 400);
  if (comment.length < 10 || comment.length > 1000) return json({ error: 'Please write between 10 and 1000 characters.' }, 400);
  if (/https?:\/\/|www\./i.test(comment)) return json({ error: 'Please leave links out of your feedback.' }, 400);

  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const ipHash = await sha256Hex(`${ip}|${env.ADMIN_TOKEN || 'salt'}`);

  const recent = await env.DB
    .prepare("SELECT COUNT(*) AS n FROM feedback WHERE ip_hash = ? AND created_at > datetime('now', '-1 hour')")
    .bind(ipHash)
    .first();
  if (recent && recent.n >= MAX_PER_HOUR) {
    return json({ error: 'You have sent several messages recently. Please try again later.' }, 429);
  }

  await env.DB
    .prepare('INSERT INTO feedback (name, rating, comment, ip_hash) VALUES (?, ?, ?, ?)')
    .bind(name, rating, comment, ipHash)
    .run();
  return json({ ok: true });
}

async function approvedReviews(env) {
  const { results } = await env.DB
    .prepare("SELECT name, rating, comment, created_at FROM feedback WHERE status = 'approved' ORDER BY created_at DESC LIMIT 30")
    .all();
  const stats = await env.DB
    .prepare("SELECT COUNT(*) AS n, AVG(rating) AS avg FROM feedback WHERE status = 'approved'")
    .first();
  return json({ reviews: results, count: stats.n, average: stats.avg ? Math.round(stats.avg * 10) / 10 : null });
}

async function handleApi(request, env, url) {
  const path = url.pathname;

  if (path === '/api/reviews' && request.method === 'GET') return approvedReviews(env);
  if (path === '/api/feedback' && request.method === 'POST') return submitFeedback(request, env);

  if (path.startsWith('/api/admin/')) {
    if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401);

    if (path === '/api/admin/feedback' && request.method === 'GET') {
      const status = url.searchParams.get('status') || 'pending';
      if (!['pending', 'approved', 'rejected'].includes(status)) return json({ error: 'Bad status' }, 400);
      const { results } = await env.DB
        .prepare('SELECT id, name, rating, comment, status, created_at FROM feedback WHERE status = ? ORDER BY created_at DESC LIMIT 200')
        .bind(status)
        .all();
      return json({ items: results });
    }

    const match = path.match(/^\/api\/admin\/feedback\/(\d+)$/);
    if (match && request.method === 'POST') {
      let body;
      try {
        body = await request.json();
      } catch {
        return json({ error: 'Invalid request.' }, 400);
      }
      const id = Number(match[1]);
      if (body.action === 'delete') {
        await env.DB.prepare('DELETE FROM feedback WHERE id = ?').bind(id).run();
        return json({ ok: true });
      }
      const status = { approve: 'approved', reject: 'rejected', pending: 'pending' }[body.action];
      if (!status) return json({ error: 'Bad action' }, 400);
      await env.DB.prepare('UPDATE feedback SET status = ? WHERE id = ?').bind(status, id).run();
      return json({ ok: true });
    }
  }

  return json({ error: 'Not found' }, 404);
}

async function serveWithRanges(request, env) {
  const res = await env.ASSETS.fetch(new Request(request.url, { method: 'GET' }));
  if (res.status !== 200) return res;

  const headers = new Headers(res.headers);
  headers.set('Accept-Ranges', 'bytes');

  const range = request.headers.get('Range');
  const match = range && /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match || (!match[1] && !match[2])) {
    return new Response(request.method === 'HEAD' ? null : res.body, { status: 200, headers });
  }

  const data = await res.arrayBuffer();
  const size = data.byteLength;
  let start;
  let end;
  if (match[1]) {
    start = parseInt(match[1], 10);
    end = match[2] ? Math.min(parseInt(match[2], 10), size - 1) : size - 1;
  } else {
    start = Math.max(size - parseInt(match[2], 10), 0);
    end = size - 1;
  }
  if (start > end || start >= size) {
    headers.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
  headers.set('Content-Length', String(end - start + 1));
  return new Response(request.method === 'HEAD' ? null : data.slice(start, end + 1), {
    status: 206,
    headers,
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url);
      } catch (err) {
        console.error('API error:', err && err.message ? err.message : err);
        return json({ error: 'Something went wrong. Please try again.' }, 500);
      }
    }
    return serveWithRanges(request, env);
  },
};
