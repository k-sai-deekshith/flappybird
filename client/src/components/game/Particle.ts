export type ParticleConfig = {
  x: number;
  y: number;
  color: string;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
};

export default class Particle {
  private x: number;
  private y: number;
  private color: string;
  private size: number;
  private speedX: number;
  private speedY: number;
  private life: number;
  private opacity: number;

  constructor({ x, y, color, size, speedX, speedY, life }: ParticleConfig) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.speedX = speedX;
    this.speedY = speedY;
    this.life = life;
    this.opacity = 1;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.1; // Gravity effect
    this.life--;
    this.opacity = this.life / 60; // Fade out
    return this.life > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
