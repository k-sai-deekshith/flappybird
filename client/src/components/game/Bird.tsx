export default class Bird {
  x: number;
  y: number;
  width: number;
  height: number;
  velocity: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.width = 34;
    this.height = 24;
    this.velocity = 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#f4ce42";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}
