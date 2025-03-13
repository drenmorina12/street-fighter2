import { FighterDirection } from "../../constants/fighter.js";
import { FighterState } from "../../constants/fighter.js";
import { STAGE_FLOOR } from "../../constants/stage.js";

export class Fighter {
  constructor({ name, position, direction }) {
    this.name = name;
    this.position = position;
    this.velocity = { x: 0, y: 0 };
    this.initialVelocity = {};
    this.direction = direction;
    this.gravity = 0;

    this.frames = new Map();
    this.animationFrame = 0;
    this.animationTimer = 0;
    this.animations = {};

    this.image = new Image();

    this.states = {
      [FighterState.IDLE]: {
        init: this.handleIdleInit.bind(this),
        update: this.handleIdleState.bind(this),
      },
      [FighterState.WALK_FORWARDS]: {
        init: this.handleWalkForwardInit.bind(this),
        update: this.handleWalkForwardState.bind(this),
      },
      [FighterState.WALK_BACKWARDS]: {
        init: this.handleWalkBackwardsInit.bind(this),
        update: this.handleWalkBackwardsState.bind(this),
      },
      [FighterState.JUMP_UP]: {
        init: this.handleJumpUpInit.bind(this),
        update: this.handleJumpUpState.bind(this),
      },
    };

    this.changeState(FighterState.IDLE);
  }

  changeState(newState) {
    this.currentState = newState;
    this.animationFrame = 0;

    this.states[this.currentState].init();
  }

  handleIdleInit() {
    this.velocity.x = 0;
    this.velocity.y = 0;
  }

  handleIdleState() {}

  handleWalkForwardInit() {
    this.velocity.x = 150 * this.direction;
  }

  handleWalkForwardState() {}

  handleWalkBackwardsInit() {
    this.velocity.x = -150 * this.direction;
  }

  handleWalkBackwardsState() {}

  handleJumpUpInit() {
    this.velocity.y = this.initialVelocity.jump;
  }

  handleJumpUpState(time) {
    this.velocity.y += this.gravity * time.secondsPassed;

    if (this.position.y > STAGE_FLOOR) {
      this.position.y = STAGE_FLOOR;
      this.changeState(FighterState.IDLE);
    }
  }

  updateStageConstraints(ctx) {
    const WIDTH = 70;

    if (this.position.x > ctx.canvas.width - WIDTH / 2) {
      this.position.x = ctx.canvas.width - WIDTH / 2;
    }

    if (this.position.x < WIDTH / 2) {
      this.position.x = WIDTH / 2;
    }
  }

  updateAnimation(time) {
    if (time.previous > this.animationTimer + 60) {
      this.animationTimer = time.previous;

      this.animationFrame++;
      if (this.animationFrame >= this.animations[this.currentState].length) {
        this.animationFrame = 0;
      }
    }
  }

  update(time, ctx) {
    this.position.x += this.velocity.x * time.secondsPassed;
    this.position.y += this.velocity.y * time.secondsPassed;

    this.states[this.currentState].update(time, ctx);
    this.updateAnimation(time);
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
