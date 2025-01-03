import Bird from "./Bird";

export default class Pipe {
  x: number;
  y: number;
  width: number;
  gapHeight: number;
  passed: boolean;

  constructor(x: number, y: number, width: number, gapHeight: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.gapHeight = gapHeight;
    this.passed = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    // Draw wooden texture for pipes
    const drawWoodenPipe = (x: number, y: number, width: number, height: number) => {
      // Main pipe color
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(x, y, width, height);

      // Wood grain texture
      ctx.strokeStyle = '#6b3410';
      ctx.lineWidth = 2;
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(x, y + i);
        ctx.lineTo(x + width, y + i);
        ctx.stroke();
      }

      // Metal rim
      ctx.fillStyle = '#cd7f32';
      ctx.fillRect(x - 2, y, width + 4, 10);
      ctx.fillRect(x - 2, y + height - 10, width + 4, 10);

      // Rivet details
      ctx.fillStyle = '#a0522d';
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(x + width / 2, y + 5 + i * 5, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Top pipe
    drawWoodenPipe(this.x, 0, this.width, this.y);
    // Bottom pipe
    drawWoodenPipe(
      this.x,
      this.y + this.gapHeight,
      this.width,
      ctx.canvas.height - (this.y + this.gapHeight)
    );
  }

  collidesWith(bird: Bird) {
    return (
      bird.x < this.x + this.width &&
      bird.x + bird.width > this.x &&
      (bird.y < this.y || bird.y + bird.height > this.y + this.gapHeight)
    );
  }
}