import { drawKen, updateKen } from "./ken.js";
import { drawBackground } from "./stage.js";
import { drawRyu, updateRyu } from "./ryu.js";

const GameViewport = {
  WIDTH: 384,
  HEIGHT: 224,
};

window.onload = function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = GameViewport.WIDTH;
  canvas.height = GameViewport.HEIGHT;

  const [ken, background] = document.querySelectorAll("img");

  function frame() {
    // window.requestAnimationFrame(frame);
    updateKen(ctx);
    updateRyu(ctx);

    drawBackground(ctx);
    drawKen(ctx);
    drawRyu(ctx);

    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);
};
