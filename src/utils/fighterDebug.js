import { gameState } from "../../src/state/gameState.js";
import { drawBox, drawCross } from "./entityDebug.js";

export function drawCollisionInfo(fighter, ctx, camera) {
  const { position, direction, boxes } = fighter;

  ctx.lineWidth = 1;

  // Push Box
  drawBox(
    ctx,
    camera,
    position,
    direction,
    Object.values(boxes.push),
    "#55FF55"
  );

  // Hurt Box
  for (const hurtBox of Object.values(boxes.hurt)) {
    drawBox(ctx, camera, position, direction, hurtBox, "#7777FF");
  }

  // Hit Box
  drawBox(
    ctx,
    camera,
    position,
    direction,
    Object.values(boxes.hit),
    "#FF0000"
  );

  // Origin
  drawCross(ctx, camera, position, "#FFFFFF");
}

export function logHit(fighter, hitStrength, hitLocation) {
  console.log(
    `${gameState.fighters[fighter.playerId].id} has hit ${
      gameState.fighters[fighter.opponent.playerId].id
    }'s ${hitLocation} with a ${hitStrength} attack!`
  );
}
