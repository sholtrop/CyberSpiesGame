const { Server } = require("socket.io");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");

// HTTPS needed for NFC scanner
const useHTTPS = process.env.NODE_ENV === "production";

let credentials;
if (useHTTPS) {
  const privateKey = fs.readFileSync(
    path.resolve(__dirname, "path/to/private-key.pem"),
    "utf8"
  );
  const certificate = fs.readFileSync(
    path.resolve(__dirname, "path/to/certificate.pem"),
    "utf8"
  );
  const ca = fs.readFileSync(path.resolve(__dirname, "path/to/ca.pem"), "utf8");
  credentials = { key: privateKey, cert: certificate, ca: ca };
}

// Create the server based on the chosen module
const server = useHTTPS ? https.createServer(credentials) : http.createServer();

// Pass the server to Socket.IO
export const io = new Server(server, { cors: "*" });
