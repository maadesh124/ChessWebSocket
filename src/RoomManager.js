const { generatePassword } = require("./Helper");

class RoomManager {
  static instance;
  constructor() {
    if (RoomManager.instance) return RoomManager.instance;

    this.rooms = new Map();
    RoomManager.instance = this;
  }

  createRoom() {
    let roomId = generatePassword(6);
    while (this.rooms.has(roomId)) roomId = generatePassword(6);
    this.rooms.set(roomId, []);
    return roomId;
  }

  joinRoom(roomId, ws) {
    if (!this.rooms.has(roomId)) {
      ws.send(JSON.stringify({ mess: "Invalid Room" }));
      return;
    }

    const room = this.rooms.get(roomId);

    if (room.length >= 2) {
      ws.send(JSON.stringify({ mess: "RoomFull" }));
      return;
    }

    room.push(ws);
    if (room.length === 2) {
      room[0].send(JSON.stringify({ start: true, color: 0 }));
      room[1].send(JSON.stringify({ start: true, color: 1 }));
    }
  }

  leaveRoom(roomId, ws) {
    if (!this.rooms.has(roomId)) return;
    const room = this.rooms.get(roomId);
    if (room.length > 1 && room[0] === ws)
      room[1].send(JSON.stringify({ mess: "exit" }));
    else if (room.length > 1 && room[1] === ws)
      room[0].send(JSON.stringify({ mess: "exit" }));

    this.rooms.delete(roomId);
  }

  dismiss(ws) {
    for (let [roomId, room] of this.rooms) {
      if (room.length > 1 && room[0] === ws)
        room[1].send(JSON.stringify({ mess: "exit" }));
      else if (room.length > 1 && room[1] === ws)
        room[0].send(JSON.stringify({ mess: "exit" }));
      const index = room.indexOf(ws);
      if (index !== -1) this.rooms.delete(roomId);
    }
  }

  isFull(roomId) {
    if (!this.rooms.has(roomId)) return false;
    return this.rooms.get(roomId).length === 2;
  }
  sendMessage(roomId, ws, message) {
    if (!this.isFull(roomId)) return;
    const room = this.rooms.get(roomId);
    if (room[0] === ws) room[1].send(message);
    if (room[1] === ws) room[0].send(message);
  }
}

const roomManager = new RoomManager();
module.exports = { roomManager };
