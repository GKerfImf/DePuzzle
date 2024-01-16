import React from "react";
import { SignedIn } from "@clerk/clerk-react";
import Elo from "./elo";
import Logo from "./logo";
import Profile from "./profile";
import SignInUpButtons from "./signinup";

const Header: React.FC<{}> = ({}) => {
  return (
    <header className=" mb-6 flex w-screen items-center justify-between border-b p-3 ">
      <Logo />
      <div>
        <SignInUpButtons />
        <SignedIn>
          <div className="flex items-center rounded-full border border-gray-400">
            <Elo />
            <Profile />
          </div>
        </SignedIn>
      </div>
    </header>
  );
};

export default Header;
