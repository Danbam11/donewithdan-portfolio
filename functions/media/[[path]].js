function getRangeDetails(size, range) {
  let start = 0;
  let end = size - 1;

  if ('suffix' in range && range.suffix != null) {
    start = Math.max(size - range.suffix, 0);
  } else {
    if ('offset' in range && range.offset != null) {
      start = range.offset;
    }

    if ('length' in range && range.length != null) {
      end = Math.min(start + range.length - 1, size - 1);
    }
  }

  return {
    start,
    end,
    length: end - start + 1,
  };
}

export async function onRequest({ request, env, params }) {
  const path = Array.isArray(params.path) ? params.path : [params.path];
  const key = path.filter(Boolean).join('/');

  if (!key) {
    return new Response('Not Found', { status: 404 });
  }

  if (request.method === 'HEAD') {
    const object = await env.MEDIA.head(key);

    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('accept-ranges', 'bytes');
    headers.set('content-length', String(object.size));
    headers.set('cache-control', 'public, max-age=3600');

    return new Response(null, {
      status: 200,
      headers,
    });
  }

  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: {
        Allow: 'GET, HEAD',
      },
    });
  }

  const object = await env.MEDIA.get(key, {
    range: request.headers,
  });

  if (!object) {
    return new Response('Not Found', { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('etag', object.httpEtag);
  headers.set('accept-ranges', 'bytes');
  headers.set('cache-control', 'public, max-age=3600');

  if (object.range && request.headers.has('range')) {
    const { start, end, length } = getRangeDetails(object.size, object.range);

    headers.set('content-range', `bytes ${start}-${end}/${object.size}`);
    headers.set('content-length', String(length));

    return new Response(object.body, {
      status: 206,
      headers,
    });
  }

  headers.set('content-length', String(object.size));

  return new Response(object.body, {
    status: 200,
    headers,
  });
}