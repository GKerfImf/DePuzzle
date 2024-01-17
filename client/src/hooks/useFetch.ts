import { useSession } from "@clerk/clerk-react";

const API_SERV = "https://dolphin-app-9h28j.ondigitalocean.app";
// const API_SERV = "http://localhost:8080";

export const useFetch = () => {
  const { session } = useSession();

  const sayHi = async () => {
    const response = fetch(`${API_SERV}/say-hi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await session!.getToken()}`,
      },
    }).then((response) => response.json());

    return response;
  };

  const getNewPuzzle = async () => {
    const route = session
      ? `${API_SERV}/get-new-puzzle-auth`
      : `${API_SERV}/get-new-puzzle`;

    const auth = session ? `Bearer ${await session!.getToken()}` : ``;

    const puzzle = fetch(route, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
    }).then((response) => response.json());

    return puzzle;
  };

  const checkSolution = async (
    puzzleID: string,
    currentSolution: string[],
    currentHints: Map<string, number>,
  ) => {
    const route = session
      ? `${API_SERV}/check-puzzle-auth`
      : `${API_SERV}/check-puzzle`;

    const auth = session ? `Bearer ${await session!.getToken()}` : ``;

    const response = fetch(route, {
      method: "POST",
      body: JSON.stringify({
        sentence_index: puzzleID,
        solution: currentSolution,
        known_hints: JSON.stringify(Object.fromEntries(currentHints)),
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
    }).then((response) => response.json());

    return response;
  };

  const getElo = async () => {
    const response = fetch(`${API_SERV}/user-elo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await session!.getToken()}`,
      },
    }).then((response) => response.json());

    return response;
  };

  return { sayHi, getNewPuzzle, checkSolution, getElo };
};
