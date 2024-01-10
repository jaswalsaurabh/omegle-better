import { useState } from "react";
import { Link } from "react-router-dom";

function Landing() {
  const [name, setName] = useState("");
  return (
    <div>
      Landing
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {name && <Link to={`/room?name=${name}`}>Enter Room</Link>}
      </div>
    </div>
  );
}

export default Landing;
