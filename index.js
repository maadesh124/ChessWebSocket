const express = require("express");
const WebSocket = require("ws");
const { generatePassword } = require("./src/Helper");
const app = express();
const { roomManager } = require("./src/RoomManager");

const server = app.listen(8080, () => {
  console.log(`\n\nServer started on 8080\n http://localhost:8080`);
  console.log(roomManager.rooms.size);
});

const wss = new WebSocket.Server({ server });

app.get("/createRoom", (req, res) => {
  const id = roomManager.createRoom();
  res.send(id);
  console.log(`room created with id=${id} `);
});

wss.on("connection", ws => {
  console.log(`New client added Nrooms=${roomManager.rooms.size}`);

  ws.on("message", messageS => {
    const message = JSON.parse(messageS.toString());
    const roomId = message.roomId;
    console.log(`m=${JSON.stringify(message)}`);
    if (message.join === true) roomManager.joinRoom(roomId, ws);
    roomManager.sendMessage(roomId, ws, JSON.stringify(message));
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    roomManager.dismiss(ws);
  });
});
