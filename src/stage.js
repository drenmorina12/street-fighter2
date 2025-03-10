const background = document.querySelector('img[alt="background"]');

export function drawBackground(ctx) {
  // Hardcoding for now
  ctx.drawImage(background, 0, 0, 384, 224);
}
