import { Control } from "../constants/control";
import { SpecialMoveDirection } from "../constants/fighter";
import * as control from "./InputHandler";

const HISTORY_CAP = 10;

export const constrolHistory = [
  [
    {
      time: 0,
      move: undefined,
      buttons: [false, false, false, false, false, false],
    },
  ],
  [
    {
      time: 0,
      move: undefined,
      buttons: [false, false, false, false, false, false],
    },
  ],
];

export const buttonOrder = [
  Control.LIGHT_KICK,
  Control.MEDIUM_KICK,
  Control.HEAVY_KICK,
  Control.LIGHT_PUNCH,
  Control.MEDIUM_PUNCH,
  Control.HEAVY_PUNCH,
];

function getMoveDirection(controls) {
  if (controls.forward) {
    if (controls.down) return SpecialMoveDirection.FORWARD_DOWN;
    if (controls.up) return SpecialMoveDirection.FORWARD_UP;
    return SpecialMoveDirection.FORWARD;
  } else if (controls.backward) {
    if (controls.down) return SpecialMoveDirection.BACKWARD_DOWN;
    if (controls.up) return SpecialMoveDirection.BACKWARD_UP;
    return SpecialMoveDirection.BACKWARD;
  } else if (controls.down) {
    return SpecialMoveDirection.DOWN;
  } else if (controls.up) {
    return SpecialMoveDirection.UP;
  }

  return SpecialMoveDirection.NONE;
}

function getCurrentControlSnapshot(time, id, direction) {
  const polledControls = {
    forward: control.isForward(id, direction),
    backward: control.isBackward(id, direction),
    down: control.isDown(id, direction),
    up: control.isUp(id, direction),
  };

  return {
    time: time.previous,
    move: getMoveDirection(polledControls),
    buttons: buttonOrder.map((button) => control.isButtonDown(id, button)),
  };
}

function isLastSnapshotDifferent(snapshot, id) {
  if (
    constrolHistory[id][0].move !== snapshot.move ||
    constrolHistory[id][0].buttons.some(
      (button, index) => snapshot.buttons[index] !== button
    )
  ) {
    return true;
  }

  return false;
}

export function pollControl(time, id, direction) {
  const currentControlSnapshot = getCurrentControlSnapshot(time, id, direction);

  if (!isLastSnapshotDifferent(currentControlSnapshot, id)) {
    return;
  }

  constrolHistory[id].unshift[currentControlSnapshot];
  if (constrolHistory[id].length >= HISTORY_CAP) {
    constrolHistory[id].pop();
  }
}
