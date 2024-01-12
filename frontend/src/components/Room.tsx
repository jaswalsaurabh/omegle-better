import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

function Room() {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");

  const [socket, setSocket] = useState<null | Socket>(null);
  const [lobby, setLobby] = useState(true);

  // const [connected, setConnected] = useState<boolean>(false);

  const URL = "http://localhost:3000";
  useEffect(() => {
    const socket = io(URL);
    // socket.on("connect", () => {
    //   setConnected(true);
    // });
    setSocket(socket);

    socket.on("send-offer", ({ roomId }: { roomId: string }) => {
      alert("send offer please ");
      console.log("this is roomId", roomId);
      setLobby(false);
      console.log("this is roomId", roomId);

      socket.emit("offer", {
        roomId,
        sdp: "",
      });
    });

    socket.on(
      "offer",
      ({ roomId, offer }: { roomId: string | number; offer: string }) => {
        console.log("this is roomId", roomId);
        console.log("this is offer", offer);
        alert("send answer please");
        setLobby(false);
        socket.emit("answer", {
          roomId,
          sdp: "",
        });
      }
    );

    socket.on("lobby", () => {
      console.log("here lobby");

      setLobby(true);
    });

    socket.on("answer", ({ roomId, answer }) => {
      setLobby(false);
      alert("connection done bro ");
    });

    setSocket(socket);
  }, [name]);
  if (lobby) {
    return <div>Waiting for connect you to someone</div>;
  }

  return (
    <div>
      <h1>Welcome in {name} room</h1>
      <Link to="/">Home </Link>
    </div>
  );
}

export default Room;
