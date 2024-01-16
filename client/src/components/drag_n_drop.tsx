import React from "react";
import { useState } from "react";
import DraggableWord from "../DraggableWord";
import arrayMove from "../util/array_move";
import Coordinate from "../util/coordinate";
import Hint from "../util/hint";
import findClosestIndex from "../util/closest_index";
import { ProblemStatus } from "@/util/problem_status";

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

// TODO: can this be done with useContext?
// Based on the problem status, Sets the color for component borders
const getBorderColor = (puzzleStatus: ProblemStatus) => {
  switch (puzzleStatus) {
    case ProblemStatus.Solving:
      return "border";
    case ProblemStatus.Correct:
      return "border-2 border-green-500";
    case ProblemStatus.Incorrect:
      return "border-2 border-red-500";
  }
};

interface DragNDropAreaProps {
  setCurrentSolution: React.Dispatch<React.SetStateAction<string[]>>;
  getCurrentSolution: () => string[];
  wordHints: (word: string, index: number) => Hint;
  problemStatus: ProblemStatus;
}

const DragNDropArea: React.FC<DragNDropAreaProps> = ({
  setCurrentSolution,
  getCurrentSolution,
  wordHints,
  problemStatus,
}) => {
  const [coord, setCoord] = useState<Coordinate[]>(
    Array.from({ length: getCurrentSolution().length }, (_) => {
      return { x: 0, y: 0 };
    }),
  );

  const [draggedElIndex, setDraggedElIndex] = useState<number>(-1);
  const [prevIndex, setPrevIndex] = useState<number>(-1);

  const [clickedWordIndex, setClickedWordIndex] = useState<number | null>(null);

  const dragStartHandle = (event: React.DragEvent) => {
    const index = findClosestIndex(coord, {
      x: event.clientX,
      y: event.clientY,
    })!;
    setDraggedElIndex(index);
  };

  const onDragEndHandle = (_event: React.DragEvent) => {
    setDraggedElIndex(-1);
    setCurrentSolution(getCurrentSolution());
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
        const newWords = getCurrentSolution().slice();
        arrayMove(newWords, draggedElIndex, closestWordIndex);
        setCurrentSolution(newWords);
        setDraggedElIndex(closestWordIndex);
        setPrevIndex(draggedElIndex);
      }
    }
  };

  const onClickHandle = (event: React.MouseEvent) => {
    // TODO: Not ideal, but works ok. Improve in the future.
    //       One problem with this approach is that a click
    //       will highlight the word with the closest center
    //       to the click (not the words that is being clicked).
    // TODO: improve name
    const index = findClosestIndex(coord, {
      x: event.clientX,
      y: event.clientY,
    })!;

    if (clickedWordIndex == null) {
      setClickedWordIndex(index);
    } else if (clickedWordIndex == index) {
      setClickedWordIndex(null);
    } else {
      // TODO: move to a new function
      // Two different words
      const newWords = getCurrentSolution().slice();
      newWords[index] = getCurrentSolution()[clickedWordIndex];
      newWords[clickedWordIndex] = getCurrentSolution()[index];

      setCurrentSolution(newWords);
      setClickedWordIndex(null);
    }
  };

  return (
    <div
      className={`${getBorderColor(
        problemStatus,
      )} m-2 flex w-full justify-center rounded-2xl bg-white p-8 shadow-xl`}
    >
      <div
        className="flex flex-wrap"
        onDragStart={dragStartHandle}
        onDragEnd={onDragEndHandle}
        onDragOver={onDragOverHandle}
        onClick={onClickHandle}
      >
        {getCurrentSolution().map((word, index) => {
          return (
            <DraggableWord
              key={index}
              word={word}
              color={hint2color(wordHints(word, index))}
              isClicked={index == clickedWordIndex}
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
    </div>
  );
};

export default DragNDropArea;
