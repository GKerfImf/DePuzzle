import React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SignInButton,
  SignUpButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  useSession,
} from "@clerk/clerk-react";

const API_SERV = "https://de-puzzle-api.vercel.app";
// const API_SERV = "http://localhost:5174";

export default function Header() {
  const { session, isSignedIn, isLoaded } = useSession();
  const [userElo, setUserElo] = useState("");

  // TODO: there is a problem with the case when the user does not exist, but
  // this effect runs before [/say-hi]
  useEffect(() => {
    const setElo = async () => {
      const response = await fetch(`${API_SERV}/user-elo`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await session!.getToken()}`,
        },
      }).then((response) => response.json());
      setUserElo(response);
    };
    if (isLoaded && isSignedIn) {
      setElo();
    }
  });

  return (
    <header className=" mb-6 flex w-screen items-center justify-between border-b p-3 ">
      <span className="text-2xl">DePuzzle</span>

      <div className="">
        <SignedOut>
          <SignInButton>
            <Button className="mx-1" variant="outline">
              Sign In
            </Button>
          </SignInButton>
          <SignUpButton>
            <Button className="mx-1" variant="outline">
              Sign Up
            </Button>
          </SignUpButton>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center rounded-full border border-gray-400">
            <span className="mx-8 font-medium">
              {" "}
              {Math.floor(Number(userElo))}{" "}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar>
                  <AvatarImage
                    src={`${session ? session.user.imageUrl : ""}`}
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-gray-200">
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <SignOutButton>Sign out</SignOutButton>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SignedIn>
      </div>
    </header>
  );
}
