import * as socketIO from "socket.io-client";
import type { GameAction } from "./types";
import { env } from "$env/dynamic/public";

let socket: socketIO.Socket | null = null;

export function getSocketIO(): socketIO.Socket {
  if (socket == null) {
    const SERVER =
      window.location.hostname === "localhost"
        ? "http://localhost:3000"
        : `${window.location.hostname}`;
    console.log({ SERVER });
    socket = socketIO
      .connect(SERVER, { secure: env.PUBLIC_SERVER != null })
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
