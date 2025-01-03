import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useUser } from "@/hooks/use-user";
import AuthPage from "./AuthPage";

export default function LandingPage() {
  const { user } = useUser();

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200 p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Wild West Flappy Bird
          </h1>
          <p className="text-xl text-white/90">
            Saddle up and navigate through the desert obstacles!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>How to Play</CardTitle>
              <CardDescription>Master these controls to become a legend</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Controls</h3>
                <p className="text-sm text-muted-foreground">
                  Click, tap, or press any key to make your bird flap upwards
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Scoring</h3>
                <p className="text-sm text-muted-foreground">
                  Pass through gaps between cacti to score points. Each successful pass earns you 1 point.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">Difficulty Levels</h3>
                <p className="text-sm text-muted-foreground">
                  Choose between Easy, Medium, or Hard mode to test your skills
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Ready to play, {user.username}!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <Link href="/game">
                  <Button className="w-full text-lg py-6">
                    Start Game
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button variant="outline" className="w-full">
                    View Leaderboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
