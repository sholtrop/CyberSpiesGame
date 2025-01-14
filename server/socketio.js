import { Server } from "socket.io";
import http from "http";
import https from "https";
import fs from "fs";
import express from "express";
import { url } from "inspector";

// HTTPS needed for NFC scanner
const useHTTPS = process.env.NODE_ENV === "production";

let credentials;
if (useHTTPS) {
  const privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/mms.sholtrop.dev/privkey.pem"
  );
  const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/mms.sholtrop.dev/fullchain.pem"
  );
  credentials = { key: privateKey, cert: certificate };
}

export const app = express();

app.use((req, res, next) => {
  if (req.url !== "/" && !req.url.includes(".")) {
    if (req.url.includes("?")) {
      const [url, query] = req.url.split("?");
      req.url = url + ".html?" + query;
    } else req.url = req.url + ".html";
  }
  next();
}, express.static("../build"));

// Create the server based on the chosen module
export const server = useHTTPS
  ? https.createServer(credentials, app)
  : http.createServer(app);

// Pass the server to Socket.IO
export const io = new Server(server, { cors: "*" });
