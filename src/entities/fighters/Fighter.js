export class Fighter {
  constructor({ name, position, velocity }) {
    this.name = name;
    this.image = new Image();
    this.frames = new Map();
    this.position = position;
    this.velocity = velocity;
    this.animationFrame = 1;
  }

  update(time, ctx) {
    const [, , width] = this.frames.get(`forwards-${this.animationFrame}`);

    this.animationFrame++;
    if (this.animationFrame > 6) {
      this.animationFrame = 1;
    }

    this.position.x += this.velocity.x * time.secondsPassed;

    if (this.position.x > ctx.canvas.width - width || this.position.x < 0) {
      this.velocity.x = -this.velocity.x;
    }
  }

  draw(ctx) {
    const [x, y, width, height] = this.frames.get(
      `forwards-${this.animationFrame}`
    );

    ctx.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      this.position.x,
      this.position.y,
      width,
      height
    );
  }
}
