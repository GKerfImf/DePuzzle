import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { useFetch } from "@/hooks/useFetch";
import ProblemStatusContext from "@/contexts/problem_status";

export default function Elo() {
  const { getElo } = useFetch();

  const { numberOfTries, problemStatus } = useContext(ProblemStatusContext)!;
  const [userElo, setUserElo] = useState(null);

  useEffect(() => {
    (async () => {
      setUserElo(await getElo());
    })();
  }, [problemStatus, numberOfTries]);

  return (
    <span className="mx-8 font-medium"> {Math.floor(Number(userElo))} </span>
  );
}
