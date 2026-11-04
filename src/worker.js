
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    const isStatic =
      path.startsWith("/assets/") ||
      /\.[^/]+$/.test(path);

    const response = await env.ASSETS.fetch(request);

    if (response.status !== 404 || isStatic) {
      return response;
    }

    if (!["GET", "HEAD"].includes(request.method)) {
      return response;
    }

    const indexRequest = new Request(
      new URL("/index.html", url.origin),
      {
        method: request.method,
        headers: request.headers,
      }
    );

    return env.ASSETS.fetch(indexRequest);
  },
};
