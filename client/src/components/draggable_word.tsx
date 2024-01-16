import React from "react";
import { useRef, useEffect } from "react";
import Coordinate from "../util/coordinate";

interface DraggableWordProps {
  word: string;
  color: string;
  isDragged: boolean;
  isClicked: boolean;
  sendCoord: (_: Coordinate) => void;
}

const DraggableWord: React.FC<DraggableWordProps> = ({
  word,
  color,
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
      className={`draggable mx-2 my-1 cursor-grab rounded-lg px-2 py-1 shadow-lg
                    ${color}
                    ${isClicked ? "shadow-lg shadow-cyan-500/50" : ""}
                    ${isDragged ? "bg-gray-300 opacity-50" : ""} `}
      ref={componentRef}
    >
      {word}
    </div>
  );
};

export default DraggableWord;
