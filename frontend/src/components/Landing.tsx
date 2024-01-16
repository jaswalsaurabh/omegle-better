import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Room from "./Room";

function Landing() {
  const [name, setName] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();
  const [joined, setJoined] = useState(false);
  const [localVideoTrack, setLocalVideoTrack] =
    useState<MediaStreamTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] =
    useState<MediaStreamTrack | null>(null);

  const getCamera = async () => {
    const stream = await window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    if (!videoRef.current) {
      return;
    }
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];
    videoRef.current.srcObject = new MediaStream([videoTrack]);
    setLocalVideoTrack(videoTrack);
    setLocalAudioTrack(audioTrack);
  };

  useEffect(() => {
    if (videoRef && videoRef.current) {
      getCamera();
    }
  }, [videoRef]);

  function handleClick() {
    // navigate(`/room?name=${name}`);
    setJoined(true)
  }

  if (!joined) {
    return (
      <div>
        <video autoPlay ref={videoRef}></video>
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {/* <Link to={`/room?name=${name}`}>Enter Room</Link> */}
          <button onClick={handleClick}>Enter Room</button>
        </div>
      </div>
    );
  } else {
    return (
      <Room
        name={name}
        localVideoTrack={localVideoTrack}
        localAudioTrack={localAudioTrack}
      />
    );
  }
}
export default Landing;
