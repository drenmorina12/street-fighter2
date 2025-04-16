import { HEALTH_CRITICAL_HIT_POINTS } from "../../../constants/battle.js";
import {
  FighterAttackStrength,
  FighterAttackType,
  FighterHurtBox,
} from "../../../constants/fighter.js";
import {
  fireballVelocity,
  FireballState,
  FireballCollidedState,
} from "../../../constants/fireball.js";
import { FRAME_TIME } from "../../../constants/game.js";
import {
  getActualBoxDimensions,
  boxOverlap,
} from "../../../utils/collisions.js";
import { Fighter } from "../Fighter.js";

// prettier-ignore
const frames = new Map([
  ['hadoken-fireball-1', [[[400, 2756, 43, 32], [25, 16]], [-15, -13, 30, 24], [-28, -20, 56, 38]]],
  ['hadoken-fireball-2', [[[460, 2761, 56, 28], [37, 14]], [-15, -13, 30, 24], [-28, -20, 56, 38]]],
  ['hadoken-fireball-3', [[[0, 0, 0, 0], [0, 0]], [-15, -13, 30, 24], [-28, -20, 56, 38]]],

  ['hadoken-collide-1', [[[543, 2767, 26, 20], [13, 10]], [0, 0, 0, 0]]],
  ['hadoken-collide-2', [[[590, 2766, 15, 25], [9, 13]], [0, 0, 0, 0]]],
  ['hadoken-collide-3', [[[625, 2764, 28, 28], [26, 14]], [0, 0, 0, 0]]],
])

const animations = {
  [FireballState.ACTIVE]: [
    ["hadoken-fireball-1", 2],
    ["hadoken-fireball-3", 2],
    ["hadoken-fireball-2", 2],
    ["hadoken-fireball-3", 2],
  ],
  [FireballState.COLLIDED]: [
    ["hadoken-collide-1", 9],
    ["hadoken-collide-2", 5],
    ["hadoken-collide-3", 9],
  ],
};

export class Fireball {
  image = document.querySelector("img[alt='ken']");

  animationFrame = 0;
  state = FireballState.ACTIVE;

  constructor(args, time, entityList) {
    const [fighter, strength] = args;

    this.fighter = fighter;
    this.entityList = entityList;
    this.velocity = fireballVelocity[strength];
    this.direction = this.fighter.direction;
    this.position = {
      x: this.fighter.position.x + 76 * this.direction,
      y: this.fighter.position.y - 57,
    };
    this.animationTimer = time.previous;
  }

  hasCollidedWithOpponent(hitBox) {
    for (const [, hurtBox] of Object.entries(
      this.fighter.opponent.boxes.hurt
    )) {
      const [x, y, width, height] = hurtBox;
      const actualOpponentHurtBox = getActualBoxDimensions(
        this.fighter.opponent.position,
        this.fighter.opponent.direction,
        { x, y, width, height }
      );

      if (boxOverlap(hitBox, actualOpponentHurtBox)) {
        return FireballCollidedState.OPPONENT;
      }
    }
  }

  hasCollidedWithOtherFireball(hitBox) {
    const otherFireballs = this.entityList.entities.filter(
      (fireball) => fireball instanceof Fireball && fireball !== this
    );

    if (otherFireballs.length === 0) {
      return;
    }

    for (const fireball of otherFireballs) {
      const [x, y, width, height] = frames.get(
        animations[fireball.state][fireball.animationFrame][0]
      )[1];
      const otherActualHitBox = getActualBoxDimensions(
        fireball.position,
        fireball.direction,
        {
          x,
          y,
          width,
          height,
        }
      );

      if (boxOverlap(hitBox, otherActualHitBox)) {
        return FireballCollidedState.FIREBALL;
      }
    }
  }

  hasCollided() {
    const [x, y, width, height] = frames.get(
      animations[this.state][this.animationFrame][0]
    )[1];
    const actualHitBox = getActualBoxDimensions(this.position, this.direction, {
      x,
      y,
      width,
      height,
    });

    return (
      this.hasCollidedWithOpponent(actualHitBox) ??
      this.hasCollidedWithOtherFireball(actualHitBox)
    );
  }

  updateMovement(time, camera) {
    if (this.state !== FireballState.ACTIVE) {
      return;
    }

    this.position.x += this.velocity * this.direction * time.secondsPassed;

    if (
      this.position.x - camera.position.x > 384 + 56 ||
      this.position.x - camera.position.x < -56
    ) {
      this.entityList.remove(this);
    }

    const hasCollided = this.hasCollided();
    if (!hasCollided) {
      return;
    }

    this.state = FireballState.COLLIDED;
    this.animationFrame = 0;
    this.animationTimer =
      time.previous +
      animations[this.state][this.animationFrame][1] * FRAME_TIME;

    if (hasCollided !== FireballCollidedState.OPPONENT) {
      return;
    }

    this.fighter.opponent.handleAttackHit(
      time,
      FighterAttackStrength.HEAVY,
      FighterAttackType.PUNCH,
      undefined,
      FighterHurtBox.HEAD
    );
  }

  updateAnimation(time) {
    if (time.previous < this.animationTimer) {
      return;
    }

    this.animationFrame += 1;
    if (this.animationFrame >= animations[this.state].length) {
      this.animationFrame = 0;
      if (this.state === FireballState.COLLIDED) {
        this.entityList.remove(this);
      }
    }

    this.animationTimer =
      time.previous +
      animations[this.state][this.animationFrame][1] * FRAME_TIME;
  }

  update(time, _, camera) {
    this.updateMovement(time, camera);
    this.updateAnimation(time);
  }

  draw(ctx, camera) {
    const [frameKey] = animations[this.state][this.animationFrame];
    const [[[x, y, width, height], [originX, originY]]] = frames.get(frameKey);

    ctx.scale(this.direction, 1);
    ctx.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      Math.floor((this.position.x - camera.position.x) * this.direction) -
        originX,
      Math.floor(this.position.y - camera.position.y) - originY,
      width,
      height
    );
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
