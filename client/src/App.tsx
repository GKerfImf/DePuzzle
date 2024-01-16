import React from "react";
import Header from "./components/header";
import Puzzle from "./components/puzzle";

function App() {
  return (
    <div className="felx flex-col justify-center font-mono">
      <Header />
      <Puzzle />
    </div>
  );
}

export default App;
