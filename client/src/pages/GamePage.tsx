import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import GameCanvas, { type Difficulty } from "@/components/game/GameCanvas";
import { useGame } from "@/hooks/use-game";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import GameInstructions from "@/components/GameInstructions";
import ProfileDropdown from "@/components/ProfileDropdown";

export default function GamePage() {
  const { 
    score,
    setScore,
    gameOver,
    highScore,
    finalScore,
    isPlaying,
    startGame,
    restartGame,
    handleGameOver
  } = useGame();

  const [difficulty, setDifficulty] = useState<Difficulty>('medium');

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-sky-400 to-sky-200">
      {/* Header */}
      <header className="w-full bg-black/10 backdrop-blur-sm py-4 z-20">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Wild West Flappy Bird</h1>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="secondary">Back to Menu</Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="secondary">Leaderboard</Button>
            </Link>
            <GameInstructions />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Game Canvas Container */}
      <div className="flex-grow relative">
        <GameCanvas 
          onGameOver={handleGameOver} 
          onScoreChange={setScore}
          isPlaying={isPlaying} 
          difficulty={difficulty}
        />

        {!isPlaying && !gameOver && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="bg-background/95 p-6 rounded-lg shadow-lg backdrop-blur">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold mb-4">Select Difficulty</h2>
                  <RadioGroup
                    defaultValue={difficulty}
                    onValueChange={(value) => setDifficulty(value as Difficulty)}
                    className="flex flex-col space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" />
                      <Label htmlFor="easy">Easy</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium">Medium</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hard" id="hard" />
                      <Label htmlFor="hard">Hard</Label>
                    </div>
                  </RadioGroup>
                </div>
                <Button size="lg" onClick={startGame} className="w-full">
                  Start Game
                </Button>
              </div>
            </div>
          </div>
        )}

        {isPlaying && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-white drop-shadow-md z-10">
            {score}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="w-full bg-black/10 backdrop-blur-sm py-4 z-20">
        <div className="container mx-auto px-4 text-center text-white/80">
          <p>© 2025 Wild West Flappy Bird. All rights reserved.</p>
          <p className="text-sm mt-1">Created with ❤️ by the Flappy Team</p>
        </div>
      </footer>

      <Dialog open={gameOver} onOpenChange={(open) => !open && restartGame()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Over!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-lg">Score: {finalScore}</p>
            <p className="text-sm text-muted-foreground">High Score: {highScore}</p>
            <div className="flex justify-end space-x-2">
              <Button onClick={restartGame}>Play Again</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}