import { dev } from "$app/environment";
import * as socketIO from "socket.io-client";
import type { GameAction } from "./types";

const SERVER = ``;
let socket: socketIO.Socket | null = null;

export function getSocketIO(): socketIO.Socket {
  if (socket == null) {
    socket = socketIO
      .connect(dev ? `http://localhost:3000` : SERVER)
      .on("connect", () => {
        console.debug(`Connected to socketIO`);
      });
    console.debug("Created new socket");
  }
  return socket;
}

export function emitGameAction(action: GameAction) {
  socket?.emit("gameAction", action);
}