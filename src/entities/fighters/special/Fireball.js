import { fireballVelocity } from "../../../constants/fireball";

// prettier-ignore
const frames = new Map([
  ['hadoken-fireball-1', [[[400, 2756, 43, 32], [25, 16]], [-15, -13, 30, 24], [-28, -20, 56, 38]]],
  ['hadoken-fireball-2', [[[460, 2761, 56, 28], [37, 14]], [-15, -13, 30, 24], [-28, -20, 56, 38]]],
  ['hadoken-fireball-3', [[[0, 0, 0, 0], [0, 0]], [-15, -13, 30, 24], [-28, -20, 56, 38]]],

  ['hadoken-collide-1', [[[543, 2767, 26, 20], [13, 10]], [0, 0, 0, 0]]],
  ['hadoken-collide-2', [[[590, 2766, 15, 25], [9, 13]], [0, 0, 0, 0]]],
  ['hadoken-collide-3', [[[625, 2764, 28, 28], [26, 14]], [0, 0, 0, 0]]],
])

export class Fireball {
  image = document.querySelector("img[alt='ken']");

  animationFrame = 0;

  constructor(fighter, strength, time, onEnd) {
    this.fighter = fighter;
    this.velocity = fireballVelocity[strength];
    this.direction = this.fighter.direction;
    this.position = {
      x: this.fighter.position.x + 76 * this.direction,
      y: this.fighter.position.y - 57,
    };
    this.animationTimer = time.previous;
  }
}
