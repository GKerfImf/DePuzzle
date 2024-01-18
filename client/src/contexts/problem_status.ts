import { createContext } from "react";
import ProblemStatus from "../util/problem_status";

type TProblemStatusContext = {
  numberOfTries: number;
  problemStatus: ProblemStatus;
  updateProblemStatus: (_: ProblemStatus) => void;
};
const ProblemStatusContext = createContext<TProblemStatusContext | null>(null);

export default ProblemStatusContext;
