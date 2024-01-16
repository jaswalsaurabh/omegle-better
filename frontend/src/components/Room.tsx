/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Socket, io } from "socket.io-client";

function Room({
  name,
  localVideoTrack,
  localAudioTrack,
}: {
  name: string;
  localVideoTrack: MediaStreamTrack | null;
  localAudioTrack: MediaStreamTrack | null;
}) {
  const [searchParams] = useSearchParams();

  const [socket, setSocket] = useState<null | Socket>(null);
  const [lobby, setLobby] = useState(true);
  const [sendingPC, setSendingPC] = useState<RTCPeerConnection | null>(null);
  const [receivingPC, setReceivingPC] = useState<RTCPeerConnection | null>(
    null
  );
  const [remoteVideoTrack, setRemoteVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteAudioTrack, setRemoteAudioTrack] =
    useState<MediaStreamTrack | null>(null);
  const [remoteMediaStream, setRemoteMediaStream] =
    useState<MediaStream | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // const [connected, setConnected] = useState<boolean>(false);

  const URL = "http://localhost:3000";
  useEffect(() => {
    const socket = io(URL);
    // socket.on("connect", () => {
    //   setConnected(true);
    // });
    socket.on("send-offer", async ({ roomId }: { roomId: string }) => {
      // alert("send offer please ");
      console.log("sending offfer");
      setLobby(false);
      const pc = new RTCPeerConnection();
      if (localAudioTrack) {
        pc.addTrack(localAudioTrack);
      }
      if (localVideoTrack) {
        pc.addTrack(localVideoTrack);
      }
      setSendingPC(pc);
      // any time i hit stun server send offer
      pc.onicecandidate = async (e) => {
        // we've to resend my details
        console.log("receiving ice candindate locally");
        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "sender",
            roomId,
          });
          // pc.addIceCandidate(e.candidate);
        }
      };

      pc.onnegotiationneeded = async () => {
        console.log("onnegotiationneeded ");
        setTimeout(async () => {
          const sdp = await pc.createOffer();
          // @ts-ignore
          pc.setLocalDescription(sdp);
          socket.emit("offer", {
            roomId,
            sdp,
          });
        }, 2000);
      };
    });

    socket.on("offer", async ({ roomId, sdp: remoteSdp }) => {
      // console.log("this is roomId", roomId);
      console.log("offer received");
      setLobby(false);
      const pc = new RTCPeerConnection();
      pc.setRemoteDescription(remoteSdp);
      // @ts-ignore
      const sdp = await pc.createAnswer();
      pc.setLocalDescription(sdp);

      const stream = new MediaStream();
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setRemoteMediaStream(stream);
      // tricle ice
      setReceivingPC(pc);
      pc.onicecandidate = async (e) => {
        // we've to resend my details
        console.log("receiber side onicecandidate");

        if (e.candidate) {
          socket.emit("add-ice-candidate", {
            candidate: e.candidate,
            type: "receiver",
            roomId,
          });
          // pc.addIceCandidate(e.candidate);
        }
      };

      pc.ontrack = (e) => {
        console.log("this is on track ,",e);
        
        const {type,track} = e
        if (type == "audio") {
          // setRemoteAudioTrack(track);
          // @ts-ignore
          remoteVideoRef.current.srcObject.addTrack(track);
        } else {
          // setRemoteVideoTrack(track);
          // @ts-ignore
          remoteVideoRef.current.srcObject.addTrack(track);
        }
      };
      socket.emit("answer", {
        roomId,
        sdp,
      });
    });

    socket.on("lobby", () => {
      console.log("here lobby");

      setLobby(true);
    });

    socket.on("answer", ({ roomId, sdp: remoteSdp }) => {
      setLobby(false);
      setSendingPC((pc) => {
        pc?.setRemoteDescription(remoteSdp);
        return pc;
      });
      console.log("loop closed");
      // alert("connection done bro ");
    });

    socket.on("add-ice-candidate", ({ candidate, type }) => {
      console.log("add-ice-candidate");
      console.log("{ candidate, type }", { candidate, type });

      if (type == "sender") {
        setReceivingPC((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      } else {
        setSendingPC((pc) => {
          pc?.addIceCandidate(candidate);
          return pc;
        });
      }
    });

    setSocket(socket);
  }, [name]);

  const getCamera = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (!localVideoRef.current) {
      return;
    }
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    localVideoRef.current.srcObject = new MediaStream([videoTrack]);
    // setLocalVideoTrack(videoTrack);
    // setLocalAudioTrack(audioTrack);
  };

  useEffect(() => {
    if (localVideoRef.current) {
      if (localVideoTrack) {
        localVideoRef.current.srcObject = new MediaStream([localVideoTrack]);
      }
      // getCamera()
    }
  }, [localVideoRef]);

  // if (lobby) {
  //   return <div>Waiting for connect you to someone</div>;
  // }

  return (
    <div>
      <h1>Hi, Welcome {name} in room</h1>
      <Link to="/">Home </Link>
      <video ref={localVideoRef} width={400} height={400} autoPlay />
      {lobby ? "Waiting for connect you to someone" : ""}
      <video width={400} height={400} autoPlay ref={remoteVideoRef} />
    </div>
  );
}

export default Room;
