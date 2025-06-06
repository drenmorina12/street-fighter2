import { STAGE_FLOOR } from "../../../constants/stage.js";

export class Shadow {
  frame = [
    [0, 0, 68, 11],
    [34, 7],
  ];
  image = document.querySelector('img[alt="shadow"]');

  constructor(fighter) {
    this.fighter = fighter;
  }

  getScale() {
    if (this.fighter.position.y !== STAGE_FLOOR) {
      const airScale = 1 - (STAGE_FLOOR - this.fighter.position.y) / 250;
      return [airScale, airScale];
    } else if (this.fighter.states[this.fighter.currentState].shadow) {
      const [scaleX, scaleY, offsetX, offsetY] =
        this.fighter.states[this.fighter.currentState].shadow;
      return [scaleX, scaleY, -offsetX * this.fighter.direction, offsetY];
      // Normaly should be +offsetX, but only works properly with -offsetX now
    }

    return [1, 1];
  }

  update = () => {
    undefined;
  };

  draw(ctx, camera) {
    const [[x, y, width, height], [originX, originY]] = this.frame;

    const [scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0] = this.getScale();

    ctx.globalAlpha = 0.5;
    ctx.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      Math.floor(
        this.fighter.position.x - camera.position.x - originX * scaleX
      ) - offsetX,
      Math.floor(STAGE_FLOOR - camera.position.y - originY * scaleY) - offsetY,
      Math.floor(width * scaleX),
      Math.floor(height * scaleY)
    );
    ctx.globalAlpha = 1;
  }
}
