import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000"); // backend localhost

export default function App() {
  const [lobby, setLobby] = useState({});
  const [name, setName] = useState("");

  const join = () => {
    if (name) socket.emit("joinLobby", name);
  };

  const guess = () => {
    socket.emit("guess");
  };

  useEffect(() => {
    socket.on("lobbyUpdate", (data) => setLobby(data));
    socket.on("playerUpdate", (data) => setLobby(data));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>PvP Wordle</h1>
      <input placeholder="İsminiz" value={name} onChange={e => setName(e.target.value)} />
      <button onClick={join}>Katıl</button>
      <button onClick={guess}>Tahmin Gönder</button>

      <h2>Lobby</h2>
      <ul>
        {Object.values(lobby).map((player, i) => {
          const p = JSON.parse(player);
          return <li key={i}>{p.name} - Score: {p.score}</li>;
        })}
      </ul>
    </div>
  );
}
