// Cloudflare static assets don't answer HTTP Range requests, which browsers
// need to seek in a video. This Worker serves video files with range support.
export default {
  async fetch(request, env) {
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
  },
};
