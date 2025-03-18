export class Stage {
  constructor() {
    this.image = document.querySelector('img[alt="stage"]');

    // prettier-ignore
    this.frames = new Map([
      ["stage-background", [72, 208, 768, 176]],
      ["stage-boat", [8, 16, 521, 180]],
      ["stage-floor", [8, 392, 896, 72]],
    ]);
  }

  update() {}

  drawFrame(ctx, frameKey, x, y) {
    const [sourceX, sourceY, sourceWidth, sourceHeight] =
      this.frames.get(frameKey);

    ctx.drawImage(
      this.image,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      x,
      y,
      sourceWidth,
      sourceHeight
    );
  }

  draw(ctx) {
    this.drawFrame(ctx, "stage-background", -192, -16);
    this.drawFrame(ctx, "stage-boat", -128, -16);
    this.drawFrame(ctx, "stage-floor", -256, 160);
  }
}
