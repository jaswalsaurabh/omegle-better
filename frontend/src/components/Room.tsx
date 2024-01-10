import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

function Room() {
  const [searchParams] = useSearchParams();
  const name = searchParams.get("name");

  useEffect(() => {
    // user init logic for room
  }, [name]);

  return (
    <div>
      <h1>Welcome in {name} room</h1>
      <Link to="/">Home </Link>
    </div>
  );
}

export default Room;
