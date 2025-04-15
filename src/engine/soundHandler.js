export function playSound(sound, volume = 0.1) {
  // Reduce volume for now 1 => 0.1
  sound.volume = volume;

  if (!sound.paused && sound.currentTime > 0) {
    sound.currentTime = 0;
  } else {
    sound.play();
  }
}

export function stopSound(sound) {
  sound.pause();
  sound.currentTime = 0;
}
