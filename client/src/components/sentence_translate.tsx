import React from "react";

type SentenceToTranslateProps = {
  sentenceToTranslate: string;
  puzzleElo: string;
  puzzleFrom: string;
};

export default function SentenceToTranslate({
  sentenceToTranslate,
  puzzleElo,
  puzzleFrom,
}: SentenceToTranslateProps) {
  return (
    <div className={`m-2 w-full rounded-2xl border bg-white shadow-xl`}>
      <p className="px-10 pb-6 pt-8 text-xl font-medium text-blue-900">
        {sentenceToTranslate}
      </p>
      <div className="flex w-full justify-between px-4 pb-2 font-mono text-xs text-gray-400">
        <p className="">Elo: {Math.floor(Number(puzzleElo))}</p>
        <p className="">From: {puzzleFrom}</p>
      </div>
    </div>
  );
}
