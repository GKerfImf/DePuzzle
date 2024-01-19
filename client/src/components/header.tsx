import React from "react";
import Elo from "./elo";
import Logo from "./logo";
import Profile from "./profile";

const Header: React.FC<{}> = ({}) => {
  return (
    <header className=" mb-6 flex w-screen items-center justify-between border-b p-3 ">
      <Logo />
      <div>
        <div className="flex items-center rounded-full border border-gray-400">
          <Elo />
          <Profile />
        </div>
      </div>
    </header>
  );
};

export default Header;
