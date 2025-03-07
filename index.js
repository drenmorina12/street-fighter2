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

  const positon = {
    x: 0,
    y: 0,
  };

  const velocity = {
    x: 1,
    y: 0,
  };

  function frame() {
    // window.requestAnimationFrame(frame);
    positon.x += velocity.x;

    if (positon.x > GameViewport.WIDTH - ken.width || positon.x < 0) {
      velocity.x = -velocity.x;
    }
    // ctx.clearRect(0, 0, GameViewport.WIDTH, GameViewport.WIDTH);
    ctx.drawImage(background, 0, 0, GameViewport.WIDTH, GameViewport.HEIGHT);

    ctx.strokeStyle = "yellow";
    ctx.moveTo(0, 0);
    ctx.lineTo(GameViewport.WIDTH, GameViewport.HEIGHT);
    ctx.moveTo(GameViewport.WIDTH, 0);
    ctx.lineTo(0, GameViewport.HEIGHT);
    ctx.stroke();

    ctx.drawImage(ken, positon.x, positon.y);

    window.requestAnimationFrame(frame);
  }
  window.requestAnimationFrame(frame);

  console.log("Document is ready!");
};
