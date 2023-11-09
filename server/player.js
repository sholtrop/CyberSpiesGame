import { io } from "./socketio.js";

export class Player {
  constructor({ name, connection, status, role, id }) {
    this.name = name;
    this.connection = connection;
    this.status = status;
    this.role = role;
    this.color = randomPlayerColor();
    this.id = id;
  }

  // Emit the current player status to that specific player
  synchronize() {
    io.to(this.id).emit("playerUpdate", { player: this });
  }
}

const colors = ["green", "blue", "yellow", "white", "red"];

function randomPlayerColor() {
  const randInt = Math.floor(Math.random() * colors.length);
  return colors[randInt];
}
