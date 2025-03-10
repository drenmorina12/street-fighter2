export class Fighter {
  constructor({ name, position, velocity }) {
    this.name = name;
    this.image = new Image();
    this.position = position;
    this.velocity = velocity;
  }

  update(secondsPassed, ctx) {
    this.position.x += this.velocity.x * secondsPassed;

    if (
      this.position.x > ctx.canvas.width - this.image.width ||
      this.position.x < 0
    ) {
      this.velocity.x = -this.velocity.x;
    }
  }

  draw(ctx) {
    ctx.drawImage(this.image, this.position.x, this.position.y);
  }
}
