import * as socketIO from "socket.io-client";
import type { GameAction } from "./types";
import { dev } from "$app/environment";

let socket: socketIO.Socket | null = null;

export function getSocketIO(): socketIO.Socket {
  const SERVER = "http://3.127.215.13:3000"; //`${window.location.hostname}:3000` ;
  if (socket == null) {
    socket = socketIO.connect(SERVER).on("connect", () => {
      console.debug(`Connected to socketIO`);
    });
    console.debug("Created new socket");
  }
  return socket;
}

export function emitGameAction(action: GameAction) {
  socket?.emit("gameAction", action);
}
