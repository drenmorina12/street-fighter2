export class Stage {
  constructor() {
    this.image = document.querySelector('img[alt="background"]');
  }

  draw(ctx) {
    ctx.drawImage(background, 0, 0, 384, 224);
  }
}
