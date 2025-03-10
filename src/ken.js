const ken = document.querySelector('img[alt="ken"]');

const positon = {
  x: 80,
  y: 110,
};

const velocity = {
  x: 1,
  y: 0,
};

export function updateKen(ctx) {
  positon.x += velocity.x;

  if (positon.x > ctx.canvas.width - ken.width || positon.x < 0) {
    velocity.x = -velocity.x;
  }
}

export function drawKen(ctx) {
  ctx.drawImage(ken, positon.x, positon.y);
}
