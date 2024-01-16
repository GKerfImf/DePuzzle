import React from "react";
import logo from "./../assets/germany3.png";

export default function Logo() {
  return (
    <div className="flex items-center ">
      <img src={logo} alt="Logo" className=" mr-4 w-10" />
      <span className="text-2xl">DePuzzle</span>
    </div>
  );
}
