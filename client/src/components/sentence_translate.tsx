import React from "react";

type SentenceToTranslateProps = {
  puzzle: TPuzzle | null;
};

export default function SentenceToTranslate({
  puzzle,
}: SentenceToTranslateProps) {
  return (
    <div className={`m-2 w-full rounded-2xl border bg-white shadow-xl`}>
      <p className="px-10 pb-6 pt-8 text-xl font-medium text-blue-900">
        {puzzle ? puzzle.translated_sentence.sentence : null}
      </p>
      {puzzle ? (
        <div className="flex w-full justify-between px-4 pb-2 font-mono text-xs text-gray-400">
          <p className="">Elo: {Math.floor(puzzle.rating.rating)}</p>
          <p className="">From: {puzzle.shuffled_sentence.taken_from}</p>
        </div>
      ) : null}
    </div>
  );
}
