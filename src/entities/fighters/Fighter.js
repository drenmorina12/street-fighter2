export class Fighter {
  constructor({ name, position, velocity }) {
    this.name = name;
    this.image = new Image();
    this.frames = new Map();
    this.position = position;
    this.velocity = velocity;
    this.animationFrame = 1;
    this.animationTimer = 0;
  }

  update(time, ctx) {
    const [[, , width]] = this.frames.get(`forwards-${this.animationFrame}`);

    if (time.previous > this.animationTimer + 60) {
      this.animationTimer = time.previous;

      this.animationFrame++;
      if (this.animationFrame > 6) {
        this.animationFrame = 1;
      }
    }

    this.position.x += this.velocity.x * time.secondsPassed;

    if (this.position.x > ctx.canvas.width - width || this.position.x < 0) {
      this.velocity.x = -this.velocity.x;
    }
  }

  drawDebug(ctx) {
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(this.position.x - 5, this.position.y);
    ctx.lineTo(this.position.x + 4, this.position.y);
    ctx.moveTo(this.position.x, this.position.y - 5);
    ctx.lineTo(this.position.x, this.position.y + 4);
    ctx.stroke();
  }

  draw(ctx) {
    const [[x, y, width, height], [originX, originY]] = this.frames.get(
      `forwards-${this.animationFrame}`
    );

    ctx.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      this.position.x - originX,
      this.position.y - originY,
      width,
      height
    );

    this.drawDebug(ctx);
  }
}
