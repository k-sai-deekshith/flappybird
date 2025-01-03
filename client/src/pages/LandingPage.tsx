import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import { useEffect } from "react";
import { audioManager } from "@/components/game/AudioManager";
import AuthPage from "./AuthPage";
import ProfileDropdown from "@/components/ProfileDropdown";
import GameInstructions from "@/components/GameInstructions";

export default function LandingPage() {
  const { user } = useUser();

  useEffect(() => {
    // Start background music when landing page loads
    audioManager.startBackgroundMusic();
    return () => audioManager.stopBackgroundMusic();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-400 to-sky-200">
        <main className="flex-grow flex flex-col items-center justify-center p-8">
          <div className="text-center mb-12">
            <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Wild West Flappy Bird
            </h1>
            <p className="text-xl text-white/90">
              Saddle up for an epic adventure!
            </p>
          </div>
          <AuthPage />
        </main>

        <footer className="w-full bg-black/10 backdrop-blur-sm py-4">
          <div className="container mx-auto px-4 text-center text-white/80">
            <p>© 2025 Wild West Flappy Bird. All rights reserved.</p>
            <p className="text-sm mt-1">Created with ❤️ by the Flappy Team</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-400 to-sky-200">
      <header className="w-full bg-black/10 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Wild West Flappy Bird</h1>
          <div className="flex items-center gap-2">
            <GameInstructions />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-8">
        <div className="max-w-4xl w-full space-y-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Welcome back, {user.username}!
            </h2>
            <p className="text-xl text-white/90">
              Ready to take on the Wild West?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Quick Play</CardTitle>
                <CardDescription>Jump right into the action</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/game">
                  <Button className="w-full text-lg py-6">
                    Start Game
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leaderboard</CardTitle>
                <CardDescription>See how you rank against others</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/leaderboard">
                  <Button variant="outline" className="w-full">
                    View Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="w-full bg-black/10 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center text-white/80">
          <p>© 2025 Wild West Flappy Bird. All rights reserved.</p>
          <p className="text-sm mt-1">Created with ❤️ by the Flappy Team</p>
        </div>
      </footer>
    </div>
  );
}