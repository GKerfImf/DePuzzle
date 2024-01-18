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
  const [puzzleStatus, setPuzzleStatus] = useState(ProblemStatus.Solving);

  // Tracks the state of the puzzle
  const [puzzle, setPuzzle] = useState<TPuzzle | null>(null);

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

  useEffect(() => {
    fetchNewProblem();
  }, []);

  function updateHints(hints: string) {
    const newHints: Map<string, number> = new Map(
      Object.entries(JSON.parse(hints)),
    );
    setCurrentHints(newHints);
  }

  async function fetchNewProblem() {
    const puzzle: TPuzzle = await getNewPuzzle();
    setPuzzle(puzzle);
    setCurrentHints(new Map());
  }

  async function submitOnClick() {
    if (!puzzle) {
      return;
    }
    const check = await checkSolution(
      puzzle.id,
      puzzle.shuffled_sentence.sentence,
      currentHints,
    );
    updateHints(check.hints);
    if (check.isCorrect) {
      setPuzzleStatus(ProblemStatus.Correct);
    }
  }

  async function giveUpOnClick() {
    if (!puzzle) {
      return;
    }
    const check = await checkSolution(
      puzzle.id,
      puzzle.shuffled_sentence.sentence,
      currentHints,
    );
    updateHints(check.hints);
    setPuzzleStatus(ProblemStatus.Incorrect);
  }

  function nextProblemOnClick() {
    setPuzzleStatus(ProblemStatus.Solving);
    fetchNewProblem();
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center">
      <SentenceToTranslate puzzle={puzzle} />
      {puzzle ? (
        <DragNDropArea
          puzzle={puzzle}
          setPuzzle={setPuzzle}
          wordHints={getHint}
          problemStatus={puzzleStatus}
        />
      ) : null}
      <ControlButtons
        puzzleStatus={puzzleStatus}
        giveUpOnClick={giveUpOnClick}
        submitOnClick={submitOnClick}
        nextProblemOnClick={nextProblemOnClick}
      />
    </div>
  );
}
