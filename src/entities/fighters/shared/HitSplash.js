import { FRAME_TIME } from "../../../constants/game.js";

export class HitSplash {
  image = document.querySelector('img[alt="decals"]');
  frames = [];

  animationFrame = 0;

  constructor(args, time, entityList) {
    const [x, y, playerId] = args;

    this.playerId = playerId;
    this.entityList = entityList;
    this.animationTimer = time.previous;
    this.position = { x, y };
  }

  update(time) {
    if (time.previous < this.animationTimer + 4 * FRAME_TIME) {
      return;
    }

    this.animationFrame += 1;
    this.animationTimer = time.previous;

    if (this.animationFrame >= 4) {
      this.entityList.remove.call(this.entityList, this);
    }
  }

  draw(ctx, camera) {
    const [[x, y, width, height], [originX, originY]] =
      this.frames[this.animationFrame + this.playerId * 4];

    ctx.drawImage(
      this.image,
      x,
      y,
      width,
      height,
      Math.floor(this.position.x - camera.position.x - originX),
      Math.floor(this.position.y - camera.position.y - originY),
      width,
      height
    );
  }
}
