import React from "react";
import { useRef, useEffect } from "react";
import Coordinate from "@/util/coordinate";
import { cn } from "@/lib/utils";
import Hint from "@/util/hint";

interface DraggableWordProps {
  word: string;
  hint: Hint;
  isDragged: boolean;
  isClicked: boolean;
  sendCoord: (_: Coordinate) => void;
}

const DraggableWord: React.FC<DraggableWordProps> = ({
  word,
  hint,
  isDragged,
  isClicked,
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
      className={cn(
        `draggable mx-2 my-1 cursor-grab rounded-lg px-2 py-1 shadow-lg`,
        {
          "shadow-cyan-500/50": isClicked,
          "opacity-50": isDragged,
        },
        {
          "border-2 border-green-500 bg-green-50": hint == Hint.Correct,
          "border bg-white": hint == Hint.Unknown,
          "border-2 border-red-500 bg-red-50": hint == Hint.Incorrect,
        },
      )}
      ref={componentRef}
    >
      {word}
    </div>
  );
};

export default DraggableWord;
