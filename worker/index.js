// Serves the static Astro build; redirects www to the apex domain.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === 'www.brentstees.com') {
      url.hostname = 'brentstees.com';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
