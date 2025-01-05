import { useEffect, useRef } from "react";
import Bird, { type BirdStyle } from "./Bird";
import Pipe from "./Pipe";
import { audioManager } from "./AudioManager";
import confetti from 'canvas-confetti';

const CANVAS_WIDTH = window.innerWidth;
const CANVAS_HEIGHT = window.innerHeight;

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

interface Cloud {
  x: number;
  y: number;
  width: number;
  speed: number;
}

interface Tumbleweed {
  x: number;
  y: number;
  rotation: number;
  speed: number;
  size: number;
}

interface DustParticle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
}

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreChange: (score: number) => void;
  isPlaying: boolean;
  difficulty: Difficulty;
  highScore: number;
  birdStyle: BirdStyle;
}

export default function GameCanvas({ 
  onGameOver, 
  onScoreChange, 
  isPlaying, 
  difficulty,
  highScore,
  birdStyle = 'cowboy'
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdRef = useRef<Bird | null>(null);
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);
  const cloudsRef = useRef<Cloud[]>([]);
  const tumbleweedsRef = useRef<Tumbleweed[]>([]);
  const dustParticlesRef = useRef<DustParticle[]>([]);

  // Get difficulty settings
  const settings = DIFFICULTY_SETTINGS[difficulty];

  // Effect to update bird style when it changes
  useEffect(() => {
    if (birdRef.current) {
      birdRef.current.setStyle(birdStyle);
    }
  }, [birdStyle]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bird = new Bird(CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2, birdStyle);
    birdRef.current = bird;

    cloudsRef.current = Array.from({ length: 3 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * (CANVAS_HEIGHT / 3),
      width: 60 + Math.random() * 40,
      speed: 0.2 + Math.random() * 0.3,
    }));

    tumbleweedsRef.current = Array.from({ length: 2 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: CANVAS_HEIGHT - 130 + Math.random() * 20,
      rotation: Math.random() * Math.PI * 2,
      speed: 1 + Math.random() * 2,
      size: 20 + Math.random() * 15,
    }));

    dustParticlesRef.current = Array.from({ length: 20 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: CANVAS_HEIGHT - 120 + Math.random() * 30,
      size: 1 + Math.random() * 2,
      speed: 0.5 + Math.random() * 1,
      opacity: 0.3 + Math.random() * 0.3,
    }));

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
  }, [isPlaying, settings.JUMP_FORCE, birdStyle]);

  useEffect(() => {
    if (!isPlaying) {
      birdRef.current = new Bird(CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2, birdStyle);
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

    const drawCloud = (cloud: Cloud) => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(cloud.x, cloud.y, cloud.width / 3, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.width / 4, cloud.y - 10, cloud.width / 4, 0, Math.PI * 2);
      ctx.arc(cloud.x + cloud.width / 2, cloud.y, cloud.width / 3, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawTumbleweed = (tumbleweed: Tumbleweed) => {
      ctx.save();
      ctx.translate(tumbleweed.x, tumbleweed.y);
      ctx.rotate(tumbleweed.rotation);
      ctx.fillStyle = '#D2B48C';
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.lineTo(
          Math.cos(angle) * tumbleweed.size,
          Math.sin(angle) * tumbleweed.size
        );
      }
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#A0522D';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.restore();
    };

    const drawDustParticle = (particle: DustParticle) => {
      ctx.fillStyle = `rgba(139, 69, 19, ${particle.opacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#FF6B6B');
      gradient.addColorStop(0.3, '#FFD93D');
      gradient.addColorStop(0.6, '#4D96FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#6B4423';
      ctx.beginPath();
      ctx.moveTo(-50, CANVAS_HEIGHT - 200);
      for (let x = -50; x <= CANVAS_WIDTH + 50; x += 100) {
        ctx.lineTo(
          x,
          CANVAS_HEIGHT - 200 + Math.sin(x * 0.015) * 70
        );
      }
      ctx.lineTo(CANVAS_WIDTH + 50, CANVAS_HEIGHT);
      ctx.lineTo(-50, CANVAS_HEIGHT);
      ctx.fill();

      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.moveTo(-50, CANVAS_HEIGHT - 150);
      for (let x = -50; x <= CANVAS_WIDTH + 50; x += 60) {
        ctx.lineTo(
          x,
          CANVAS_HEIGHT - 150 + Math.sin(x * 0.02) * 50
        );
      }
      ctx.lineTo(CANVAS_WIDTH + 50, CANVAS_HEIGHT);
      ctx.lineTo(-50, CANVAS_HEIGHT);
      ctx.fill();

      const groundGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT - 112, 0, CANVAS_HEIGHT);
      groundGradient.addColorStop(0, '#DAA520');
      groundGradient.addColorStop(1, '#CD853F');
      ctx.fillStyle = groundGradient;
      ctx.fillRect(0, CANVAS_HEIGHT - 112, CANVAS_WIDTH, 112);

      ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
      ctx.lineWidth = 2;
      for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, CANVAS_HEIGHT - 112);
        ctx.quadraticCurveTo(
          x + 20,
          CANVAS_HEIGHT - 90,
          x + 40,
          CANVAS_HEIGHT - 112
        );
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let x = 0; x < CANVAS_WIDTH; x += 100) {
        const time = Date.now() * 0.001;
        const y = CANVAS_HEIGHT - 130 + Math.sin(x * 0.02 + time) * 5;
        ctx.fillRect(x, y, 50, 2);
      }

      cloudsRef.current.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
          cloud.x = CANVAS_WIDTH;
          cloud.y = Math.random() * (CANVAS_HEIGHT / 3);
        }
        drawCloud(cloud);
      });

      tumbleweedsRef.current.forEach(tumbleweed => {
        tumbleweed.x -= tumbleweed.speed;
        tumbleweed.rotation += 0.1;
        if (tumbleweed.x + tumbleweed.size < 0) {
          tumbleweed.x = CANVAS_WIDTH + tumbleweed.size;
          tumbleweed.y = CANVAS_HEIGHT - 130 + Math.random() * 20;
        }
        drawTumbleweed(tumbleweed);
      });

      dustParticlesRef.current.forEach(particle => {
        particle.x -= particle.speed;
        if (particle.x + particle.size < 0) {
          particle.x = CANVAS_WIDTH;
          particle.y = CANVAS_HEIGHT - 120 + Math.random() * 30;
          particle.opacity = 0.3 + Math.random() * 0.3;
        }
        drawDustParticle(particle);
      });
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
          const newScore = scoreRef.current + 1;
          scoreRef.current = newScore;
          onScoreChange(newScore);
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

        const finalScore = scoreRef.current;
        requestAnimationFrame(() => {
          bird.draw(ctx);
          cancelAnimationFrame(animationId);
          onGameOver(finalScore);
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
  }, [isPlaying, onGameOver, onScoreChange, settings, highScore, birdStyle]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="fixed inset-0 w-full h-full"
    />
  );
}