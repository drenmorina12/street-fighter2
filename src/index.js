import { Ken } from "./entities/fighters/Ken.js";
import { Stage } from "./entities/Stage.js";
import { Ryu } from "./entities/fighters/Ryu.js";

const GameViewport = {
  WIDTH: 384,
  HEIGHT: 224,
};

window.onload = function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = GameViewport.WIDTH;
  canvas.height = GameViewport.HEIGHT;

  const ken = new Ken({
    position: {
      x: 80,
      y: 110,
    },
    velocity: {
      x: 1,
      y: 0,
    },
  });

  const ryu = new Ryu({
    position: {
      x: 110,
      y: 110,
    },
    velocity: {
      x: 0,
      y: 0,
    },
  });

  const stage = new Stage();

  function frame() {
    // window.requestAnimationFrame(frame);
    ken.update(ctx);
    ryu.update(ctx);

    stage.draw(ctx);
    ken.draw(ctx);
    ryu.draw(ctx);

    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
};
