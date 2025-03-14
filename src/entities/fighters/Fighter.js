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
        update: () => {},
        validFrom: [
          undefined,
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
          FighterState.JUMP_UP,
          FighterState.JUMP_FORWARDS,
          FighterState.JUMP_BACKWARDS,
          FighterState.CROUCH_UP,
        ],
      },
      [FighterState.WALK_FORWARDS]: {
        init: this.handleMoveInit.bind(this),
        update: () => {},
        validFrom: [FighterState.IDLE, FighterState.WALK_BACKWARDS],
      },
      [FighterState.WALK_BACKWARDS]: {
        init: this.handleMoveInit.bind(this),
        update: () => {},
        validFrom: [FighterState.IDLE, FighterState.WALK_FORWARDS],
      },
      [FighterState.JUMP_UP]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FighterState.IDLE],
      },
      [FighterState.JUMP_FORWARDS]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FighterState.IDLE, FighterState.WALK_FORWARDS],
      },
      [FighterState.JUMP_BACKWARDS]: {
        init: this.handleJumpInit.bind(this),
        update: this.handleJumpState.bind(this),
        validFrom: [FighterState.IDLE, FighterState.WALK_BACKWARDS],
      },
      [FighterState.CROUCH]: {
        init: () => {},
        update: () => {},
        validFrom: [FighterState.CROUCH_DOWN],
      },
      [FighterState.CROUCH_DOWN]: {
        init: () => {},
        update: this.handleCrouchDownState.bind(this),
        validFrom: [
          FighterState.IDLE,
          FighterState.WALK_FORWARDS,
          FighterState.WALK_BACKWARDS,
        ],
      },
      [FighterState.CROUCH_UP]: {
        init: () => {},
        update: this.handleCrouchUpState.bind(this),
        validFrom: [FighterState.CROUCH],
      },
    };

    this.changeState(FighterState.IDLE);
  }

  changeState(newState) {
    if (
      newState === this.currentState ||
      !this.states[newState].validFrom.includes(this.currentState)
    ) {
      return;
    }

    this.currentState = newState;
    this.animationFrame = 0;

    this.states[this.currentState].init();
  }

  handleIdleInit() {
    this.velocity.x = 0;
    this.velocity.y = 0;
  }

  handleMoveInit() {
    this.velocity.x = this.initialVelocity.x[this.currentState] ?? 0;
  }

  handleJumpInit() {
    this.velocity.y = this.initialVelocity.jump;
    this.handleMoveInit();
  }

  handleCrouchDownState() {
    if (this.animations[this.currentState][this.animationFrame][1] === -2) {
      this.changeState(FighterState.CROUCH);
    }
  }

  handleCrouchUpState() {
    if (this.animations[this.currentState][this.animationFrame][1] === -2) {
      this.changeState(FighterState.IDLE);
    }
  }

  handleJumpState(time) {
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
    const animation = this.animations[this.currentState];
    const [, frameDelay] = animation[this.animationFrame];

    if (time.previous > this.animationTimer + frameDelay) {
      this.animationTimer = time.previous;

      if (frameDelay > 0) {
        this.animationFrame++;
      }
      if (this.animationFrame >= this.animations[this.currentState].length) {
        this.animationFrame = 0;
      }
    }
  }

  update(time, ctx) {
    this.position.x += this.velocity.x * this.direction * time.secondsPassed;
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
    const [frameKey] = this.animations[this.currentState][this.animationFrame];
    const [[x, y, width, height], [originX, originY]] =
      this.frames.get(frameKey);

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
