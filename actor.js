import { AIController } from './aiController.js';

export class ShapeObject {
  constructor(x, y, shapeObjectData, color) {
    this.shapeObjectData = shapeObjectData; // e.g., "circle", "triangle", "asteroid"
    this.color = color; // e.g., "red", "blue", etc.
    this.x = x; // World position X
    this.y = y; // World position Y
  }

  getShape() {
    if (this.shapeObjectData.primative) return this.shapeObjectData.primative;
    return this.shapeObjectData.meshData;
  }

  getColor() {
    return this.color;
  }
}

export class Actor extends ShapeObject {
  constructor(x, y, shapeObjectData, color) {
    super(x, y, shapeObjectData, color);
  }

  // Retrieve the shape and color for rendering purposes
}

export class Ship extends Actor {
  constructor(x, y, shapeObjectData, color = 'blue') {
    super(x, y, shapeObjectData, color);
  }
}

export class AIActor extends Actor {
  constructor(x, y, shapeObjectData, color = 'grey') {
    super(x, y, shapeObjectData, color);

    // Automatically spawn AIController for this AIActor
    this.aiController = new AIController(this);

    //console.log('AI Actor created at:', this.x, this.y);
  }
}