import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { createClient } from "redis";
import cors from "cors";

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const redisClient = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
redisClient.on("error", (err) => console.log("Redis error", err));
await redisClient.connect();
console.log("Redis connected!");

io.on("connection", (socket) => {
  console.log("Yeni kullanıcı bağlandı", socket.id);

  socket.on("joinLobby", async (name) => {
    await redisClient.hSet("lobby", socket.id, JSON.stringify({ name, score: 0, guessed: false }));
    const lobby = await redisClient.hGetAll("lobby");
    io.emit("lobbyUpdate", lobby);
  });

  socket.on("guess", async () => {
    const data = await redisClient.hGet("lobby", socket.id);
    if (data) {
      const player = JSON.parse(data);
      player.score += 1;
      await redisClient.hSet("lobby", socket.id, JSON.stringify(player));
    }
    const lobby = await redisClient.hGetAll("lobby");
    io.emit("playerUpdate", lobby);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
