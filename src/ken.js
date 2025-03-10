import { Fighter } from "./Fighter.js";

export class Ken extends Fighter {
  constructor({ position, velocity }) {
    super({ name: "Ken", position, velocity });

    this.image = document.querySelector('img[alt="ken"]');
  }
}
