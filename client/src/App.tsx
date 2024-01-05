import React from "react";
import { useState, useEffect } from "react";
import Puzzle from "./Puzzle";
import Hint from "./util/hint";

const API_SERV = "https://de-puzzle-api.vercel.app";
// const API_SERV = "http://localhost:5174";

function App() {
  // State that tracks whether the current problem is being solved
  const [beingSolved, setBeingSolved] = useState(true);

  // Store sentence's index in the database
  const [sentenceIndex, setSentenceIndex] = useState(-1);

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
    const translationProblem = await fetch(`${API_SERV}/main`).then(
      (response) => response.json(),
    );
    setSentenceIndex(translationProblem.problem_id);
    setSentenceToTranslate(translationProblem.to_translate);
    setCurrentSolution(translationProblem.shuffled_words);
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
        sentence_index: sentenceIndex,
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
      setBeingSolved(!beingSolved);
      // TODO: celebrate
    }
  };

  const giveUpOnClick = () => {
    setBeingSolved(!beingSolved);
  };

  const nextProblemOnClick = () => {
    setBeingSolved(!beingSolved);
    fetchNewProblem();
  };

  return (
    <div className="h-full w-full max-w-xl flex-col pt-10 font-mono">
      <div className="m-2 flex justify-center rounded-2xl border bg-white p-10 text-xl font-medium text-blue-900 shadow-xl">
        {sentenceToTranslate}
      </div>
      <div className="m-2 flex justify-center rounded-2xl border bg-white p-8 shadow-xl">
        <Puzzle
          wordHints={getHint}
          getCurrentSolution={() => {
            return currentSolution;
          }}
          setCurrentSolution={setCurrentSolution}
        />
      </div>
      <div className="flex justify-end">
        {beingSolved
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
        {!beingSolved
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
  );
}

export default App;
