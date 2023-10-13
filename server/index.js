import { Server } from "socket.io";
import http from "http";

const server = http.createServer();

const io = new Server(server, { cors: "*" });

io.on("connection", (client) => {
  console.debug(`Client connected`);

  client.on("event", (data) => {
    console.debug(`Got event:\n${JSON.stringify(data, null, 4)}`);
  });

  client.on("disconnect", () => {
    console.debug(`Client disconnected`);
  });
});

const port = 3000;
console.debug(`Listening on ${port}`);

io.listen(port);
