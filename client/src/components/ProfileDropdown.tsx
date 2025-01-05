import { useUser } from "@/hooks/use-user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { LogOut, Medal, Palette } from "lucide-react";
import { useState } from "react";
import AvatarSelector from "./game/AvatarSelector";

export default function ProfileDropdown() {
  const { user, logout } = useUser();
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar>
              <AvatarFallback>
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuItem 
            className="flex items-center"
            onClick={() => setShowAvatarSelector(true)}
          >
            <Palette className="mr-2 h-4 w-4" />
            <span>Change Bird Style</span>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/leaderboard" className="flex items-center">
              <Medal className="mr-2 h-4 w-4" />
              <span>My Scores</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600" 
            onClick={() => logout()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AvatarSelector 
        open={showAvatarSelector} 
        onOpenChange={setShowAvatarSelector}
        currentStyle={user.avatar}
      />
    </>
  );
}