import { FighterDirection } from "../../constants/fighter.js";

export class Fighter {
  constructor({ name, position, direction }) {
    this.name = name;
    this.image = new Image();
    this.frames = new Map();
    this.position = position;
    this.direction = direction;
    this.velocity = { x: 150 * direction, y: 0 };
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.animations = {};
    this.state = this.changeState();
  }

  changeState = () =>
    this.velocity.x * this.direction < 0 ? "walkBackwards" : "walkForwards";

  update(time, ctx) {
    const [[, , width]] = this.frames.get(
      this.animations[this.state][this.animationFrame]
    );

    if (time.previous > this.animationTimer + 60) {
      this.animationTimer = time.previous;

      this.animationFrame++;
      if (this.animationFrame > 5) {
        this.animationFrame = 0;
      }
    }

    this.position.x += this.velocity.x * time.secondsPassed;

    if (this.position.x > ctx.canvas.width - width / 2) {
      this.velocity.x = -100;
      this.state = this.changeState();
    }

    if (this.position.x < width / 2) {
      this.velocity.x = 100;
      this.state = this.changeState();
    }
  }

  drawDebug(ctx) {
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.strokeStyle = "white";
    ctx.moveTo(Math.floor(this.position.x) - 4.5, Math.floor(this.position.y));
    ctx.lineTo(Math.floor(this.position.x) + 4.5, Math.floor(this.position.y));
    ctx.moveTo(Math.floor(this.position.x), Math.floor(this.position.y) - 4.5);
    ctx.lineTo(Math.floor(this.position.x), Math.floor(this.position.y) + 4.5);
    ctx.stroke();
  }

  draw(ctx) {
    const [[x, y, width, height], [originX, originY]] = this.frames.get(
      this.animations[this.state][this.animationFrame]
    );

    ctx.scale(this.direction, 1);
    ctx.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      Math.floor(this.position.x * this.direction) - originX,
      Math.floor(this.position.y) - originY,
      width,
      height
    );
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    this.drawDebug(ctx);
  }
}
