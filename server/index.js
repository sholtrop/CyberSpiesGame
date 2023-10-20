import { Server } from "socket.io";
import http from "http";

const server = http.createServer();

const io = new Server(server, { cors: "*" });

io.on(
  "connection",

  (client) => {
    console.debug(`Client connected`);

    client.on("nfcScanned", (nfcTag) => {
      console.debug(`NFC tag has been scanned with number: ${nfcTag.number}`);
    });

    client.on("playerKilled", (data) => {
      client.broadcast(`playerKilled`, { playerName: `lochyin` });
    });

    client.on("disconnect", () => {
      console.debug(`Client disconnected`);
    });
  }
);

const port = 3000;
console.debug(`Listening on ${port}`);

io.listen(port);
