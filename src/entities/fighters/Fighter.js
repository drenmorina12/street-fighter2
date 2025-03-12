import { FighterDirection } from "../../constants/fighter.js";
import { FighterState } from "../../constants/fighter.js";

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
    this.currentState = FighterState.WALK_FORWARDS;
    this.states = {
      [FighterState.WALK_FORWARDS]: {
        init: this.handleWalkForwardInit.bind(this),
        update: this.handleWalkForwardState.bind(this),
      },
      [FighterState.WALK_BACKWARDS]: {
        init: this.handleWalkBackwardsInit.bind(this),
        update: this.handleWalkBackwardsState.bind(this),
      },
    };
  }

  changeState(newState) {
    // this.velocity.x * this.direction < 0
    //   ? FighterState.WALK_BACKWARDS
    //   : FighterState.WALK_FORWARDS;

    this.currentState = newState;
    this.animationFrame = 0;

    this.states[this.currentState].init();
  }

  handleWalkForwardInit() {
    this.velocity.x = 100;
  }

  handleWalkForwardState() {}

  handleWalkBackwardsInit() {
    this.velocity.x = -100;
  }

  handleWalkBackwardsState() {}

  updateStageConstraints(ctx) {
    const WIDTH = 70;

    if (this.position.x > ctx.canvas.width - WIDTH / 2) {
      this.position.x = ctx.canvas.width - WIDTH / 2;
    }

    if (this.position.x < WIDTH / 2) {
      this.position.x = WIDTH / 2;
    }
  }

  update(time, ctx) {
    if (time.previous > this.animationTimer + 60) {
      this.animationTimer = time.previous;

      this.animationFrame++;
      if (this.animationFrame > 5) {
        this.animationFrame = 0;
      }
    }

    this.position.x += this.velocity.x * time.secondsPassed;

    this.states[this.currentState].update(time, ctx);
    this.updateStageConstraints(ctx);
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
      this.animations[this.currentState][this.animationFrame]
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
