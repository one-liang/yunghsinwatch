import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";

import { contentTypeFor, loadConfig } from "./builder-core.mjs";

const config = await loadConfig(process.cwd());
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${host}:${port}`}`);
  const requestPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.resolve(config.outDir, requestPath.replace(/^\/+/, ""));
  const relative = path.relative(config.outDir, filePath);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error("Not a file");

    res.writeHead(200, { "Content-Type": contentTypeFor(filePath) });
    createReadStream(filePath).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(port, host, () => {
  console.log(`preview server running at http://${host}:${port}/`);
});
