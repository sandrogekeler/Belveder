# Belveder: dependency policy and inventory

A decision record, not a lockfile mirror. Every direct dependency gets one line
saying why it is here. Removed or rejected candidates go under "Removed" with
the reason, so the same discussion does not happen twice.

## Policy

- Prefer the standard library, then what is already in the tree.
- A new dependency needs a reason a reviewer can check: what it does that the
  tree cannot reasonably do itself, and what it gets access to.
- Dependabot opens update PRs weekly (`.github/dependabot.yml`).

## Current inventory

### npm (`./package.json`, direct dependencies)

| Package | Why |
|---|---|
| `wrangler` (dev) | Cloudflare's CLI: local dev, type generation, deploy |
| `@cloudflare/vitest-plugin` (dev) | Runs Vitest inside workerd with real bindings |
| `vitest` (dev) | Test runner; the plugin above needs it |
| `typescript` (dev) | Typecheck. Held at 6.0 until typescript-eslint supports 7 |
| `eslint`, `@eslint/js`, `typescript-eslint` (dev) | Lint, used by `pnpm lint` and lefthook |
| `prettier` (dev) | Formatting, used by lefthook |

## Removed

| Dependency | Removed in | Why |
|---|---|---|
| `@cloudflare/vitest-pool-workers` | Never added | Deprecated, renamed to `@cloudflare/vitest-plugin` |
