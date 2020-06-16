import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import { Socket, Presence } from "phoenix";
import { useLocation } from "react-router-dom";
import random_name from "node-random-name";

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};
const socket = new Socket("ws://localhost:4000/socket", {
  params: { username: random_name() },
});
socket.connect();
let channel;
let presence;

function App() {
  const [presences, setPresences] = useState();

  const query = useQuery();
  const id = query.get("id");

  useEffect(() => {
    channel = socket.channel(`room:${id}`);
    channel
      .join()
      .receive("ok", ({ userId }) => console.log(`Received userId: ${userId}`))
      .receive("error", ({ reason }) => console.log("failed join", reason))
      .receive("timeout", () =>
        console.log("Networking issue. Still waiting...")
      );

    presence = new Presence(channel);

    presence.onSync(() => {
      setPresences((prev) => {
        return presence.list();
      });
    });
    return () => {
      channel.off("move");
    };
  }, [id]);

  const handleMouseMove = (e) => {
    if (channel) {
      channel.push(
        "move",
        {
          posX: e.nativeEvent.clientX,
          posY: 0,
          posZ: e.nativeEvent.clientY,
        },
        10000
      );
    }
  };

  return (
    <div className="App" onMouseMove={handleMouseMove}>
      <p>{JSON.stringify(presences)}</p>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
