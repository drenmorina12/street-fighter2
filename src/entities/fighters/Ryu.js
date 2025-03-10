import { Fighter } from "./Fighter.js";

export class Ryu extends Fighter {
  constructor({ position, velocity }) {
    super({ name: "Ryu", position, velocity });

    this.image = document.querySelector('img[alt="ryu"]');
  }
}
