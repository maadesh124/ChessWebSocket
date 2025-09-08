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
      ws.send("Invalid Room");
      return;
    }

    const room = this.rooms.get(roomId);

    if (room.length >= 2) {
      ws.send("Room Full");
      return;
    }

    room.push(ws);
    if (room.length === 2) {
      room[0].send("start");
      room[1].send("start");
    }
  }

  leaveRoom(roomId, ws) {
    if (!this.rooms.has(roomId)) return;
    const room = this.rooms.get(roomId);
    if (room.length > 1 && room[0] === ws) room[1].send("exit");
    else if (room.length > 1 && room[1] === ws) room[0].send("exit");

    this.rooms.delete(roomId);
  }

  dismiss(ws) {
    for (let [roomId, room] of this.rooms) {
      if (room.length > 1 && room[0] === ws) room[1].send("exit");
      else if (room.length > 1 && room[1] === ws) room[0].send("exit");
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
