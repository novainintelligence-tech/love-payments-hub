// Copies the Nitro/Vercel static output into dist/ so the Lovable deploy
// check (which expects dist/) passes. The SSR function output stays in
// .vercel/output untouched.
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";

const src = ".vercel/output/static";
if (!existsSync(src)) {
  console.error("[dist-copy] .vercel/output/static not found — run vite build first");
  process.exit(1);
}
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
cpSync(src, "dist", { recursive: true });
console.log("[dist-copy] copied .vercel/output/static -> dist/");
