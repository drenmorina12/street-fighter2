export class EntityList {
  entities = [];

  add(EntityClass, time, ...args) {
    this.entities.push(new EntityClass(args, time, this));
  }

  remove(entity) {
    const index = this.entities.indexOf(entity);

    if (index < 0) {
      return;
    }

    this.entities.splice(index, 1);
    // this.entities = this.entities.filter((thisEntity) => thisEntity !== entity);
  }

  update(time, ctx, camera) {
    for (const entity of this.entities) {
      entity.update(time, ctx, camera);
    }
  }

  draw(ctx, camera) {
    for (const entity of this.entities) {
      entity.draw(ctx, camera);
    }
  }
}
