import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["node_modules", "worker-configuration.d.ts", ".wrangler", "design"] },
  js.configs.recommended,
  tseslint.configs.recommended,
);
