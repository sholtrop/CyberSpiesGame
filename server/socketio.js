import { Server } from "socket.io";
import http from "http";

const server = http.createServer();

export const io = new Server(server, { cors: "*" });
