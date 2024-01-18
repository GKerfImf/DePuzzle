import React from "react";
import { useState } from "react";
import Hint from "../util/hint";
import arrayMove from "../util/array_move";
import Coordinate from "../util/coordinate";
import ProblemStatus from "../util/problem_status";
import findClosestIndex from "../util/closest_index";
import DraggableWord from "./draggable_word";
import { cn } from "@/lib/utils";

interface DragNDropAreaProps {
  puzzle: TPuzzle | null;
  setPuzzle: React.Dispatch<React.SetStateAction<TPuzzle | null>>;
  wordHints: (word: string, index: number) => Hint;
  problemStatus: ProblemStatus;
}

const DragNDropArea: React.FC<DragNDropAreaProps> = ({
  puzzle,
  setPuzzle,
  wordHints,
  problemStatus,
}) => {
  const currentSolution = puzzle ? puzzle!.shuffled_sentence.sentence : [];
  const setCurrentSolution = (newSolution: string[]) => {
    const newPuzzle: TPuzzle | null = puzzle
      ? {
          ...puzzle,
          shuffled_sentence: {
            ...puzzle?.shuffled_sentence,
            sentence: newSolution,
          },
        }
      : null;

    setPuzzle(newPuzzle);
  };
  const [coord, setCoord] = useState<Coordinate[]>(
    Array.from({ length: currentSolution.length }, (_) => {
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
    setCurrentSolution(currentSolution);
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
        const newWords = currentSolution.slice();
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
      const newWords = currentSolution.slice();
      newWords[index] = currentSolution[clickedWordIndex];
      newWords[clickedWordIndex] = currentSolution[index];

      setCurrentSolution(newWords);
      setClickedWordIndex(null);
    }
  };

  return (
    <div
      className={cn(
        "m-2 flex w-full justify-center rounded-2xl border bg-white p-8 shadow-xl",
        {
          "border-2 border-green-500": problemStatus == ProblemStatus.Correct,
          "border-2 border-red-500": problemStatus == ProblemStatus.Incorrect,
        },
      )}
    >
      <div
        className="flex flex-wrap"
        onDragStart={dragStartHandle}
        onDragEnd={onDragEndHandle}
        onDragOver={onDragOverHandle}
        onClick={onClickHandle}
      >
        {currentSolution.map((word, index) => {
          return (
            <DraggableWord
              key={index}
              word={word}
              hint={wordHints(word, index)}
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
