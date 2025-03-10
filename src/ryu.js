const ryu = document.querySelector('img[alt="ryu"]');

const position = {
  x: 120,
  y: 110,
};

const velocity = {
  x: 0,
  y: 0,
};

export function updateRyu(ctx) {
  position.x += velocity.x;

  if (position.x > ctx.canvas.width - ryu.width || position.x < 0) {
    velocity.x = -velocity.x;
  }
}

export function drawRyu(ctx) {
  ctx.drawImage(ryu, position.x, position.y);
}
