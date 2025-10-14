import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { promises as fsp } from "fs";

// Dev-only middleware to update ../dummy/data.json from the browser
function devDummyWriter(): Plugin {
  return {
    name: "dev-dummy-writer",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__update-dummy-data", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end("Method Not Allowed");
          return;
        }
        try {
          const chunks: Uint8Array[] = [];
          await new Promise<void>((resolve) => {
            req.on("data", (c: Uint8Array) => chunks.push(c));
            req.on("end", () => resolve());
          });
          const raw = Buffer.concat(chunks).toString("utf8");
          const data = JSON.parse(raw);
          if (!Array.isArray(data))
            throw new Error("Payload must be an array of sessions");
          const dest = path.resolve(__dirname, "../dummy/data.json");
          await fsp.writeFile(dest, JSON.stringify(data, null, 2), "utf8");
          res.statusCode = 200;
          res.end("ok");
        } catch (e) {
          res.statusCode = 400;
          res.end((e as Error).message);
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), devDummyWriter()],
  base: "./",
  publicDir: "public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
