import { Camera } from "../engine/Camera.js";
import { Ken, Ryu } from "../entities/fighters/index.js";
import { KenStage } from "../entities/stage/KenStage.js";
import { StatusBar } from "../entities/overlays/StatusBar.js";
import { FpsCounter } from "../entities/overlays/FpsCounter.js";
import { STAGE_MID_POINT, STAGE_PADDING } from "../constants/stage.js";
import { gameState } from "../state/gameState.js";
import {
  FighterAttackStrength,
  FighterId,
  FighterAttackBaseData,
  FIGHTER_HURT_DELAY,
} from "../constants/fighter.js";
import {
  LightHitSplash,
  MediumHitSplash,
  HeavyHitSplash,
  Shadow,
} from "../entities/fighters/shared/index.js";
import { FRAME_TIME } from "../constants/game.js";

export class BattleScene {
  fighters = [];
  camera = undefined;
  shadows = [];
  entities = [];
  hurtTimer = undefined;
  fighterDrawOrder = [0, 1];

  constructor() {
    this.stage = new KenStage();

    this.overlays = [new StatusBar(this.fighters), new FpsCounter()];

    this.startRound();
  }

  getFighterEntityClass(id) {
    switch (id) {
      case FighterId.RYU:
        return Ryu;
      case FighterId.KEN:
        return Ken;
      default:
        throw new Error("Unimplemented fighter entity request!");
    }
  }

  getFighterEntity(fighterState, index) {
    const FighterEntityClass = this.getFighterEntityClass(fighterState.id);

    return new FighterEntityClass(
      index,
      this.handleAttackHit.bind(this),
      this.addEntity.bind(this)
    );
  }

  getFighterEntities() {
    const fighterEntities = gameState.fighters.map(
      this.getFighterEntity.bind(this)
    );

    fighterEntities[0].opponent = fighterEntities[1];
    fighterEntities[1].opponent = fighterEntities[0];

    return fighterEntities;
  }

  getHitSplashClass(strength) {
    switch (strength) {
      case FighterAttackStrength.LIGHT:
        return LightHitSplash;
      case FighterAttackStrength.MEDIUM:
        return MediumHitSplash;
      case FighterAttackStrength.HEAVY:
        return HeavyHitSplash;
      default:
        throw new Error("Unknown strength requested!");
    }
  }

  addEntity(EntityClass, ...args) {
    this.entities.push(new EntityClass(...args, this.removeEntity.bind(this)));
  }

  removeEntity(entity) {
    const index = this.entities.indexOf(entity);

    if (index < 0) {
      return;
    }

    this.entities.splice(index, 1);
    // this.entities = this.entities.filter((thisEntity) => thisEntity !== entity);
  }

  handleAttackHit(time, playerId, opponentId, position, strength) {
    gameState.fighters[opponentId].score +=
      FighterAttackBaseData[strength].score;

    gameState.fighters[playerId].hitPoints -=
      FighterAttackBaseData[strength].damage;

    this.hurtTimer = time.previous + FIGHTER_HURT_DELAY * FRAME_TIME;
    this.fighterDrawOrder = [opponentId, playerId]; // The attacker will be drawn before the opponent
    if (!position) {
      return;
    }

    this.addEntity(
      this.getHitSplashClass(strength),
      position.x,
      position.y,
      playerId
    );
  }

  startRound() {
    this.fighters = this.getFighterEntities();

    this.camera = new Camera(
      STAGE_MID_POINT + STAGE_PADDING - 192,
      16,
      this.fighters
    );

    this.shadows = this.fighters.map((fighter) => new Shadow(fighter));
  }

  updateFighters(time, ctx) {
    for (const fighter of this.fighters) {
      if (time.previous < this.hurtTimer) {
        fighter.updateHurtShake(time, this.hurtTimer);
      } else {
        fighter.update(time, ctx, this.camera);
      }
    }
  }

  updateShadows(time, ctx) {
    for (const shadow of this.shadows) {
      shadow.update(time, ctx, this.camera);
    }
  }

  updateEntities(time, ctx) {
    for (const entity of this.entities) {
      entity.update(time, ctx, this.camera);
    }
  }

  updateOverlays(time, ctx) {
    for (const overlay of this.overlays) {
      overlay.update(time, ctx, this.camera);
    }
  }

  update(time, ctx) {
    this.updateFighters(time, ctx);
    this.updateShadows(time, ctx);
    this.stage.update(time);
    this.updateEntities(time, ctx);
    this.camera.update(time, ctx);
    this.updateOverlays(time, ctx);
  }

  drawFighters(ctx) {
    for (const fighterId of this.fighterDrawOrder) {
      this.fighters[fighterId].draw(ctx, this.camera);
    }
  }

  drawShadows(ctx) {
    for (const shadow of this.shadows) {
      shadow.draw(ctx, this.camera);
    }
  }

  drawEntities(ctx) {
    for (const entity of this.entities) {
      entity.draw(ctx, this.camera);
    }
  }

  drawOverlays(ctx) {
    for (const overlay of this.overlays) {
      overlay.draw(ctx, this.camera);
    }
  }

  draw(ctx) {
    this.stage.drawBackground(ctx, this.camera);
    this.drawShadows(ctx);
    this.drawFighters(ctx);
    this.drawEntities(ctx);
    this.stage.drawForeground(ctx, this.camera);
    this.drawOverlays(ctx);
  }
}
