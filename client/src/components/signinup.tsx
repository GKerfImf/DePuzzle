import React from "react";
import { Button } from "@/components/ui/button";
import { SignInButton, SignUpButton, SignedOut } from "@clerk/clerk-react";

export default function SignInUpButtons() {
  return (
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
  );
}
