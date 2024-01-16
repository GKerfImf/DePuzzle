import React from "react";
import { useState, useEffect } from "react";
import { useSession } from "@clerk/clerk-react";

const API_SERV = "https://dolphin-app-9h28j.ondigitalocean.app";
// const API_SERV = "http://localhost:8080";

export default function Elo() {
  const { session, isSignedIn, isLoaded } = useSession();

  const [userElo, setUserElo] = useState(null);

  // TODO: there is a problem with the case when the user does not exist, but
  // this effect runs before [/say-hi]
  // TODO: it queries /user-elo toooo often, fix
  useEffect(() => {
    const setElo = async () => {
      const response = await fetch(`${API_SERV}/user-elo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await session!.getToken()}`,
        },
      }).then((response) => response.json());
      setUserElo(response);
    };
    if (isLoaded && isSignedIn) {
      setElo();
    }
  });

  return (
    <span className="mx-8 font-medium"> {Math.floor(Number(userElo))} </span>
  );
}
