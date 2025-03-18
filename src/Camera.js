export class Camera {
  constructor(x, y, fighters) {
    this.position = { x, y };
    this.fighters = fighters;
  }

  update(time, ctx) {
    this.position.y =
      -6 +
      Math.floor(
        Math.min(this.fighters[1].position.y, this.fighters[0].position.y) / 10
      );
  }
}
