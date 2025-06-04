# Street Fighter 2 JS Clone

This is a browser-based 2D fighting game inspired by Street Fighter II. The game is built entirely using **vanilla JavaScript**, **HTML**, and **CSS**, and features a custom engine with modular architecture and OOP patterns.

---

## 🕹️ Features

- ✅ Two playable characters: **Ryu** and **Ken**
- ✅ Controller & keyboard support
- ✅ Fully animated basic attacks:
  - Light, Medium, and Heavy Punch
  - Light, Medium, and Heavy Kick
- ✅ Jumping (vertical and diagonal)
- ✅ Crouching
- ✅ Animated **Hadouken** special move (input-based)
- ✅ Camera system with sliding stage
- ✅ Depth illusion with animated background
- ✅ UI with animated health bars
- ✅ Proper hitboxes & hurtboxes system
- ✅ Well-organized modular code (OOP with classes/modules)

---

## 🧠 Project Structure

- `src/` – All source code lives here
  - `engine/`, `constants/`, `utils/` – Core engine logic
  - `entities/fighters/` – Character classes & animations
  - `stage/` – Stage logic and rendering
  - `overlays/`, `scenes/` – UI and game states
- `index.html` – Entry point

---

## 🔧 How to Run

Due to browser CORS policies, **you must use a local server** to run the game properly.
