import React from "react";
import { useState, useEffect } from "react";
import Puzzle from "./Puzzle";
import Hint from "./util/hint";
import Header from "./components/header";

enum ProblemStatus {
  Solving,
  Correct,
  Incorrect,
}

const API_SERV = "https://de-puzzle-api.vercel.app";
// const API_SERV = "http://localhost:5174";

function App() {
  // Tracks whether the current puzzle is being solved, solved correctly, or solved incorrectly
  const [puzzleStatus, setPuzzleStatus] = useState(ProblemStatus.Solving);

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

  useEffect(() => {
    fetchNewProblem();
  }, []);

  async function fetchNewProblem() {
    const puzzle = await fetch(`${API_SERV}/get-new-puzzle`).then((response) =>
      response.json(),
    );
    setPuzzleID(puzzle.id);
    setPuzzleElo(puzzle.elo);
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
    const response = await fetch(`${API_SERV}/main`, {
      method: "POST",
      body: JSON.stringify({
        sentence_index: puzzleID,
        solution: currentSolution,
        known_hints: JSON.stringify(Object.fromEntries(currentHints)),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => response.json());

    // Update hints regardless of the result to make the words green
    updateHints(response.hints);

    if (response.isCorrect) {
      setPuzzleStatus(ProblemStatus.Correct);
    }
  };

  const giveUpOnClick = () => {
    setPuzzleStatus(ProblemStatus.Incorrect);
  };

  const nextProblemOnClick = () => {
    setPuzzleStatus(ProblemStatus.Solving);
    fetchNewProblem();
  };

  // TODO: can this be done with useContext?
  // Based on the problem status, Sets the color for component borders
  const getBorderColor = () => {
    switch (puzzleStatus) {
      case ProblemStatus.Solving:
        return "border";
      case ProblemStatus.Correct:
        return "border-2 border-green-500";
      case ProblemStatus.Incorrect:
        return "border-2 border-red-500";
    }
  };

  return (
    // <div className="flex h-full w-screen max-w-xl flex-col justify-center pt-10 font-mono">
    <div className="felx flex-col justify-center font-mono">
      <Header />
      <div className="mx-auto flex max-w-xl flex-col items-center">
        {/*  */}
        <div className={`m-2 w-full rounded-2xl border bg-white shadow-xl`}>
          <p className="px-10 pb-6 pt-8 text-xl font-medium text-blue-900">
            {sentenceToTranslate}
          </p>
          <div className="flex w-full justify-between px-4 pb-2 font-mono text-xs text-gray-400">
            <p className="">Elo: {puzzleElo}</p>
            <p className="">From: {puzzleFrom}</p>
          </div>
        </div>

        {/*  */}

        <div
          className={`${getBorderColor()} m-2 flex w-full justify-center rounded-2xl bg-white p-8 shadow-xl`}
        >
          <Puzzle
            wordHints={getHint}
            getCurrentSolution={() => {
              return currentSolution;
            }}
            setCurrentSolution={setCurrentSolution}
          />
        </div>
        <div className="flex w-full justify-end">
          {puzzleStatus == ProblemStatus.Solving
            ? [
                <button
                  id={"GiveUpButton"}
                  className="m-2 rounded-lg bg-indigo-500 p-2 text-white"
                  onClick={giveUpOnClick}
                >
                  Give up
                </button>,
                <button
                  id={"SubmitButton"}
                  className="m-2 rounded-lg bg-indigo-500 p-2 text-white"
                  onClick={submitOnClick}
                >
                  Submit
                </button>,
              ]
            : null}
          {puzzleStatus != ProblemStatus.Solving
            ? [
                <button
                  id={"NextProblemButton"}
                  className="m-2 rounded-lg bg-indigo-500 p-2 text-white"
                  onClick={nextProblemOnClick}
                >
                  Next Problem
                </button>,
              ]
            : null}
        </div>
      </div>
    </div>
  );
}

export default App;
