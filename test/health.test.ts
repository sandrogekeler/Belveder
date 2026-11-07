import { exports } from "cloudflare:workers";
import { describe, expect, it } from "vitest";

describe("GET /health", () => {
  it("reports the worker and the hub as up", async () => {
    const res = await exports.default.fetch("https://belveder.test/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      ok: true,
      hub: { ok: true, tables: 1 },
    });
  });

  it("returns 404 for anything else", async () => {
    const res = await exports.default.fetch("https://belveder.test/nope");
    expect(res.status).toBe(404);
  });
});
