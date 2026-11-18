export { Hub } from "./hub";

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "GET" && url.pathname === "/health") {
      const hub = await env.HUB.getByName("main").ping();
      return Response.json({ ok: true, hub });
    }
    return new Response("Not found", { status: 404 });
  },
} satisfies ExportedHandler<Env>;
