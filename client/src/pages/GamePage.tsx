import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import GameCanvas from "@/components/game/GameCanvas";
import { useGame } from "@/hooks/use-game";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function GamePage() {
  const { 
    score,
    gameOver,
    highScore,
    isPlaying,
    startGame,
    restartGame,
    handleGameOver
  } = useGame();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200">
      <div className="fixed top-4 right-4 flex gap-4">
        <Link href="/leaderboard">
          <Button variant="secondary">Leaderboard</Button>
        </Link>
      </div>

      <div className="relative">
        <GameCanvas onGameOver={handleGameOver} isPlaying={isPlaying} />
        {!isPlaying && !gameOver && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Button size="lg" onClick={startGame}>
              Start Game
            </Button>
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
            <p className="text-lg">Score: {score}</p>
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
