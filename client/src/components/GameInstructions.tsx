import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function GameInstructions() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>How to Play Wild West Flappy Bird</DialogTitle>
          <DialogDescription>Master these controls to become a legend</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Controls</h3>
            <p className="text-muted-foreground">
              Click, tap, or press any key to make your bird flap upwards. Navigate through the desert obstacles by timing your flaps carefully.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Scoring</h3>
            <p className="text-muted-foreground">
              Pass through gaps between wooden posts to score points. Each successful pass earns you 1 point. Try to beat your high score!
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Difficulty Levels</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Easy: Slower obstacles and wider gaps - Perfect for beginners</li>
              <li>Medium: Balanced speed and gaps - The classic challenge</li>
              <li>Hard: Fast-moving obstacles and narrow gaps - For true cowboys!</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Western-themed graphics and animations</li>
              <li>Authentic western sound effects and background music</li>
              <li>Global leaderboard to compete with other players</li>
              <li>Particle effects and visual polish</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
