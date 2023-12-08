import { Server } from "socket.io";
import http from "http";
import https from "https";
import fs from "fs";
import express from 'express';

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
  console.log({ url: req.url })
  if (req.url !== '/' && !req.url.includes('.'))
    req.url = req.url + '.html'
  next();

}, express.static('../build'))

// app.get('/:x', (req, res) => {
//   // Extract the value of :x from the request parameters
//   const x = req.params.x;

//   let filename = x;
//   // Construct the filename by appending '.html' to :x
//   if (!filename.includes('.'))
//     filename = `${x}.html`;

//   console.log({ filename })

//   // Send the specified HTML file
//   res.sendFile("/home/sjors/development/svelte/amogus_irl/build/" + filename);
// });

// Create the server based on the chosen module
export const server = useHTTPS
  ? https.createServer(credentials, app)
  : http.createServer(app);

// Pass the server to Socket.IO
export const io = new Server(server, { cors: "*" });
