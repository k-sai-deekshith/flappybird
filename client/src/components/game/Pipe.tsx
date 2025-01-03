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
    ctx.fillStyle = "#2ecc71";
    // Top pipe
    ctx.fillRect(this.x, 0, this.width, this.y);
    // Bottom pipe
    ctx.fillRect(
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
