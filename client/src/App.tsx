import React, { useState } from "react";
import Header from "./components/header";
import Puzzle from "./components/puzzle";
import ProblemStatus from "./util/problem_status";
import ProblemStatusContext from "./contexts/problem_status";

function App() {
  const [problemStatus, setProblemStatus] = useState<ProblemStatus>(
    ProblemStatus.Solving,
  );
  const [numberOfTries, setNumberOfTries] = useState<number>(0);
  const updateProblemStatus = (problemStatus: ProblemStatus) => {
    setNumberOfTries((prev) => prev + 1);
    setProblemStatus(problemStatus);
    if (problemStatus != ProblemStatus.Solving) {
      setNumberOfTries(0);
    }
  };

  return (
    <ProblemStatusContext.Provider
      value={{ numberOfTries, problemStatus, updateProblemStatus }}
    >
      <div className="felx flex-col justify-center font-mono">
        <Header />
        <Puzzle />
      </div>
    </ProblemStatusContext.Provider>
  );
}

export default App;
