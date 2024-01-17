import React from "react";
import { useState, useEffect } from "react";
import { useSession } from "@clerk/clerk-react";
import Hint from "../util/hint";
import ProblemStatus from "../util/problem_status";
import DragNDropArea from "./drag_n_drop";
import ControlButtons from "./control_buttons";
import SentenceToTranslate from "./sentence_translate";
import { useFetch } from "@/hooks/useFetch";

export default function Puzzle() {
  const { isSignedIn, isLoaded } = useSession();
  const { sayHi, getNewPuzzle, checkSolution } = useFetch();

  // Tracks whether the current puzzle is being solved, solved correctly, or solved incorrectly
  const [puzzleStatus, setPuzzleStatus] = useState(ProblemStatus.Incorrect);

  // Remember puzzle's ID to check the solution later
  const [puzzleID, setPuzzleID] = useState("");

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
    if (isLoaded && isSignedIn) {
      sayHi();
    }
  }, [isLoaded, isSignedIn]);

  async function fetchNewProblem() {
    const puzzle = await getNewPuzzle();
    setPuzzleID(puzzle.id);
    setPuzzleElo(puzzle.rating.rating);
    setPuzzleFrom(puzzle.shuffled_sentence.taken_from);
    setSentenceToTranslate(puzzle.translated_sentence.sentence);
    setCurrentSolution(puzzle.shuffled_sentence.sentence);
    setCurrentHints(new Map());
  }

  function updateHints(hints: string) {
    const newHints: Map<string, number> = new Map(
      Object.entries(JSON.parse(hints)),
    );
    setCurrentHints(newHints);
  }

  const submitOnClick = async () => {
    const check = await checkSolution(puzzleID, currentSolution, currentHints);
    updateHints(check.hints);
    if (check.isCorrect) {
      setPuzzleStatus(ProblemStatus.Correct);
    }
  };

  const giveUpOnClick = async () => {
    const check = await checkSolution(puzzleID, currentSolution, currentHints);
    updateHints(check.hints);
    setPuzzleStatus(ProblemStatus.Incorrect);
  };

  const nextProblemOnClick = () => {
    setPuzzleStatus(ProblemStatus.Solving);
    fetchNewProblem();
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center">
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
