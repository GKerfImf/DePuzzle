import React from "react";
import { useState, useRef, useEffect, useCallback } from "react";

interface Coordinate {
  x: number;
  y: number;
}

function findClosestIndex(coord: Coordinate[], p: Coordinate): number | null {
  function skewedDistance(p1: Coordinate, p2: Coordinate): number {
    // Controls the effect of each component on the total distance. When
    // one drags a word, this function calculates the distance to the
    // closest non-dragged word. If there are multiple rows, we would
    // like the dragged word to favor words on the same row over words
    // on other rows. The Y-axis has a higher multiplier to force such
    // behavior.
    const MULT_X = 1;
    const MULT_Y = 10;

    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(MULT_X * dx * dx + MULT_Y * dy * dy);
  }

  if (coord.length === 0) {
    return null;
  }

  let closestIndex = 0;
  let closestDistance = skewedDistance(coord[0], p);

  for (let i = 1; i < coord.length; i++) {
    const currentDistance = skewedDistance(coord[i], p);
    if (currentDistance < closestDistance) {
      closestIndex = i;
      closestDistance = currentDistance;
    }
  }

  return closestIndex;
}

// https://stackoverflow.com/a/6470794/8125485
function arrayMove(arr: string[], fromIndex: number, toIndex: number) {
  var element = arr[fromIndex];
  arr.splice(fromIndex, 1);
  arr.splice(toIndex, 0, element);
}

interface DraggableWordProps {
  word: string;
  color: string;
  isDragged: boolean;
  sendCoord: (_: Coordinate) => void;
}

const DraggableWord: React.FC<DraggableWordProps> = ({
  word,
  color,
  isDragged,
  sendCoord,
}) => {
  const componentRef: React.RefObject<HTMLDivElement> = useRef(null);

  const getCenter = (div: DOMRect) => {
    return { x: (div.left + div.right) / 2, y: (div.bottom + div.top) / 2 };
  };

  useEffect(() => {
    sendCoord(getCenter(componentRef.current?.getBoundingClientRect()!));
  });

  return (
    <div
      draggable
      className={`draggable mx-2 my-1 cursor-grab rounded-lg ${color} px-2 py-1 shadow-lg
                      ${isDragged ? "bg-gray-300 opacity-50" : ""}
      `}
      ref={componentRef}
    >
      {word}
    </div>
  );
};

enum Hint {
  Correct,
  Incorrect,
  Unknown,
}

const hint2color = (hint: Hint) => {
  switch (hint) {
    case Hint.Correct: {
      return "border-2 bg-green-50 border-green-500";
    }
    case Hint.Unknown: {
      return "border bg-white";
    }
    case Hint.Incorrect: {
      return "border-2 bg-red-50 border-red-500";
    }
  }
};

interface PuzzleProps {
  shuffledWords: string[];
  wordHints: (word: string, index: number) => Hint;
  reportWordsOrder: React.Dispatch<React.SetStateAction<string[]>>;
}

const Puzzle: React.FC<PuzzleProps> = ({
  shuffledWords,
  reportWordsOrder,
  wordHints,
}) => {
  const [words, setWords] = useState<string[]>(shuffledWords);

  const [coord, setCoord] = useState<Coordinate[]>(
    Array.from({ length: words.length }, (_) => {
      return { x: 0, y: 0 };
    }),
  );

  const [draggedElIndex, setDraggedElIndex] = useState<number>(-1);
  const [prevIndex, setPrevIndex] = useState<number>(-1);

  const dragStartHandle = (event: React.DragEvent) => {
    const index = findClosestIndex(coord, {
      x: event.clientX,
      y: event.clientY,
    })!;
    setDraggedElIndex(index);
  };

  const onDragEndHandle = (_event: React.DragEvent) => {
    setDraggedElIndex(-1);
    reportWordsOrder(words);
  };

  const onDragOverHandle = (event: React.DragEvent) => {
    event.preventDefault();
    const clientCoord = { x: event.clientX, y: event.clientY };

    const closestWordIndex = findClosestIndex(coord, clientCoord);
    if (closestWordIndex != null) {
      if (
        closestWordIndex == prevIndex ||
        (draggedElIndex == prevIndex && draggedElIndex == closestWordIndex)
      ) {
      } else {
        const newWords = words.slice();
        arrayMove(newWords, draggedElIndex, closestWordIndex);
        setWords(newWords);
        setDraggedElIndex(closestWordIndex);
        setPrevIndex(draggedElIndex);
      }
    }
  };

  return (
    <div
      className="flex flex-wrap"
      onDragStart={dragStartHandle}
      onDragEnd={onDragEndHandle}
      onDragOver={onDragOverHandle}
    >
      {words.map((word, index) => {
        return (
          <DraggableWord
            key={index}
            word={word}
            color={hint2color(wordHints(word, index))}
            isDragged={index == draggedElIndex}
            sendCoord={(p: Coordinate) => {
              var newCoord = coord;
              newCoord[index] = p;
              setCoord(newCoord);
            }}
          />
        );
      })}
    </div>
  );
};

// Inspired by [https://spin.atomicobject.com/collapse-component-react]
const Collapse: React.FC<React.PropsWithChildren<{ isExpanded: boolean }>> = ({
  isExpanded,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // TODO: do something about the magic constant
  useEffect(() => {
    if (ref.current) {
      setContentHeight(ref.current.clientHeight + 50);
    }
  }, [children]);

  // Thanks to [https://stackoverflow.com/a/69864970/8125485]
  return (
    <div
      className="overflow-hidden transition-all delay-150 duration-300"
      style={{
        height: isExpanded ? contentHeight : 0,
      }}
    >
      <div ref={ref}>{children}</div>
    </div>
  );
};

interface QuestionProp {
  sentence: string;
}

const Question: React.FC<QuestionProp> = ({ sentence }) => {
  return (
    <div className="flex w-full flex-row justify-normal border-b py-2">
      <div className="flex w-3/4 justify-center text-sm">{sentence}</div>
      <div className="flex w-1/4 justify-end">
        <button className="mx-2 h-10 rounded-md border bg-green-100 p-1">
          Yes
        </button>
        <button className="mx-2 h-10 rounded-md border bg-red-100 p-1">
          No
        </button>
      </div>
    </div>
  );
};

function App() {
  // English sentence that the user has to translate to German
  const [sentenceToTranslate, setSentenceToTranslate] = useState("");

  // TODO: remove the explicit init
  // The current solution
  const [currentSolution, setCurrentSolution] = useState<string[]>([
    "Brotvarianten",
    "für",
    "Küche",
    "Die",
    "und",
    "ist",
    "bekannt.",
    "ihre",
    "Wurstwaren",
    "deutsche",
  ]);

  //
  const [currentHints, setCurrentHints] = useState<Map<string, number>>(
    new Map(),
  );

  useEffect(() => {
    async function fetchProblem() {
      const translationProblem = await fetch("http://localhost:5174/main").then(
        (response) => response.json(),
      );
      setSentenceToTranslate(translationProblem.to_translate);

      // TODO: for now does not work. Have to manage state differently
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
    const result = await fetch("http://localhost:5174/main", {
      method: "POST",
      body: JSON.stringify({
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
          shuffledWords={currentSolution}
          reportWordsOrder={setCurrentSolution}
        />
      </div>
      <Collapse isExpanded={isExpanded}>
        <div className="mx-2 flex-col justify-center rounded-2xl border bg-white p-7 text-xl font-medium text-blue-900 shadow-xl">
          <Question
            sentence={
              "Is this sentence a valuable addition to vocabulary building for intermediate German learners?"
            }
          />
          <Question
            sentence={
              "Does knowing this sentence aid in daily German conversations?"
            }
          />
          <Question
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
