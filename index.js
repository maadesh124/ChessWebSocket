const express = require("express");
const WebSocket = require("ws");
const { roomManager } = require("./src/RoomManager");
const cors = require("cors");

const app = express();

// ✅ use Render-assigned port
const PORT = process.env.PORT || 8081;
app.use(cors());
const server = app.listen(PORT, () => {
  console.log(`✅ Server started on ${PORT}`);
  console.log(`http://localhost:${PORT}`);
  console.log(`Rooms=${roomManager.rooms.size}`);
});

// ✅ Health check route (important for Render)
app.get("/", (req, res) => {
  res.send("Server is alive 🚀");
});

app.get("/createRoom", (req, res) => {
  const id = roomManager.createRoom();
  res.send(id);
  console.log(`room created with id=${id}`);
});

// ✅ Attach WebSocket server to Express server
const wss = new WebSocket.Server({ server });

wss.on("connection", ws => {
  console.log(`New client added, rooms=${roomManager.rooms.size}`);

  ws.on("message", messageS => {
    try {
      const message = JSON.parse(messageS.toString());
      const roomId = message.roomId;
      console.log(`msg=${JSON.stringify(message)}`);
      if (message.join === true) roomManager.joinRoom(roomId, ws);
      roomManager.sendMessage(roomId, ws, JSON.stringify(message));
    } catch (err) {
      console.error("❌ Error parsing message:", err);
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    roomManager.dismiss(ws);
  });
});
