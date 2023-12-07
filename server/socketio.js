import { Server } from "socket.io";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

// HTTPS needed for NFC scanner
const useHTTPS = process.env.NODE_ENV === "production";

let credentials;
if (useHTTPS) {
  console.log("Using HTTPS");
  const privateKey = fs.readFileSync(
    "/etc/letsencrypt/live/mms.sholtrop.dev/privkey.pem",
    "utf8"
  );
  const certificate = fs.readFileSync(
    "/etc/letsencrypt/live/mms.sholtrop.dev/fullchain.pem",
    "utf8"
  );
  credentials = { key: privateKey, cert: certificate };
}

// Create the server based on the chosen module
const server = useHTTPS ? https.createServer(credentials) : http.createServer();

// Pass the server to Socket.IO
export const io = new Server(server, { cors: "*" });
