import React from "react";
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

export default function Header() {
  const { session } = useSession();

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
            <span className="mx-8 font-medium"> 1500 </span>
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
