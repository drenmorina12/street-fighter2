import {
  FIGHTER_START_DISTANCE,
  FighterDirection,
  FighterAttackType,
  FrameDelay,
  PUSH_FRICTION,
  FighterAttackStrength,
  FighterHurtBox,
  hurtStateValidFrom,
  FIGHTER_HURT_DELAY,
  FighterAttackBaseData,
  FIGHTER_DEFAULT_WIDTH,
} from "../../constants/fighter.js";
import { FRAME_TIME } from "../../constants/game.js";
import { FighterState } from "../../constants/fighter.js";
import {
  STAGE_FLOOR,
  STAGE_MID_POINT,
  STAGE_PADDING,
} from "../../constants/stage.js";
import * as control from "../../engine/InputHandler.js";
import {
  boxOverlap,
  getActualBoxDimensions,
  rectsOverlap,
} from "../../utils/collisions.js";
import * as DEBUG from "../../utils/fighterDebug.js";
import { playSound, stopSound } from "../../engine/soundHandler.js";

export class Fighter {
  frames = new Map();
  image = new Image();

  animations = {};
  animationFrame = 0;
  animationTimer = 0;

  currentState = FighterState.IDLE;
  opponent = undefined;

  gravity = 0;
  velocity = { x: 0, y: 0 };
  initialVelocity = {};
  attackStruck = false;

  hurtShake = 0;
  hurtShakeTimer = 0;
  slideVelocity = 0;
  slideFriction = 0;

  boxes = {
    push: { x: 0, y: 0, width: 0, height: 0 },
    hit: { x: 0, y: 0, width: 0, height: 0 },
    hurt: {
      [FighterHurtBox.HEAD]: [0, 0, 0, 0],
      [FighterHurtBox.BODY]: [0, 0, 0, 0],
      [FighterHurtBox.FEET]: [0, 0, 0, 0],
    },
  };

  states = {
    [FighterState.IDLE]: {
      init: this.handleIdleInit.bind(this),
      update: this.handleIdleState.bind(this),
      validFrom: [
        FighterState.IDLE,
        FighterState.WALK_FORWARDS,
        FighterState.WALK_BACKWARDS,
        FighterState.JUMP_UP,
        FighterState.JUMP_FORWARDS,
        FighterState.JUMP_BACKWARDS,
        FighterState.CROUCH_UP,
        FighterState.JUMP_LAND,
        FighterState.IDLE_TURN,
        FighterState.LIGHT_PUNCH,
        FighterState.MEDIUM_PUNCH,
        FighterState.HEAVY_PUNCH,
        FighterState.LIGHT_KICK,
        FighterState.MEDIUM_KICK,
        FighterState.HEAVY_KICK,
        FighterState.HURT_HEAD_LIGHT,
        FighterState.HURT_HEAD_MEDIUM,
        FighterState.HURT_HEAD_HEAVY,
        FighterState.HURT_BODY_LIGHT,
        FighterState.HURT_BODY_MEDIUM,
        FighterState.HURT_BODY_HEAVY,
      ],
    },
    [FighterState.WALK_FORWARDS]: {
      init: this.handleMoveInit.bind(this),
      update: this.handleWalkForwardState.bind(this),
      validFrom: [FighterState.IDLE, FighterState.WALK_BACKWARDS],
    },
    [FighterState.WALK_BACKWARDS]: {
      init: this.handleMoveInit.bind(this),
      update: this.handleWalkBackwardsState.bind(this),
      validFrom: [FighterState.IDLE, FighterState.WALK_FORWARDS],
    },
    [FighterState.JUMP_START]: {
      init: this.handleJumpStartInit.bind(this),
      update: this.handleJumpStartState.bind(this),
      validFrom: [
        FighterState.IDLE,
        FighterState.WALK_FORWARDS,
        FighterState.WALK_BACKWARDS,
        FighterState.JUMP_LAND,
        FighterState.IDLE_TURN,
      ],
    },
    [FighterState.JUMP_UP]: {
      init: this.handleJumpInit.bind(this),
      update: this.handleJumpState.bind(this),
      validFrom: [FighterState.JUMP_START],
    },
    [FighterState.JUMP_FORWARDS]: {
      init: this.handleJumpInit.bind(this),
      update: this.handleJumpState.bind(this),
      validFrom: [FighterState.JUMP_START],
    },
    [FighterState.JUMP_BACKWARDS]: {
      init: this.handleJumpInit.bind(this),
      update: this.handleJumpState.bind(this),
      validFrom: [FighterState.JUMP_START],
    },
    [FighterState.JUMP_LAND]: {
      init: this.handleJumpLandInit.bind(this),
      update: this.handleJumpLandState.bind(this),
      validFrom: [
        FighterState.JUMP_UP,
        FighterState.JUMP_BACKWARDS,
        FighterState.JUMP_FORWARDS,
      ],
    },
    [FighterState.CROUCH]: {
      init: () => {},
      update: this.handleCrouchState.bind(this),
      validFrom: [FighterState.CROUCH_DOWN, FighterState.CROUCH_TURN],
    },
    [FighterState.CROUCH_DOWN]: {
      init: this.handleCrouchDownInit.bind(this),
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
    [FighterState.IDLE_TURN]: {
      init: () => {},
      update: this.handleIdleTurnState.bind(this),
      validFrom: [
        FighterState.IDLE,
        FighterState.JUMP_LAND,
        FighterState.WALK_BACKWARDS,
        FighterState.WALK_FORWARDS,
      ],
    },
    [FighterState.CROUCH_TURN]: {
      init: () => {},
      update: this.handleCrouchTurnState.bind(this),
      validFrom: [FighterState.CROUCH],
    },
    [FighterState.LIGHT_PUNCH]: {
      attackType: FighterAttackType.PUNCH,
      attackStrength: FighterAttackStrength.LIGHT,
      init: this.handleAttackInit.bind(this),
      update: this.handleLightPunchState.bind(this),
      validFrom: [
        FighterState.IDLE,
        FighterState.WALK_FORWARDS,
        FighterState.WALK_BACKWARDS,
      ],
    },
    [FighterState.MEDIUM_PUNCH]: {
      attackType: FighterAttackType.PUNCH,
      attackStrength: FighterAttackStrength.MEDIUM,
      init: this.handleAttackInit.bind(this),
      update: this.handleMediumPunchState.bind(this),
      validFrom: [
        FighterState.IDLE,
        FighterState.WALK_FORWARDS,
        FighterState.WALK_BACKWARDS,
      ],
    },
    [FighterState.HEAVY_PUNCH]: {
      attackType: FighterAttackType.PUNCH,
      attackStrength: FighterAttackStrength.HEAVY,
      init: this.handleAttackInit.bind(this),
      update: this.handleMediumPunchState.bind(this),
      validFrom: [
        FighterState.IDLE,
        FighterState.WALK_FORWARDS,
        FighterState.WALK_BACKWARDS,
      ],
    },
    [FighterState.LIGHT_KICK]: {
      attackType: FighterAttackType.KICK,
      attackStrength: FighterAttackStrength.LIGHT,
      init: this.handleAttackInit.bind(this),
      update: this.handleLightKickState.bind(this),
      validFrom: [
        FighterState.IDLE,
        FighterState.WALK_FORWARDS,
        FighterState.WALK_BACKWARDS,
      ],
    },
    [FighterState.MEDIUM_KICK]: {
      attackType: FighterAttackType.KICK,
      attackStrength: FighterAttackStrength.MEDIUM,
      init: this.handleAttackInit.bind(this),
      update: this.handleMediumKickState.bind(this),
      validFrom: [
        FighterState.IDLE,
        FighterState.WALK_FORWARDS,
        FighterState.WALK_BACKWARDS,
      ],
    },
    [FighterState.HEAVY_KICK]: {
      attackType: FighterAttackType.KICK,
      attackStrength: FighterAttackStrength.HEAVY,
      init: this.handleAttackInit.bind(this),
      update: this.handleMediumKickState.bind(this),
      validFrom: [
        FighterState.IDLE,
        FighterState.WALK_FORWARDS,
        FighterState.WALK_BACKWARDS,
      ],
    },
    [FighterState.HURT_HEAD_LIGHT]: {
      init: this.handleHurtInit.bind(this),
      update: this.handleHurtState.bind(this),
      validFrom: hurtStateValidFrom,
    },
    [FighterState.HURT_HEAD_MEDIUM]: {
      init: this.handleHurtInit.bind(this),
      update: this.handleHurtState.bind(this),
      validFrom: hurtStateValidFrom,
    },
    [FighterState.HURT_HEAD_HEAVY]: {
      init: this.handleHurtInit.bind(this),
      update: this.handleHurtState.bind(this),
      validFrom: hurtStateValidFrom,
    },
    [FighterState.HURT_BODY_LIGHT]: {
      init: this.handleHurtInit.bind(this),
      update: this.handleHurtState.bind(this),
      validFrom: hurtStateValidFrom,
    },
    [FighterState.HURT_BODY_MEDIUM]: {
      init: this.handleHurtInit.bind(this),
      update: this.handleHurtState.bind(this),
      validFrom: hurtStateValidFrom,
    },
    [FighterState.HURT_BODY_HEAVY]: {
      init: this.handleHurtInit.bind(this),
      update: this.handleHurtState.bind(this),
      validFrom: hurtStateValidFrom,
    },
  };

  // prettier-ignore
  soundAttacks = {
    [FighterAttackStrength.LIGHT]: document.querySelector("audio#sound-fighter-light-attack"),
    [FighterAttackStrength.MEDIUM]: document.querySelector("audio#sound-fighter-medium-attack"),
    [FighterAttackStrength.HEAVY]: document.querySelector("audio#sound-fighter-heavy-attack"),
  }

  // prettier-ignore
  soundHits = {
    [FighterAttackStrength.LIGHT]: {
      [FighterAttackType.PUNCH]: document.querySelector("audio#sound-fighter-light-punch-hit"),
      [FighterAttackType.KICK]: document.querySelector("audio#sound-fighter-light-kick-hit"),
    },
    [FighterAttackStrength.MEDIUM]: {
      [FighterAttackType.PUNCH]: document.querySelector("audio#sound-fighter-medium-punch-hit"),
      [FighterAttackType.KICK]: document.querySelector("audio#sound-fighter-medium-kick-hit"),
    },
    [FighterAttackStrength.HEAVY]: {
      [FighterAttackType.PUNCH]: document.querySelector("audio#sound-fighter-heavy-punch-hit"),
      [FighterAttackType.KICK]: document.querySelector("audio#sound-fighter-heavy-kick-hit"),
    },
  }

  soundLand = document.querySelector("audio#sound-fighter-land");

  constructor(playerId, onAttackHit) {
    this.playerId = playerId;
    this.onAttackHit = onAttackHit;

    this.position = {
      x:
        STAGE_MID_POINT +
        STAGE_PADDING +
        (playerId === 1 ? -FIGHTER_START_DISTANCE : FIGHTER_START_DISTANCE),
      y: STAGE_FLOOR,
    };

    this.direction =
      playerId === 0 ? FighterDirection.RIGHT : FighterDirection.LEFT;
  }

  isAnimationCompleted = () =>
    this.animations[this.currentState][this.animationFrame][1] ===
    FrameDelay.TRANSITION;

  hasCollidedWithOpponent = () =>
    rectsOverlap(
      this.position.x + this.boxes.push.x,
      this.position.y + this.boxes.push.y,
      this.boxes.push.width,
      this.boxes.push.height,
      this.opponent.position.x + this.opponent.boxes.push.x,
      this.opponent.position.y + this.opponent.boxes.push.y,
      this.opponent.boxes.push.width,
      this.opponent.boxes.push.height
    );

  resetVelocities() {
    this.velocity = { x: 0, y: 0 };
  }

  resetSlide(transferToOpponent = false) {
    if (transferToOpponent) {
      this.opponent.slideVelocity = this.slideVelocity;
      this.opponent.slideFriction = this.slideFriction;
    }
    this.slideFriction = 0;
    this.slideVelocity = 0;
  }

  getDirection() {
    if (
      this.position.x + this.boxes.push.x + this.boxes.push.width <=
      this.opponent.position.x + this.opponent.boxes.push.x
    ) {
      return FighterDirection.RIGHT;
    } else if (
      this.position.x + this.boxes.push.x >=
      this.opponent.position.x +
        this.opponent.boxes.push.x +
        this.opponent.boxes.push.width
    ) {
      return FighterDirection.LEFT;
    }

    return this.direction;
  }

  getBoxes(frameKey) {
    const [
      ,
      [pushX = 0, pushY = 0, pushWidth = 0, pushHeight = 0] = [],
      [head = [0, 0, 0, 0], body = [0, 0, 0, 0], feet = [0, 0, 0, 0]] = [],
      [hitX = 0, hitY = 0, hitWidth = 0, hitHeight = 0] = [],
    ] = this.frames.get(frameKey);

    return {
      push: { x: pushX, y: pushY, width: pushWidth, height: pushHeight },
      hit: { x: hitX, y: hitY, width: hitWidth, height: hitHeight },
      hurt: {
        [FighterHurtBox.HEAD]: head,
        [FighterHurtBox.BODY]: body,
        [FighterHurtBox.FEET]: feet,
      },
    };
  }

  getHitState(attackStrength, hitLocation) {
    switch (attackStrength) {
      case FighterAttackStrength.LIGHT:
        if (hitLocation === FighterHurtBox.HEAD) {
          return FighterState.HURT_HEAD_LIGHT;
        }
        return FighterState.HURT_BODY_LIGHT;

      case FighterAttackStrength.MEDIUM:
        if (hitLocation === FighterHurtBox.HEAD) {
          return FighterState.HURT_HEAD_MEDIUM;
        }
        return FighterState.HURT_BODY_MEDIUM;

      case FighterAttackStrength.HEAVY:
        if (hitLocation === FighterHurtBox.HEAD) {
          return FighterState.HURT_HEAD_HEAVY;
        }
        return FighterState.HURT_BODY_HEAVY;
    }
  }

  setAnimationFrame(frame, time) {
    const animation = this.animations[this.currentState];

    this.animationFrame = frame;
    if (this.animationFrame >= animation.length) {
      this.animationFrame = 0;
    }

    const [frameKey, frameDelay] = animation[this.animationFrame];
    this.boxes = this.getBoxes(frameKey);
    this.animationTimer = time.previous + frameDelay * FRAME_TIME;
  }

  changeState(newState, time) {
    if (!this.states[newState].validFrom.includes(this.currentState)) {
      console.warn(
        `Illegal transition from ${this.currentState} to ${newState}`
      );
      return;
    }

    this.currentState = newState;
    this.setAnimationFrame(0, time);

    this.states[this.currentState].init(time);
  }

  // Handle Inits

  handleIdleInit() {
    this.resetVelocities();
    this.attackStruck = false;
  }

  handleMoveInit() {
    this.velocity.x = this.initialVelocity.x[this.currentState] ?? 0;
  }

  handleJumpInit() {
    this.velocity.y = this.initialVelocity.jump;
    this.handleMoveInit();
  }

  handleCrouchDownInit() {
    this.resetVelocities();
  }

  handleJumpStartInit() {
    this.resetVelocities();
  }

  handleJumpLandInit() {
    this.resetVelocities();
    playSound(this.soundLand);
  }

  handleAttackInit() {
    this.resetVelocities();
    playSound(this.soundAttacks[this.states[this.currentState].attackStrength]);
  }

  handleHurtInit(time) {
    this.resetVelocities();
    this.hurtShake = 2;
    this.hurtShakeTimer = time.previous + FRAME_TIME;
  }

  // Handle States

  handleIdleState(time) {
    if (control.isUp(this.playerId)) {
      this.changeState(FighterState.JUMP_START, time);
    } else if (control.isDown(this.playerId)) {
      this.changeState(FighterState.CROUCH_DOWN, time);
    } else if (control.isBackward(this.playerId, this.direction)) {
      this.changeState(FighterState.WALK_BACKWARDS, time);
    } else if (control.isForward(this.playerId, this.direction)) {
      this.changeState(FighterState.WALK_FORWARDS, time);
    } else if (control.isLightPunch(this.playerId)) {
      this.changeState(FighterState.SPECIAL_1, time);
      // this.changeState(FighterState.LIGHT_PUNCH, time);
    } else if (control.isMediumPunch(this.playerId)) {
      this.changeState(FighterState.MEDIUM_PUNCH, time);
    } else if (control.isHeavyPunch(this.playerId)) {
      this.changeState(FighterState.HEAVY_PUNCH, time);
    } else if (control.isLightKick(this.playerId)) {
      this.changeState(FighterState.LIGHT_KICK, time);
    } else if (control.isMediumKick(this.playerId)) {
      this.changeState(FighterState.MEDIUM_KICK, time);
    } else if (control.isHeavyKick(this.playerId)) {
      this.changeState(FighterState.HEAVY_KICK, time);
    }

    const newDirection = this.getDirection();

    if (newDirection !== this.direction) {
      this.direction = newDirection;
      this.changeState(FighterState.IDLE_TURN, time);
    }
  }

  handleWalkForwardState(time) {
    if (!control.isForward(this.playerId, this.direction)) {
      this.changeState(FighterState.IDLE, time);
    } else if (control.isUp(this.playerId)) {
      this.changeState(FighterState.JUMP_START, time);
    } else if (control.isDown(this.playerId)) {
      this.changeState(FighterState.CROUCH_DOWN, time);
    }

    if (control.isLightPunch(this.playerId)) {
      this.changeState(FighterState.LIGHT_PUNCH, time);
    } else if (control.isMediumPunch(this.playerId)) {
      this.changeState(FighterState.MEDIUM_PUNCH, time);
    } else if (control.isHeavyPunch(this.playerId)) {
      this.changeState(FighterState.HEAVY_PUNCH, time);
    } else if (control.isLightKick(this.playerId)) {
      this.changeState(FighterState.LIGHT_KICK, time);
    } else if (control.isMediumKick(this.playerId)) {
      this.changeState(FighterState.MEDIUM_KICK, time);
    } else if (control.isHeavyKick(this.playerId)) {
      this.changeState(FighterState.HEAVY_KICK, time);
    }

    this.direction = this.getDirection();
  }

  handleWalkBackwardsState(time) {
    if (!control.isBackward(this.playerId, this.direction)) {
      this.changeState(FighterState.IDLE, time);
    } else if (control.isUp(this.playerId)) {
      this.changeState(FighterState.JUMP_START, time);
    } else if (control.isDown(this.playerId)) {
      this.changeState(FighterState.CROUCH_DOWN, time);
    }

    if (control.isLightPunch(this.playerId)) {
      this.changeState(FighterState.LIGHT_PUNCH, time);
    } else if (control.isMediumPunch(this.playerId)) {
      this.changeState(FighterState.MEDIUM_PUNCH, time);
    } else if (control.isHeavyPunch(this.playerId)) {
      this.changeState(FighterState.HEAVY_PUNCH, time);
    } else if (control.isLightKick(this.playerId)) {
      this.changeState(FighterState.LIGHT_KICK, time);
    } else if (control.isMediumKick(this.playerId)) {
      this.changeState(FighterState.MEDIUM_KICK, time);
    } else if (control.isHeavyKick(this.playerId)) {
      this.changeState(FighterState.HEAVY_KICK, time);
    }

    this.direction = this.getDirection();
  }

  handleCrouchState(time) {
    if (!control.isDown(this.playerId)) {
      this.changeState(FighterState.CROUCH_UP, time);
    }

    const newDirection = this.getDirection();

    if (newDirection !== this.direction) {
      this.direction = newDirection;
      this.changeState(FighterState.CROUCH_TURN, time);
    }
  }

  handleCrouchDownState(time) {
    if (this.isAnimationCompleted()) {
      this.changeState(FighterState.CROUCH, time);
    }

    if (!control.isDown(this.playerId)) {
      this.currentState = FighterState.CROUCH_UP;
      this.setAnimationFrame(
        Math.max(
          0,
          this.animations[FighterState.CROUCH_UP][this.animationFrame].length -
            this.animationFrame
        )
      );
    }
  }

  handleCrouchUpState(time) {
    if (this.isAnimationCompleted()) {
      this.changeState(FighterState.IDLE, time);
    }
  }

  handleJumpState(time) {
    this.velocity.y += this.gravity * time.secondsPassed;

    if (this.position.y > STAGE_FLOOR) {
      this.position.y = STAGE_FLOOR;
      this.changeState(FighterState.JUMP_LAND, time);
    }
  }

  handleJumpStartState(time) {
    if (this.isAnimationCompleted()) {
      if (control.isBackward(this.playerId, this.direction)) {
        this.changeState(FighterState.JUMP_BACKWARDS, time);
      } else if (control.isForward(this.playerId, this.direction)) {
        this.changeState(FighterState.JUMP_FORWARDS, time);
      } else {
        this.changeState(FighterState.JUMP_UP, time);
      }
    }
  }

  handleJumpLandState(time) {
    if (this.animationFrame < 1) {
      return;
    }

    let newState = FighterState.IDLE;

    if (!control.isIdle(this.playerId)) {
      this.direction = this.getDirection();
      this.handleIdleState(time);
    } else {
      const newDirection = this.getDirection();
      if (newDirection !== this.direction) {
        this.direction = newDirection;
        newState = FighterState.IDLE_TURN;
      } else {
        if (!this.isAnimationCompleted()) {
          return;
        }
      }
    }

    this.changeState(newState, time);
  }

  handleIdleTurnState(time) {
    this.handleIdleState();

    if (!this.isAnimationCompleted()) {
      return;
    }
    this.changeState(FighterState.IDLE, time);
  }

  handleCrouchTurnState(time) {
    this.handleCrouchState();

    if (!this.isAnimationCompleted()) {
      return;
    }
    this.changeState(FighterState.CROUCH, time);
  }

  handleLightAttackReset(time) {
    this.setAnimationFrame(0, time);
    this.handleAttackInit();
    this.attackStruck = false;
  }

  handleLightPunchState(time) {
    if (this.animationFrame < 2) {
      return;
    }

    if (control.isLightPunch(this.playerId)) {
      this.handleLightAttackReset(time);
    }

    if (!this.isAnimationCompleted()) {
      return;
    }
    this.changeState(FighterState.IDLE, time);
  }

  handleMediumPunchState(time) {
    if (!this.isAnimationCompleted()) {
      return;
    }
    this.changeState(FighterState.IDLE, time);
  }

  handleLightKickState(time) {
    if (this.animationFrame < 2) {
      return;
    }

    if (control.isLightKick(this.playerId)) {
      this.handleLightAttackReset(time);
    }

    if (!this.isAnimationCompleted()) {
      return;
    }
    this.changeState(FighterState.IDLE, time);
  }

  handleMediumKickState(time) {
    if (!this.isAnimationCompleted()) {
      return;
    }
    this.changeState(FighterState.IDLE, time);
  }

  handleHurtState(time) {
    if (!this.isAnimationCompleted(time)) {
      return;
    }
    this.hurtShake = 0;
    this.hurtShakeTimer = 0;

    this.changeState(FighterState.IDLE, time);
  }

  handleAttackHit(time, attackStrength, attackType, hitPosition, hurtLocation) {
    const newState = this.getHitState(attackStrength, hurtLocation);
    const { velocity, friction } = FighterAttackBaseData[attackStrength].slide;

    this.slideVelocity = velocity;
    this.slideFriction = friction;
    this.attackStruck = true;

    playSound(this.soundHits[attackStrength][attackType]);
    this.onAttackHit(
      time,
      this.opponent.playerId,
      this.playerId,
      hitPosition,
      attackStrength
    );
    this.changeState(newState, time);

    DEBUG.logHit(this, attackStrength, hurtLocation);
  }

  // Updates

  updateStageConstraints(time, ctx, camera) {
    if (
      this.position.x >
      camera.position.x + ctx.canvas.width - FIGHTER_DEFAULT_WIDTH
    ) {
      this.position.x =
        camera.position.x + ctx.canvas.width - FIGHTER_DEFAULT_WIDTH;
      this.resetSlide(true);
    }

    if (this.position.x < camera.position.x + FIGHTER_DEFAULT_WIDTH) {
      this.position.x = camera.position.x + FIGHTER_DEFAULT_WIDTH;
      this.resetSlide(true);
    }

    if (this.hasCollidedWithOpponent()) {
      if (this.position.x <= this.opponent.position.x) {
        this.position.x = Math.max(
          this.opponent.position.x +
            this.opponent.boxes.push.x -
            (this.boxes.push.x + this.boxes.push.width),
          camera.position.x + FIGHTER_DEFAULT_WIDTH
        );

        if (
          [
            FighterState.IDLE,
            FighterState.CROUCH,
            FighterState.JUMP_UP,
            FighterState.JUMP_BACKWARDS,
            FighterState.JUMP_FORWARDS,
          ].includes(this.opponent.currentState)
        ) {
          this.opponent.position.x += PUSH_FRICTION * time.secondsPassed;
        }
      }

      if (this.position.x >= this.opponent.position.x) {
        this.position.x = Math.min(
          this.opponent.position.x +
            this.opponent.boxes.push.x +
            this.opponent.boxes.push.width +
            (this.boxes.push.width + this.boxes.push.x),
          camera.position.x + ctx.canvas.width - FIGHTER_DEFAULT_WIDTH
        );

        if (
          [
            FighterState.IDLE,
            FighterState.CROUCH,
            FighterState.JUMP_UP,
            FighterState.JUMP_BACKWARDS,
            FighterState.JUMP_FORWARDS,
          ].includes(this.opponent.currentState)
        ) {
          this.opponent.position.x -= PUSH_FRICTION * time.secondsPassed;
        }
      }
    }
  }

  updateAnimation(time) {
    const animation = this.animations[this.currentState];
    if (
      animation[this.animationFrame][1] <= FrameDelay.FREEZE ||
      time.previous <= this.animationTimer
    ) {
      return;
    }

    this.setAnimationFrame(this.animationFrame + 1, time);
  }

  updateAttackBoxCollided(time) {
    const { attackStrength, attackType } = this.states[this.currentState];

    if (!attackType || this.attackStruck) {
      return;
    }

    const actualHitBox = getActualBoxDimensions(
      this.position,
      this.direction,
      this.boxes.hit
    );

    for (const [hurtLocation, hurtBox] of Object.entries(
      this.opponent.boxes.hurt
    )) {
      const [x, y, width, height] = hurtBox;
      const actualOpponentHurtBox = getActualBoxDimensions(
        this.opponent.position,
        this.opponent.direction,
        { x, y, width, height }
      );

      if (!boxOverlap(actualHitBox, actualOpponentHurtBox)) {
        return;
      }

      stopSound(this.soundAttacks[attackStrength]);

      const hitPosition = {
        x:
          (actualHitBox.x +
            actualHitBox.width / 2 +
            actualOpponentHurtBox.x +
            actualOpponentHurtBox.width / 2) /
          2,
        y:
          (actualHitBox.y +
            actualHitBox.height / 2 +
            actualOpponentHurtBox.y +
            actualOpponentHurtBox.height / 2) /
          2,
      };

      hitPosition.x -= 4 - Math.random() * 8;
      hitPosition.y -= 4 - Math.random() * 8;

      this.opponent.handleAttackHit(
        time,
        attackStrength,
        attackType,
        hitPosition,
        hurtLocation
      );

      return;
    }
  }

  updateHurtShake(time, delay) {
    if (this.hurtShakeTimer === 0 || time.previous <= this.hurtShakeTimer) {
      return;
    }

    const shakeAmount =
      delay - time.previous < (FIGHTER_HURT_DELAY * FRAME_TIME) / 2 ? 1 : 2;

    this.hurtShake = shakeAmount - this.hurtShake;
    this.hurtShakeTimer = time.previous + FRAME_TIME;
  }

  updateSlide(time) {
    if (this.slideVelocity >= 0) {
      return;
    }

    this.slideVelocity += this.slideFriction * time.secondsPassed;

    if (this.slideVelocity < 0) {
      return;
    }

    this.resetSlide();
  }

  updatePosition(time) {
    this.position.x +=
      (this.velocity.x + this.slideVelocity) *
      this.direction *
      time.secondsPassed;
    this.position.y += this.velocity.y * time.secondsPassed;
  }

  update(time, ctx, camera) {
    this.states[this.currentState].update(time, ctx);
    this.updateSlide(time);
    this.updatePosition(time);
    this.updateAnimation(time);
    this.updateStageConstraints(time, ctx, camera);
    this.updateAttackBoxCollided(time);
  }

  draw(ctx, camera) {
    const [frameKey] = this.animations[this.currentState][this.animationFrame];
    const [[[x, y, width, height], [originX, originY]]] =
      this.frames.get(frameKey);

    ctx.scale(this.direction, 1);
    ctx.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      Math.floor(
        (this.position.x - this.hurtShake - camera.position.x) * this.direction
      ) - originX,
      Math.floor(this.position.y - camera.position.y) - originY,
      width,
      height
    );
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    DEBUG.drawCollisionInfo(this, ctx, camera);
  }
}
