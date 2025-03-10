const ken = document.querySelector('img[alt="ken"]');

const position = {
  x: 80,
  y: 110,
};

const velocity = {
  x: 1,
  y: 0,
};

export function updateKen(ctx) {
  position.x += velocity.x;

  if (position.x > ctx.canvas.width - ken.width || position.x < 0) {
    velocity.x = -velocity.x;
  }
}

export function drawKen(ctx) {
  ctx.drawImage(ken, position.x, position.y);
}
