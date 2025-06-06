export function drawCross(ctx, camera, position, color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.moveTo(
    Math.floor(position.x - camera.position.x) - 4,
    Math.floor(position.y - camera.position.y) - 0.5
  );
  ctx.lineTo(
    Math.floor(position.x - camera.position.x) + 5,
    Math.floor(position.y - camera.position.y) - 0.5
  );
  ctx.moveTo(
    Math.floor(position.x - camera.position.x) + 0.5,
    Math.floor(position.y - camera.position.y) - 5
  );
  ctx.lineTo(
    Math.floor(position.x - camera.position.x) + 0.5,
    Math.floor(position.y - camera.position.y) + 4
  );
  ctx.stroke();
}

export function drawBox(ctx, camera, position, direction, dimensions, color) {
  if (!Array.isArray(dimensions)) {
    return;
  }

  const [x = 0, y = 0, width = 0, height = 0] = dimensions;

  ctx.beginPath();
  ctx.strokeStyle = color + "AA";
  ctx.fillStyle = color + "44";
  ctx.fillRect(
    Math.floor(position.x + x * direction - camera.position.x) + 0.5,
    Math.floor(position.y + y - camera.position.y) + 0.5,
    width * direction,
    height
  );
  ctx.rect(
    Math.floor(position.x + x * direction - camera.position.x) + 0.5,
    Math.floor(position.y + y - camera.position.y) + 0.5,
    width * direction,
    height
  );
  ctx.stroke();
}
