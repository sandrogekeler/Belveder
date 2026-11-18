import { DurableObject } from "cloudflare:workers";

// The single Durable Object that will hold Belveder's state and its
// WebSocket clients. For now it only proves its SQLite storage works.
export class Hub extends DurableObject<Env> {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.storage.sql.exec(
      "CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL)",
    );
  }

  ping(): { ok: true; tables: number } {
    const tables = this.ctx.storage.sql
      .exec<{ n: number }>(
        "SELECT count(*) AS n FROM sqlite_master WHERE type = 'table'",
      )
      .one().n;
    return { ok: true, tables };
  }
}
