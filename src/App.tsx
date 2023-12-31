import { useState } from 'react';
import { DropResult, ResponderProvided, DragDropContext, Droppable, DroppableProvided, Draggable, DraggableProvided } from 'react-beautiful-dnd';

import './App.css';




function App() {
  const [words, setWords] = useState<string[]>(["1", "4", "3", "2", "55", "22", "12", "32123", "34", "1313"]);

  const handgeDragDrop = (result: DropResult, _provided: ResponderProvided) => {
    const { source, destination, type } = result;

    if (destination == null) {
      return;
    }

    if (
      source.droppableId == destination!.droppableId
      && source.index == destination!.index
    ) {
      return;
    }

    if (type == "group") {
      const reorderedWords = [...words];
      const sourceInd = source.index;
      const destinationInd = destination!.index;
      const [reorderedWord] = reorderedWords.splice(sourceInd, 1);
      reorderedWords.splice(destinationInd, 0, reorderedWord);
      setWords(reorderedWords);
    }
  }

  return (
    <div className="relative bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10 flex flex-wrap">
      <DragDropContext onDragEnd={handgeDragDrop}>
        <Droppable droppableId="ROOT" type="group" direction="horizontal">
          {(provided: DroppableProvided) => {
            return (
              <div className="flex flex-wrap" {...provided.droppableProps} ref={provided.innerRef}>
                {words.map((word: string, index: number) => {
                  return (
                    <Draggable draggableId={word} key={word} index={index}>
                      {(provided: DraggableProvided) => {
                        return (
                          <div className="m-2 p-3 border rounded-lg border-2 bg-blue-200"
                            {...provided.dragHandleProps}
                            {...provided.draggableProps}
                            ref={provided.innerRef}
                          >
                            {word}
                          </div>
                        );
                      }}
                    </Draggable>
                  )
                })}
                {provided.placeholder}
              </div>
            )
          }}
        </Droppable>
      </DragDropContext>
    </div >
  )
}
export default App
