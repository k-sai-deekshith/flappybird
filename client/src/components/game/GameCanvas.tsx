import { useEffect, useRef } from "react";
import Bird from "./Bird";
import Pipe from "./Pipe";
import { audioManager } from "./AudioManager";

const CANVAS_WIDTH = 480;
const CANVAS_HEIGHT = 640;

export type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_SETTINGS = {
  easy: {
    GRAVITY: 0.4,
    JUMP_FORCE: -7,
    PIPE_SPEED: 1.5,
    GAP_HEIGHT: 160,
    PIPE_SPACING: 220,
  },
  medium: {
    GRAVITY: 0.5,
    JUMP_FORCE: -8,
    PIPE_SPEED: 2,
    GAP_HEIGHT: 150,
    PIPE_SPACING: 200,
  },
  hard: {
    GRAVITY: 0.6,
    JUMP_FORCE: -8.5,
    PIPE_SPEED: 2.5,
    GAP_HEIGHT: 140,
    PIPE_SPACING: 180,
  },
};

const PIPE_WIDTH = 52;

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreChange: (score: number) => void;
  isPlaying: boolean;
  difficulty: Difficulty;
}

export default function GameCanvas({ onGameOver, onScoreChange, isPlaying, difficulty }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdRef = useRef<Bird | null>(null);
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);

  // Get difficulty settings
  const settings = DIFFICULTY_SETTINGS[difficulty];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bird = new Bird(CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2);
    birdRef.current = bird;

    const handleInput = () => {
      if (isPlaying && bird) {
        bird.velocity = settings.JUMP_FORCE;
        bird.addParticles('flap');
        audioManager.playSound('flap');
      }
    };

    canvas.addEventListener("click", handleInput);
    document.addEventListener("keydown", handleInput);

    return () => {
      canvas.removeEventListener("click", handleInput);
      document.removeEventListener("keydown", handleInput);
    };
  }, [isPlaying, settings.JUMP_FORCE]);

  useEffect(() => {
    if (!isPlaying) {
      birdRef.current = new Bird(CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2);
      pipesRef.current = [];
      scoreRef.current = 0;
      onScoreChange(0);
      audioManager.stopBackgroundMusic();
      return;
    }

    audioManager.startBackgroundMusic();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;

    const drawBackground = () => {
      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#87CEEB'); // Sky blue
      gradient.addColorStop(1, '#E6B980'); // Desert sand
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Desert mountains
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT - 200);
      for (let x = 0; x < CANVAS_WIDTH; x += 50) {
        ctx.lineTo(
          x,
          CANVAS_HEIGHT - 200 + Math.sin(x * 0.02) * 50
        );
      }
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.lineTo(0, CANVAS_HEIGHT);
      ctx.fill();

      // Ground
      ctx.fillStyle = '#DEB887';
      ctx.fillRect(0, CANVAS_HEIGHT - 112, CANVAS_WIDTH, 112);

      // Ground texture
      ctx.strokeStyle = '#8B4513';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, CANVAS_HEIGHT - 112);
        ctx.lineTo(x + 15, CANVAS_HEIGHT - 90);
        ctx.stroke();
      }
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      drawBackground();

      const bird = birdRef.current;
      if (!bird) return;

      bird.velocity += settings.GRAVITY;
      bird.y += bird.velocity;

      if (frameRef.current % 100 === 0) {
        const pipeY = Math.random() * (CANVAS_HEIGHT - settings.GAP_HEIGHT - 200) + 100;
        pipesRef.current.push(
          new Pipe(CANVAS_WIDTH, pipeY, PIPE_WIDTH, settings.GAP_HEIGHT)
        );
      }

      pipesRef.current = pipesRef.current.filter((pipe) => {
        pipe.x -= settings.PIPE_SPEED;
        pipe.draw(ctx);

        if (pipe.x + PIPE_WIDTH < bird.x && !pipe.passed) {
          pipe.passed = true;
          scoreRef.current++;
          onScoreChange(scoreRef.current);
          audioManager.playSound('point');
        }

        return pipe.x > -PIPE_WIDTH;
      });

      bird.draw(ctx);

      if (
        bird.y < 0 ||
        bird.y + bird.height > CANVAS_HEIGHT - 112 ||
        pipesRef.current.some((pipe) => pipe.collidesWith(bird))
      ) {
        bird.addParticles('hit');
        audioManager.playSound('hit');
        audioManager.stopBackgroundMusic();

        // Draw one last frame to show collision particles
        requestAnimationFrame(() => {
          bird.draw(ctx);
          cancelAnimationFrame(animationId);
          onGameOver(scoreRef.current);
        });
        return;
      }

      frameRef.current++;
      animationId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying, onGameOver, onScoreChange, settings]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="border shadow-lg rounded-lg"
    />
  );
}