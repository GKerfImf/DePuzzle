import React from "react";
import { ProblemStatus } from "../util/problem_status";

interface ControlButtonsProps {
  puzzleStatus: ProblemStatus;
  giveUpOnClick: () => void;
  submitOnClick: () => void;
  nextProblemOnClick: () => void;
}

export default function ControlButtons({
  puzzleStatus,
  giveUpOnClick,
  submitOnClick,
  nextProblemOnClick,
}: ControlButtonsProps) {
  return (
    <div className="flex w-full justify-end">
      {puzzleStatus == ProblemStatus.Solving
        ? [
            <button
              id={"GiveUpButton"}
              className="m-2 rounded-lg bg-indigo-500 p-2 text-white"
              onClick={giveUpOnClick}
            >
              Give up
            </button>,
            <button
              id={"SubmitButton"}
              className="m-2 rounded-lg bg-indigo-500 p-2 text-white"
              onClick={submitOnClick}
            >
              Submit
            </button>,
          ]
        : null}
      {puzzleStatus != ProblemStatus.Solving
        ? [
            <button
              id={"NextProblemButton"}
              className="m-2 rounded-lg bg-indigo-500 p-2 text-white"
              onClick={nextProblemOnClick}
            >
              Next Problem
            </button>,
          ]
        : null}
    </div>
  );
}
