import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import GameCanvas, { type Difficulty } from "@/components/game/GameCanvas";
import { useGame } from "@/hooks/use-game";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200">
      <div className="fixed top-4 right-4 flex gap-4">
        <Link href="/leaderboard">
          <Button variant="secondary">Leaderboard</Button>
        </Link>
      </div>

      <div className="relative">
        <GameCanvas 
          onGameOver={handleGameOver} 
          onScoreChange={setScore}
          isPlaying={isPlaying} 
          difficulty={difficulty}
        />
        {!isPlaying && !gameOver && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background/95 p-6 rounded-lg shadow-lg backdrop-blur">
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
        )}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-white drop-shadow-md">
          {score}
        </div>
      </div>

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