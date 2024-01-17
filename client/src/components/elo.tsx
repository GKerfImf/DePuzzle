import React from "react";
import { useState, useEffect } from "react";
import { useSession } from "@clerk/clerk-react";
import { useFetch } from "@/hooks/useFetch";

export default function Elo() {
  const { getElo } = useFetch();
  const { isSignedIn } = useSession();

  const [userElo, setUserElo] = useState(null);

  // TODO: there is a problem with the case when the user does not exist, but
  // this effect runs before [/say-hi]
  // TODO: it queries /user-elo toooo often, fix
  useEffect(() => {
    if (isSignedIn) {
      (async () => {
        setUserElo(await getElo());
      })();
    }
  }, []);

  return (
    <span className="mx-8 font-medium"> {Math.floor(Number(userElo))} </span>
  );
}
