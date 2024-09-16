import { SM } from './sectorManager.js';
import { ShapeObject, Actor } from './actor.js';

export var sectors = [];

export class Sector {
  constructor(x, y, width, height) {
    this.x = x; // World position X of the sector
    this.y = y; // World position Y of the sector
    this.width = width; // Width of the sector
    this.height = height; // Height of the sector
    this.actors = []; // Array to store all actors in this sector
    this.migratingActors = [];

    // Generate a random color for the sector border
    this.borderColor = this.getRandomColor();

    sectors.push(this);
  }

  // Method to spawn a new actor in the sector
  spawnActor(x, y, shapeObject) {
    const newActor = new Actor(x, y, shapeObject);
    this.actors.push(newActor);
  }

  // Method to delete an actor from the sector
  removeActorFromActorArray(actor) {
    this.actors = this.actors.filter((a) => a !== actor);
  }

  deleteMigratingActor(actor) {
    this.migratingActors = this.migratingActors.filter((a) => a !== actor);
    //console.log('Migrating Actors Length:', this.migratingActors.length);
  }

  updateActorPosition(newActor) {
    return;

    // Find the index of the actor in the array by comparing actor IDs or some unique property
    const index = this.actors.findIndex((actor) => actor.id === newActor.id);

    if (index !== -1) {
      // Save the current actor data in a local variable
      const oldActor = this.actors[index];

      //console.log(oldActor.x, newActor.x, oldActor.y != newActor.y)

      // Compare the x and y positions of the old and new actor
      if (oldActor.x != newActor.x || oldActor.y != newActor.y) {
        console.log(
          `Actor position changed from (${oldActor.x}, ${oldActor.y}) to (${newActor.x}, ${newActor.y})`
        );
      }

      // Update the actor in the array with the new data
      this.actors[index] = newActor;
    } else {
      console.log('Actor not found');
    }
  }

  enterSector(actor) {
    this.actors.push(actor);
    //console.log(`Actor entered sector at (${actor.x}, ${actor.y}).`);

    this.onEnterSector(actor);
  }

  // Method to handle when an actor enters the sector
  onEnterSector(actor) {}

  leaveSector(actor) {
    this.removeActorFromActorArray(actor);
    //console.log(`Actor left sector at (${actor.x}, ${actor.y}).`);

    this.onLeaveSector(actor);

    //SM.migrateActorToSector(actor, this);
  }

  // Method to handle when an actor leaves the sector
  onLeaveSector(actor) {
    //this.deleteActor(actor);
  }

  // Method to handle migrating an actor out of the sector (for multi-sector systems)
  migrateSendActor(actor, targetSector) {
    this.onLeaveSector(actor);
    targetSector.onEnterSector(actor);
  }

  // Method to handle receiving an actor migrating from another sector
  migrateReceiveActor(actor) {
    this.onEnterSector(actor);
  }

  // Method to draw the sector's border and display stats
  drawBorder(ctx, panX, panY, zoomFactor) {
    ctx.save();
    ctx.scale(zoomFactor, zoomFactor);
    ctx.translate(-panX, -panY);

    // Draw sector border in random color
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);

    // Display sector stats in the top-left corner
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.fillText(
      `Sector Size: ${this.width}x${this.height}`,
      this.x + 5,
      this.y + 15
    );
    ctx.fillText(`Actors: ${this.actors.length}`, this.x + 5, this.y + 30);
    ctx.fillText(
      `Migrating Actors: ${this.migratingActors.length}`,
      this.x + 5,
      this.y + 45
    );

    ctx.restore();
  }

  // Method to draw all actors in the sector
  drawActors(ctx, panX, panY, zoomFactor) {
    ctx.save();
    ctx.scale(zoomFactor, zoomFactor);
    ctx.translate(-panX, -panY);

    // Combine actors
    const combinedActors = this.actors.concat(this.migratingActors);

    for (let actor of combinedActors) {
      ctx.fillStyle = actor.getColor();

      // Draw the shape
      switch (actor.getShape()) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(actor.x, actor.y, 20, 0, 2 * Math.PI); // Fixed radius for now
          ctx.fill();
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(actor.x, actor.y - 20); // Top
          ctx.lineTo(actor.x - 20, actor.y + 20); // Bottom left
          ctx.lineTo(actor.x + 20, actor.y + 20); // Bottom right
          ctx.closePath();
          ctx.fill();
          break;
        case 'asteroid':
          ctx.fillRect(actor.x - 10, actor.y - 10, 20, 20); // Placeholder asteroid
          break;
        default:
          break;
      }

      // Check if movementType and migrateTimer are defined and draw the text above the shape
      if (actor.aiController?.movementType) {
        ctx.fillStyle = '#fff';
        ctx.font = '12px Arial'; // Set font

        let text = '';

        text += `Movement: ${actor.aiController.movementType}`;

        if (actor.aiController?.migrateTimer) {
          text += ` | Timer: ${Math.round(
            actor.aiController?.migrateTimer / 1000
          )}s`;
        }

        // Draw the text above the actor
        ctx.fillText(text, actor.x - 20, actor.y - 30); // Positioning the text above the actor
      }
    }

    ctx.restore();
  }

  // Helper method to generate a random color for the sector border
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  checkActorPositions() {
    this.actors.forEach((actor) => {
      // Check if the actor is within the sector's bounds
      const isInsideSector =
        actor.x >= this.x &&
        actor.x <= this.x + this.width &&
        actor.y >= this.y &&
        actor.y <= this.y + this.height;

      // If the actor is no longer inside the sector, call onLeaveSector
      if (!isInsideSector) {
        this.leaveSector(actor);
        this.migratingActors.push(actor);
        SM.migrateActorToSector(actor, this);
        this.removeActorFromActorArray(actor);
      }
    });
  }
}
