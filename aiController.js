import { SM } from './sectorManager.js';

export class AIController {
  constructor(aiActor) {
    this.aiActor = aiActor; // The AI-controlled actor
    this.velocity = { x: 0, y: 0 }; // Velocity of the actor
    this.acceleration = Math.random() * 0.3; // Acceleration for random movement
    this.maxSpeed = Math.random() * 20; // Max speed for the AI actor

    this.spawnPoint = { x: this.aiActor.x, y: this.aiActor.y }; // Actor's spawn location
    this.movementType = this.getRandomMovementType(); // Randomly choose a movement type
    this.migrateTimer = 0;

    this.patrolTarget = { x: 0, y: 0 };

    this.sector = SM.getSectorByCoordinates(this.aiActor.x, this.aiActor.y);

    // Start updating the AI movement
    window.requestAnimationFrame(() => this.update());
  }

  // Function to select a random movement type
  getRandomMovementType() {
    const types = ['Patrol', 'Roam', 'Orbit', 'Migrate'];
    return types[Math.floor(Math.random() * types.length)];
  }

  // Function to handle Patrol movement
  patrol() {
    const distanceToTarget = this.getDistance(this.aiActor, this.patrolTarget);
    if (!this.patrolTarget || distanceToTarget < 10) {
      // Pick a new target point
      const randomX = this.spawnPoint.x + (Math.random() * 6000 - 3000);
      const randomY = this.spawnPoint.y + (Math.random() * 6000 - 3000);

      const distanceFromSpawn = this.getDistance(
        { x: randomX, y: randomY },
        this.spawnPoint
      );

      if (distanceFromSpawn > 2000 && distanceFromSpawn < 5000) {
        this.patrolTarget = { x: randomX, y: randomY };
      }
    }

    // Move towards the patrol target
    this.moveTowards(this.patrolTarget);
  }

  // Function to handle Roam movement
  roam() {
    this.velocity.x += (Math.random() - 0.5) * this.acceleration;
    this.velocity.y += (Math.random() - 0.5) * this.acceleration;

    this.velocity.x *= 0.98;
    this.velocity.y *= 0.98;

    this.velocity.x = Math.max(
      Math.min(this.velocity.x, this.maxSpeed),
      -this.maxSpeed
    );
    this.velocity.y = Math.max(
      Math.min(this.velocity.y, this.maxSpeed),
      -this.maxSpeed
    );

    this.aiActor.x += this.velocity.x;
    this.aiActor.y += this.velocity.y;
  }

  // Function to handle Orbit movement
  orbit() {
    if (!this.orbitAngle) this.orbitAngle = 0;
    if (!this.orbitRadius) {
      this.orbitRadius = 250 + Math.random() * 750; // Random radius between 250 and 1000
    }

    this.orbitAngle += 0.01; // Small increment for orbiting

    this.aiActor.x =
      this.spawnPoint.x + this.orbitRadius * Math.cos(this.orbitAngle);
    this.aiActor.y =
      this.spawnPoint.y + this.orbitRadius * Math.sin(this.orbitAngle);
  }

  // Function to handle Migrate movement
  migrate(deltaTime) {
    this.migrateTimer += deltaTime;

    if (!this.aiActor || !this.migrateTarget) return;

    const distanceToTarget = this.getDistance(this.aiActor, this.migrateTarget);

    // Check if the actor has reached the target or if the migrateTimer exceeds 20 seconds
    if (
      distanceToTarget < 10 ||
      this.migrateTimer > 20000 ||
      !this.migrateTarget
    ) {
      const randomAngle = Math.random() * Math.PI * 2;
      this.migrateTarget = {
        x: this.aiActor.x + 1000 * Math.cos(randomAngle),
        y: this.aiActor.y + 1000 * Math.sin(randomAngle),
      };
      this.migrateTimer = 0;
    }

    this.moveTowards(this.migrateTarget);
  }

  // Move the actor towards a target
  moveTowards(target) {
    const direction = {
      x: target.x - this.aiActor.x,
      y: target.y - this.aiActor.y,
    };
    const distance = Math.sqrt(direction.x ** 2 + direction.y ** 2);

    if (distance > 0) {
      this.velocity.x = (direction.x / distance) * this.maxSpeed;
      this.velocity.y = (direction.y / distance) * this.maxSpeed;
    }

    this.aiActor.x += this.velocity.x;
    this.aiActor.y += this.velocity.y;
  }

  // Utility to calculate distance between two points
  getDistance(point1, point2) {
    const dx = point1.x - point2.x;
    const dy = point1.y - point2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Update the AI based on its movement type
  update() {
    const deltaTime = 16; // Approximate frame time in ms (60 FPS)

    switch (this.movementType) {
      case 'Patrol':
        this.patrol();
        break;
      case 'Roam':
        this.roam();
        break;
      case 'Orbit':
        this.orbit();
        break;
      case 'Migrate':
        this.migrate(deltaTime);
        break;
    }

    // Ensure the position is rounded for better precision
    this.aiActor.x = Math.round(this.aiActor.x * 100) / 100;
    this.aiActor.y = Math.round(this.aiActor.y * 100) / 100;

    // Update the actor's position in the current sector
    this.sector.updateActorPosition(this.aiActor);

    // Continue the loop
    window.requestAnimationFrame(() => this.update());
  }
}
