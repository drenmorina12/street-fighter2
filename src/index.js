import { Ken } from "./entities/fighters/Ken.js";
import { Stage } from "./entities/Stage.js";
import { Ryu } from "./entities/fighters/Ryu.js";
import { FpsCounter } from "./entities/FpsCounter.js";
import { STAGE_FLOOR } from "./constants/stage.js";
import { FighterDirection, FighterState } from "./constants/fighter.js";

function populateMoveDropdown() {
  const dropdown = document.querySelector("#state-dropdown");

  Object.entries(FighterState).forEach(([, value]) => {
    const option = document.createElement("option");
    option.setAttribute("value", value);
    option.innerText = value;
    dropdown.appendChild(option);
  });
}

function handleFormSubmit(event, fighters) {
  event.preventDefault();

  const selectedCheckboxes = Array.from(
    event.target.querySelectorAll("input:checked")
  ).map((checkbox) => checkbox.value);

  const options = event.target.querySelector("select");
  fighters.forEach((fighter) => {
    if (selectedCheckboxes.includes(fighter.name)) {
      console.log("INSIDE");
      fighter.changeState(options.value);
    }
  });
}

window.addEventListener("load", function () {
  populateMoveDropdown();

  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = false;

  const fighters = [
    new Ken({
      position: {
        x: 104,
        y: STAGE_FLOOR,
      },
      direction: FighterDirection.RIGHT,
    }),

    new Ryu({
      position: {
        x: 280,
        y: STAGE_FLOOR,
      },
      direction: FighterDirection.LEFT,
    }),
  ];

  const entities = [new Stage(), ...fighters, new FpsCounter()];

  let frameTime = {
    previous: 0,
    secondsPassed: 0,
  };

  function frame(time) {
    window.requestAnimationFrame(frame);

    frameTime = {
      secondsPassed: (time - frameTime.previous) / 1000,
      previous: time,
    };

    for (const entity of entities) {
      entity.update(frameTime, ctx);
    }

    for (const entity of entities) {
      entity.draw(ctx);
    }
  }

  this.document.addEventListener("submit", (event) =>
    handleFormSubmit(event, fighters)
  );

  window.requestAnimationFrame(frame);
});
