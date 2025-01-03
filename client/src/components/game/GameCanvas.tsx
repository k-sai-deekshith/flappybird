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
}

export default function GameCanvas({ onGameOver, onScoreChange, isPlaying, difficulty }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const birdRef = useRef<Bird | null>(null);
  const pipesRef = useRef<Pipe[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);
  const bgOffsetRef = useRef(0);
  const mountainsOffsetRef = useRef(0);
  const cloudsRef = useRef<Cloud[]>([]);
  const tumbleweedsRef = useRef<Tumbleweed[]>([]);
  const dustParticlesRef = useRef<DustParticle[]>([]);

  // Get difficulty settings
  const settings = DIFFICULTY_SETTINGS[difficulty];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bird = new Bird(CANVAS_WIDTH / 3, CANVAS_HEIGHT / 2);
    birdRef.current = bird;

    // Initialize background elements
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
      ctx.fillStyle = '#8B4513';
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
      ctx.restore();
    };

    const drawDustParticle = (particle: DustParticle) => {
      ctx.fillStyle = `rgba(139, 69, 19, ${particle.opacity})`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBackground = () => {
      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#87CEEB'); // Sky blue
      gradient.addColorStop(1, '#E6B980'); // Desert sand
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Clouds
      cloudsRef.current.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
          cloud.x = CANVAS_WIDTH;
          cloud.y = Math.random() * (CANVAS_HEIGHT / 3);
        }
        drawCloud(cloud);
      });

      // Desert mountains with parallax
      ctx.fillStyle = '#8B4513';
      ctx.beginPath();
      ctx.moveTo(0, CANVAS_HEIGHT - 200);

      // Far mountains (slower movement)
      for (let x = 0; x < CANVAS_WIDTH; x += 50) {
        const offsetX = (x + mountainsOffsetRef.current * 0.5) % CANVAS_WIDTH;
        ctx.lineTo(
          offsetX,
          CANVAS_HEIGHT - 200 + Math.sin(x * 0.02) * 50
        );
      }

      // Close the mountain shape
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.lineTo(0, CANVAS_HEIGHT);
      ctx.fill();

      // Ground with parallax
      const groundPattern = ctx.createPattern(createGroundTexture(ctx), 'repeat');
      if (groundPattern) {
        ctx.fillStyle = groundPattern;
        ctx.save();
        ctx.translate(-bgOffsetRef.current, 0);
        ctx.fillRect(0, CANVAS_HEIGHT - 112, CANVAS_WIDTH * 2, 112);
        ctx.restore();
      }

      // Tumbleweeds
      tumbleweedsRef.current.forEach(tumbleweed => {
        tumbleweed.x -= tumbleweed.speed;
        tumbleweed.rotation += 0.1;
        if (tumbleweed.x + tumbleweed.size < 0) {
          tumbleweed.x = CANVAS_WIDTH + tumbleweed.size;
          tumbleweed.y = CANVAS_HEIGHT - 130 + Math.random() * 20;
        }
        drawTumbleweed(tumbleweed);
      });

      // Dust particles
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

    const createGroundTexture = (ctx: CanvasRenderingContext2D) => {
      const textureCanvas = document.createElement('canvas');
      textureCanvas.width = 60;
      textureCanvas.height = 112;
      const textureCtx = textureCanvas.getContext('2d');
      if (!textureCtx) return textureCanvas;

      // Base color
      textureCtx.fillStyle = '#DEB887';
      textureCtx.fillRect(0, 0, 60, 112);

      // Texture lines
      textureCtx.strokeStyle = '#8B4513';
      textureCtx.lineWidth = 1;
      for (let y = 0; y < 112; y += 15) {
        textureCtx.beginPath();
        textureCtx.moveTo(0, y);
        textureCtx.lineTo(30, y + 10);
        textureCtx.stroke();
      }

      return textureCanvas;
    };

    const gameLoop = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Update background offsets
      bgOffsetRef.current = (bgOffsetRef.current + settings.PIPE_SPEED) % 60;
      mountainsOffsetRef.current = (mountainsOffsetRef.current + settings.PIPE_SPEED * 0.5) % CANVAS_WIDTH;

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