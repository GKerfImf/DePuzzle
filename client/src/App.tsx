import { useState, useEffect, useCallback } from "react";
import Puzzle from "./Puzzle";
import Questions from "./Questions";
import Collapse from "./Collapse";
import Hint from "./util/hint";

// const API_SERV = "https://de-puzzle-api.vercel.app";
const API_SERV = "http://localhost:5174";

function App() {
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

  useEffect(() => {
    async function fetchProblem() {
      const translationProblem = await fetch(`${API_SERV}/main`).then(
        (response) => response.json(),
      );
      setSentenceIndex(translationProblem.problem_id);
      setSentenceToTranslate(translationProblem.to_translate);
      setCurrentSolution(translationProblem.shuffled_words);
    }
    fetchProblem();
  }, []);

  const getHint = (word: string, index: number) => {
    if (currentHints.has(JSON.stringify({ word: word, index: index }))) {
      return currentHints.get(JSON.stringify({ word: word, index: index }))!;
    }
    return Hint.Unknown;
  };

  const submitOnClick = async () => {
    const result = await fetch(`${API_SERV}/main`, {
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
    const newHints: Map<string, number> = new Map(
      Object.entries(JSON.parse(result.hints)),
    );
    setCurrentHints(newHints);
  };

  const [isExpanded, setIsExpanded] = useState(false);
  const toggleIsExpanded = useCallback(() => {
    setIsExpanded((isExpanded) => !isExpanded);
  }, []);

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
          // shuffledWords={currentSolution}
          setCurrentSolution={setCurrentSolution}
        />
      </div>
      <Collapse isExpanded={isExpanded}>
        <div className="mx-2 flex-col justify-center rounded-2xl border bg-white p-7 text-xl font-medium text-blue-900 shadow-xl">
          <Questions
            sentence={
              "Is this sentence a valuable addition to vocabulary building for intermediate German learners?"
            }
          />
          <Questions
            sentence={
              "Does knowing this sentence aid in daily German conversations?"
            }
          />
          <Questions
            sentence={
              "Is this sentence suitable for A1 or A2 level German learners?"
            }
          />
        </div>
      </Collapse>
      <Collapse isExpanded={!isExpanded}>
        <div className="flex justify-end">
          <div>
            <button
              disabled
              className="m-2 rounded-lg bg-indigo-500 p-2 text-white"
              onClick={toggleIsExpanded}
            >
              Give up
            </button>
            <button
              className="m-2 rounded-lg bg-indigo-500 p-2 text-white"
              onClick={submitOnClick}
            >
              Submit
            </button>
          </div>
        </div>
      </Collapse>
    </div>
  );
}

export default App;
