import React from "react";

interface QuestionProp {
  sentence: string;
}

const Questions: React.FC<QuestionProp> = ({ sentence }) => {
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

export default Questions;
