import { Ken } from "./entities/fighters/Ken.js";
import { Stage } from "./entities/Stage.js";
import { Ryu } from "./entities/fighters/Ryu.js";
import { FpsCounter } from "./entities/FpsCounter.js";
import { STAGE_FLOOR } from "./constants/stage.js";
import { FighterDirection } from "./constants/fighter.js";

window.addEventListener("load", function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const entities = [
    new Stage(),
    new Ken({
      position: {
        x: 104,
        y: STAGE_FLOOR,
      },
      direction: FighterDirection.RIGHT,
    }),

    new Ryu({
      position: {
        x: 280,
        y: STAGE_FLOOR,
      },
      direction: FighterDirection.LEFT,
    }),

    new FpsCounter(),
  ];

  let frameTime = {
    previous: 0,
    secondsPassed: 0,
  };

  function frame(time) {
    window.requestAnimationFrame(frame);

    frameTime = {
      secondsPassed: (time - frameTime.previous) / 1000,
      previous: time,
    };

    for (const entity of entities) {
      entity.update(frameTime, ctx);
    }

    for (const entity of entities) {
      entity.draw(ctx);
    }
  }
  window.requestAnimationFrame(frame);
});
