import React from "react";
import { useState, useEffect } from "react";
import DragNDropArea from ".//drag_n_drop";
import Hint from "../util/hint";
import { useSession } from "@clerk/clerk-react";
import SentenceToTranslate from ".//sentence_translate";
import { ProblemStatus } from "../util/problem_status";
import ControlButtons from "./control_buttons";

const API_SERV = "https://dolphin-app-9h28j.ondigitalocean.app";
// const API_SERV = "http://localhost:8080";

export default function Puzzle() {
  const { session, isSignedIn, isLoaded } = useSession();

  // Tracks whether the current puzzle is being solved, solved correctly, or solved incorrectly
  const [puzzleStatus, setPuzzleStatus] = useState(ProblemStatus.Incorrect);

  // Remember puzzle's ID to check the solution later
  const [puzzleID, setPuzzleID] = useState(-1);

  // Remeber puzzle's origin (e.g., GPT-4) and ELO rating
  const [puzzleFrom, setPuzzleFrom] = useState("");
  const [puzzleElo, setPuzzleElo] = useState("");

  // English sentence that the user has to translate to German
  const [sentenceToTranslate, setSentenceToTranslate] = useState("");

  // The current solution
  const [currentSolution, setCurrentSolution] = useState<string[]>([]);

  // Currently known set of hints
  const [currentHints, setCurrentHints] = useState<Map<string, number>>(
    new Map(),
  );
  //Function that converts a word and its position to a hint
  const getHint = (word: string, index: number) => {
    if (currentHints.has(JSON.stringify({ word: word, index: index }))) {
      return currentHints.get(JSON.stringify({ word: word, index: index }))!;
    }
    return Hint.Unknown;
  };

  // If user does not exist, add one to the database
  useEffect(() => {
    const sayHi = async () => {
      const response = await fetch(`${API_SERV}/say-hi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await session!.getToken()}`,
        },
      }).then((response) => response.json());

      return response;
    };
    if (isLoaded && isSignedIn) {
      sayHi();
    }
  }, [isLoaded, isSignedIn]);

  async function fetchNewProblem() {
    const setupPuzzle = (puzzle: any) => {
      setPuzzleID(puzzle.id);
      setPuzzleElo(puzzle.rating.rating);
      setPuzzleFrom(puzzle.shuffled_sentence.taken_from);
      setSentenceToTranslate(puzzle.translated_sentence.sentence);
      setCurrentSolution(puzzle.shuffled_sentence.sentence);
      setCurrentHints(new Map());
    };

    const route = session
      ? `${API_SERV}/get-new-puzzle-auth`
      : `${API_SERV}/get-new-puzzle`;

    const auth = session ? `Bearer ${await session!.getToken()}` : ``;

    const puzzle = await fetch(route, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: auth,
      },
    }).then((response) => response.json());

    setupPuzzle(puzzle);
  }

  function updateHints(hints: string) {
    const newHints: Map<string, number> = new Map(
      Object.entries(JSON.parse(hints)),
    );
    setCurrentHints(newHints);
  }

  const checkSolution = async () => {
    const route = session
      ? `${API_SERV}/check-puzzle-auth`
      : `${API_SERV}/check-puzzle`;

    const auth = session ? `Bearer ${await session!.getToken()}` : ``;

    return fetch(route, {
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
  };

  const submitOnClick = async () => {
    const check = await checkSolution();

    // Update hints regardless of the result to make the words green
    updateHints(check.hints);

    if (check.isCorrect) {
      setPuzzleStatus(ProblemStatus.Correct);
    }
  };

  const giveUpOnClick = async () => {
    const check = await checkSolution();

    // Update hints regardless of the result to make the words red/green
    updateHints(check.hints);

    setPuzzleStatus(ProblemStatus.Incorrect);
  };

  const nextProblemOnClick = () => {
    setPuzzleStatus(ProblemStatus.Solving);
    fetchNewProblem();
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center">
      {/*  */}
      <SentenceToTranslate
        sentenceToTranslate={sentenceToTranslate}
        puzzleElo={puzzleElo}
        puzzleFrom={puzzleFrom}
      />
      <DragNDropArea
        currentSolution={currentSolution}
        wordHints={getHint}
        setCurrentSolution={setCurrentSolution}
        problemStatus={puzzleStatus}
      />
      <ControlButtons
        puzzleStatus={puzzleStatus}
        giveUpOnClick={giveUpOnClick}
        submitOnClick={submitOnClick}
        nextProblemOnClick={nextProblemOnClick}
      />
    </div>
  );
}
