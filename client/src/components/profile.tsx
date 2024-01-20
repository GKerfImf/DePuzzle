import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Cookies from "js-cookie";
import Avatar, { genConfig } from "react-nice-avatar";
import { generateCookie } from "@/util/cookie";

export default function Profile() {
  const [config, setConfig] = useState(
    genConfig(generateCookie("visitor_avatar")),
  );

  const changeAvatar = () => {
    Cookies.remove("visitor_avatar");
    setConfig(genConfig(generateCookie("visitor_avatar")));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <Avatar className="h-10 w-10" {...config} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={changeAvatar}>
          Change avatar
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="text-gray-300">
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem disabled className="text-gray-300">
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
