import {
  pollGamepads,
  registerGamepadEvents,
  registerKeyboardEvents,
} from "./engine/InputHandler.js";
import { getContext } from "./utils/context.js";
import { BattleScene } from "./scenes/BattleScene.js";

export class StreetFighterGame {
  ctx = getContext();

  frameTime = {
    previous: 0,
    secondsPassed: 0,
  };

  constructor() {
    this.scene = new BattleScene();
  }

  frame(time) {
    window.requestAnimationFrame(this.frame.bind(this));

    this.frameTime = {
      secondsPassed: (time - this.frameTime.previous) / 1000,
      previous: time,
    };

    pollGamepads();
    this.scene.update(this.frameTime, this.ctx);
    this.scene.draw(this.ctx);
  }

  start() {
    registerKeyboardEvents();
    registerGamepadEvents();

    window.requestAnimationFrame(this.frame.bind(this));
  }
}
