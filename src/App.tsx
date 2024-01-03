import React from "react";
import { useState, useRef, useEffect } from "react";

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

//
// https://gist.github.com/dev-thalizao/affaac253be5b5305e0faec3b650ba27
function zip<S1, S2>(
  firstCollection: Array<S1>,
  lastCollection: Array<S2>,
): Array<[S1, S2]> {
  const length = Math.min(firstCollection.length, lastCollection.length);
  const zipped: Array<[S1, S2]> = [];

  for (let index = 0; index < length; index++) {
    zipped.push([firstCollection[index], lastCollection[index]]);
  }

  return zipped;
}

function App() {
  // TODO: translated sentence received from server
  const inputSentence =
    "German cuisine is known for its sausages and bread varieties.";

  // TODO: for testing purposes, delete
  const inputSentenceDe =
    "Die deutsche Küche ist für ihre Wurstwaren und Brotvarianten bekannt.";

  // TODO: move to server part
  const shuffle = (array: string[]) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // TODO: for testing purposes, delete
  const correctWordOrder = inputSentenceDe.split(" ");

  // TODO: initial puzzle received from server
  const initialShuffledWords = shuffle(inputSentenceDe.split(" "));

  // Variables tracking the current solution
  const [currentWordsOrdering, setCurrentWordsOrdering] =
    useState<string[]>(initialShuffledWords);

  //
  const [currentHints, setCurrentHints] = useState<Map<string, number>>(
    new Map(),
  );

  const getHint = (word: string, index: number) => {
    if (currentHints.has(JSON.stringify({ word: word, index: index }))) {
      return currentHints.get(JSON.stringify({ word: word, index: index }))!;
    }
    return Hint.Unknown;
  };

  const submitOnClick = () => {
    const newHints = new Map([...currentHints]);

    zip(currentWordsOrdering, correctWordOrder).forEach(
      (word: [string, string], index: number) => {
        if (word[0] == word[1]) {
          newHints.set(
            JSON.stringify({ word: word[0], index: index }),
            Hint.Correct,
          );
        } else {
          newHints.set(
            JSON.stringify({ word: word[0], index: index }),
            Hint.Incorrect,
          );
        }
      },
    );
    setCurrentHints(newHints);
  };

  return (
    <div className="h-full w-full max-w-xl flex-col pt-10 font-mono">
      <div className="m-2 flex justify-center rounded-2xl border bg-white p-10 text-xl font-medium text-blue-900 shadow-xl">
        {inputSentence}
      </div>
      <div className="m-2 flex justify-center rounded-2xl border bg-white p-8 shadow-xl">
        <Puzzle
          wordHints={getHint}
          shuffledWords={initialShuffledWords}
          reportWordsOrder={setCurrentWordsOrdering}
        />
      </div>
      <div className="flex justify-end">
        <div>
          <button className="m-2 rounded-lg bg-indigo-500 p-2 text-white">
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
    </div>
  );
}

export default App;
