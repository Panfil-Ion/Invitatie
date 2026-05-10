"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";
const indexPath = path.join(__dirname, "index.html");

function sendIndex(res, method) {
  if (method === "HEAD") {
    fs.stat(indexPath, (err, st) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end();
        return;
      }
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": String(st.size),
        "Cache-Control": "public, max-age=300",
      });
      res.end();
    });
    return;
  }

  fs.readFile(indexPath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Server error");
      return;
    }
    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const raw = req.url || "/";
  const urlPath = raw.split("?")[0].replace(/\/+$/, "") || "/";

  if (urlPath === "/health" || urlPath === "/healthz") {
    res.writeHead(200, {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    });
    res.end("ok");
    return;
  }

  if (urlPath === "/" || urlPath === "/index.html") {
    const method = req.method || "GET";
    if (method === "GET" || method === "HEAD") {
      sendIndex(res, method);
      return;
    }
    res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Method Not Allowed");
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

server.listen(PORT, HOST, () => {
  console.log("Listening on http://" + HOST + ":" + PORT);
});

function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 10_000).unref();
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
