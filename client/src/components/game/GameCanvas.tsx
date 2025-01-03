import { useEffect, useRef } from "react";
import Bird from "./Bird";
import Pipe from "./Pipe";
import { audioManager } from "./AudioManager";

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const PIPE_SPACING = 200;
const PIPE_WIDTH = 52;
const GAP_HEIGHT = 150;

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  isPlaying: boolean;
}

export default function GameCanvas({ onGameOver, isPlaying }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdRef = useRef<Bird | null>(null);
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bird = new Bird(CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2);
    birdRef.current = bird;

    const handleInput = () => {
      if (isPlaying && bird) {
        bird.velocity = JUMP_FORCE;
        audioManager.playSound('flap');
      }
    };

    canvas.addEventListener("click", handleInput);
    document.addEventListener("keydown", handleInput);

    return () => {
      canvas.removeEventListener("click", handleInput);
      document.removeEventListener("keydown", handleInput);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      birdRef.current = new Bird(CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2);
      pipesRef.current = [];
      scoreRef.current = 0;
      audioManager.stopBackgroundMusic();
      return;
    }

    // Start background music when game starts
    audioManager.startBackgroundMusic();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const gameLoop = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background
      ctx.fillStyle = "#70c5ce";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Ground
      ctx.fillStyle = "#ded895";
      ctx.fillRect(0, CANVAS_HEIGHT - 112, CANVAS_WIDTH, 112);

      const bird = birdRef.current;
      if (!bird) return;

      // Update bird
      bird.velocity += GRAVITY;
      bird.y += bird.velocity;

      // Generate pipes
      if (frameRef.current % 100 === 0) {
        const pipeY = Math.random() * (CANVAS_HEIGHT - GAP_HEIGHT - 200) + 100;
        pipesRef.current.push(
          new Pipe(CANVAS_WIDTH, pipeY, PIPE_WIDTH, GAP_HEIGHT)
        );
      }

      // Update and draw pipes
      pipesRef.current = pipesRef.current.filter((pipe) => {
        pipe.x -= 2;
        pipe.draw(ctx);

        // Score when passing pipe
        if (pipe.x + PIPE_WIDTH < bird.x && !pipe.passed) {
          pipe.passed = true;
          scoreRef.current++;
          audioManager.playSound('point');
        }

        return pipe.x > -PIPE_WIDTH;
      });

      // Draw bird
      bird.draw(ctx);

      // Collision detection
      if (
        bird.y < 0 ||
        bird.y + bird.height > CANVAS_HEIGHT - 112 ||
        pipesRef.current.some((pipe) => pipe.collidesWith(bird))
      ) {
        audioManager.playSound('hit');
        audioManager.stopBackgroundMusic();
        cancelAnimationFrame(animationId);
        onGameOver(scoreRef.current);
        return;
      }

      frameRef.current++;
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, onGameOver]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="border shadow-lg"
    />
  );
}