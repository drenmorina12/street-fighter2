import { SCREEN_WIDTH } from "../../constants/game.js";

export class FpsCounter {
  constructor() {
    this.fps = 0;
  }

  update(frameTime) {
    this.fps = Math.trunc(1 / frameTime.secondsPassed);
  }

  draw(ctx) {
    ctx.font = "14px Arial";
    ctx.fillStyle = "#00FF00";
    ctx.textAlign = "right";
    ctx.fillText(`FPS: ${this.fps}`, SCREEN_WIDTH - 2, ctx.canvas.height - 2);
  }
}
