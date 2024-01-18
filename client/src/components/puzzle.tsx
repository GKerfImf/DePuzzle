import React, { useContext } from "react";
import { useState, useEffect } from "react";
import { useSession } from "@clerk/clerk-react";
import Hint from "../util/hint";
import ProblemStatus from "../util/problem_status";
import DragNDropArea from "./drag_n_drop";
import ControlButtons from "./control_buttons";
import SentenceToTranslate from "./sentence_translate";
import { useFetch } from "@/hooks/useFetch";
import ProblemStatusContext from "@/contexts/problem_status";

export default function Puzzle() {
  const { isSignedIn, isLoaded } = useSession();
  const { sayHi, getNewPuzzle, checkSolution } = useFetch();

  // Tracks whether (1) the current puzzle is being solved, solved correctly, or
  // solved incorrectly, and (2) the number of tries
  const { problemStatus, updateProblemStatus } =
    useContext(ProblemStatusContext)!;

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
      updateProblemStatus(ProblemStatus.Correct);
    } else {
      // call [updateProblemStatus] anyway to increase the number of tries
      updateProblemStatus(ProblemStatus.Solving);
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
    updateProblemStatus(ProblemStatus.Incorrect);
  }

  function nextProblemOnClick() {
    updateProblemStatus(ProblemStatus.Solving);
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
          problemStatus={problemStatus}
        />
      ) : null}
      <ControlButtons
        puzzleStatus={problemStatus}
        giveUpOnClick={giveUpOnClick}
        submitOnClick={submitOnClick}
        nextProblemOnClick={nextProblemOnClick}
      />
    </div>
  );
}
