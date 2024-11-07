const GameViewport = {
  WIDTH: 384,
  HEIGHT: 224,
  SCALE: 3,
};

window.onload = function () {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = GameViewport.WIDTH;
  canvas.height = GameViewport.HEIGHT;

  ctx.strokeStyle = "yellow";
  ctx.moveTo(0, 0);
  ctx.lineTo(GameViewport.WIDTH, GameViewport.HEIGHT);
  ctx.moveTo(GameViewport.WIDTH, 0);
  ctx.lineTo(0, GameViewport.HEIGHT);
  ctx.stroke();

  console.log("Document is ready!");
};
