import React from 'react'
import { useState, useRef, useEffect } from 'react';
import './App.css';

interface Coordinate {
  x: number;
  y: number;
}

function distance(p1: Coordinate, p2: Coordinate): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function findClosestIndex(coord: Coordinate[], p: Coordinate): number | null {
  if (coord.length === 0) {
    return null;
  }

  let closestIndex = 0;
  let closestDistance = distance(coord[0], p);

  for (let i = 1; i < coord.length; i++) {
    const currentDistance = distance(coord[i], p);
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
  word: string,
  isDragged: boolean;
  sendCoord: (_: Coordinate) => void
}

const DraggableWord: React.FC<DraggableWordProps> = ({ word, isDragged, sendCoord }) => {
  const componentRef: React.RefObject<HTMLDivElement> = useRef(null);

  const getCenter = (div: DOMRect) => {
    return { x: (div.left + div.right) / 2, y: (div.bottom + div.top) / 2 };
  };

  useEffect(() => {
    sendCoord(getCenter(componentRef.current?.getBoundingClientRect()!));
  })

  return (
    <div
      draggable
      className={`draggable ${isDragged ? "dragging" : ""} m-2 p-3 border rounded-lg bg-blue-300`}
      ref={componentRef}
    >
      {word}
    </div>
  );
};



function App() {
  const [words, setWords] = useState<string[]>(["1", "2345678", "3", "4", "5", "6", "7", "1234567", "312", "3123123"]);
  const [coord, setCoord] = useState<Coordinate[]>(Array.from({ length: words.length }, (_) => { return { x: 0, y: 0 } }));

  const [draggedElIndex, setDraggedElIndex] = useState<number>(-1);
  const [prevIndex, setPrevIndex] = useState<number>(-1);

  return (
    <div className="bg-gray-100 p-8">
      <div className="flex flex-wrap"
        onDragStart={(event: React.DragEvent) => {
          const index = findClosestIndex(coord, { x: event.clientX, y: event.clientY })!
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
              closestWordIndex == prevIndex
              || draggedElIndex == prevIndex && draggedElIndex == closestWordIndex) {
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
              }} />
          );
        })}

      </div>
    </div >
  )
}
export default App