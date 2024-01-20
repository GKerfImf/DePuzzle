import { generateCookie } from "@/util/cookie";
import { useEffect } from "react";

const API_SERV = "https://dolphin-app-9h28j.ondigitalocean.app";
// const API_SERV = "http://localhost:8080";

export const useFetch = () => {
  useEffect(() => {
    generateCookie("visitor_id");
  }, []);

  const getNewPuzzle = async () => {
    const puzzle = fetch(
      `${API_SERV}/get-new-puzzle?visitor_id=${generateCookie("visitor_id")}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((response) => response.json());

    return puzzle;
  };

  const checkSolution = async (
    puzzleID: string,
    currentSolution: string[],
    currentHints: Map<string, number>,
  ) => {
    const response = fetch(
      `${API_SERV}/check-puzzle?visitor_id=${generateCookie("visitor_id")}`,
      {
        method: "POST",
        credentials: "include",
        body: JSON.stringify({
          sentence_index: puzzleID,
          solution: currentSolution,
          known_hints: JSON.stringify(Object.fromEntries(currentHints)),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((response) => response.json());

    return response;
  };

  const getElo = async () => {
    generateCookie("visitor_id");
    const response = fetch(
      `${API_SERV}/user-elo?visitor_id=${generateCookie("visitor_id")}`,
      {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      },
    ).then((response) => response.json());

    return response;
  };

  return { getNewPuzzle, checkSolution, getElo };
};
