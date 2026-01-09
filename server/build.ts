import { build } from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runBuild() {
  try {
    await build({
      entryPoints: [path.resolve(__dirname, "index.ts")],
      bundle: true,
      platform: "node",
      target: "node20",
      outfile: path.resolve(__dirname, "../dist/server/index.js"),
      format: "esm",
      external: ["express", "express-session", "connect-pg-simple", "pg", "drizzle-orm", "drizzle-zod", "bcryptjs", "googleapis"],
    });
    console.log("Server build complete");
  } catch (error) {
    console.error("Server build failed:", error);
    process.exit(1);
  }
}

runBuild();
