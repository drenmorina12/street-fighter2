import { Ken } from "./entities/fighters/Ken.js";
import { Stage } from "./entities/Stage.js";
import { Ryu } from "./entities/fighters/Ryu.js";
import { FpsCounter } from "./entities/FpsCounter.js";

const GameViewport = {
  WIDTH: 384,
  HEIGHT: 224,
};

window.addEventListener("load", function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = GameViewport.WIDTH;
  canvas.height = GameViewport.HEIGHT;

  const entities = [
    new Stage(),
    new Ken({
      position: {
        x: 80,
        y: 110,
      },
      velocity: {
        x: 100,
        y: 0,
      },
    }),

    new Ryu({
      position: {
        x: 110,
        y: 110,
      },
      velocity: {
        x: -100,
        y: 0,
      },
    }),

    new FpsCounter(),
  ];

  let previousTime = 0;
  let secondsPassed = 0;

  function frame(time) {
    window.requestAnimationFrame(frame);

    secondsPassed = (time - previousTime) / 1000;
    previousTime = time;

    for (const entity of entities) {
      entity.update(secondsPassed, ctx);
    }

    for (const entity of entities) {
      entity.draw(ctx);
    }
  }
  window.requestAnimationFrame(frame);
});
