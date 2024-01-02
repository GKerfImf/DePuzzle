import React from "react";
import { useState, useRef, useEffect } from "react";

interface Coordinate {
  x: number;
  y: number;
}

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

function findClosestIndex(coord: Coordinate[], p: Coordinate): number | null {
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
  isDragged: boolean;
  sendCoord: (_: Coordinate) => void;
}

const DraggableWord: React.FC<DraggableWordProps> = ({
  word,
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
      className={`draggable
        mx-2 my-1 cursor-grab rounded-lg border bg-white px-2 py-1 shadow-lg
        ${isDragged ? "bg-gray-300 opacity-50" : ""}
      `}
      ref={componentRef}
    >
      {word}
    </div>
  );
};

function Game() {
  const [words, setWords] = useState<string[]>(
    "Die deutsche Küche ist für ihre Wurstwaren und Brotvarianten bekannt.".split(
      " ",
    ),
  );
  const [coord, setCoord] = useState<Coordinate[]>(
    Array.from({ length: words.length }, (_) => {
      return { x: 0, y: 0 };
    }),
  );

  const [draggedElIndex, setDraggedElIndex] = useState<number>(-1);
  const [prevIndex, setPrevIndex] = useState<number>(-1);

  return (
    <div
      className="flex flex-wrap"
      onDragStart={(event: React.DragEvent) => {
        const index = findClosestIndex(coord, {
          x: event.clientX,
          y: event.clientY,
        })!;
        setDraggedElIndex(index);
      }}
      onDragEnd={(_event: React.DragEvent) => {
        setDraggedElIndex(-1);
      }}
      onDragOver={(event: React.DragEvent) => {
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
      }}
    >
      {words.map((word, index) => {
        return (
          <DraggableWord
            key={index}
            word={word}
            isDragged={index == draggedElIndex}
            sendCoord={(p) => {
              var newCoord = coord;
              newCoord[index] = p;
              setCoord(newCoord);
            }}
          />
        );
      })}
    </div>
  );
}

function App() {
  return (
    <div className="h-full w-full max-w-xl flex-col pt-10 font-mono">
      <div className="m-2 flex justify-center rounded-2xl border bg-white shadow-xl">
        <div className="p-10 text-xl font-medium text-blue-900">
          German cuisine is known for its sausages and bread varieties.
        </div>
      </div>
      <div className="m-2 flex justify-center rounded-2xl border bg-white p-8 shadow-xl">
        <Game />
      </div>
      <div className="flex justify-end">
        <div>
          <button className="m-2 rounded-lg bg-indigo-500 p-2 text-white">
            Give up
          </button>
          <button className="m-2 rounded-lg bg-indigo-500 p-2 text-white">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
export default App;
