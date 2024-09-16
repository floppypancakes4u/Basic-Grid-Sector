import { moveCameraTo } from './canvas.js';
import { SM } from './sectorManager.js';

export class PlayerController {
  constructor(ship, canvas) {
    this.ship = ship; // The ship being controlled
    this.canvas = canvas;

    // Movement properties
    this.velocity = { x: 0, y: 0 }; // Velocity of the ship
    this.acceleration = 0.2; // Acceleration when keys are pressed
    this.maxSpeed = 5; // Max speed for the ship
    this.deceleration = 0.95; // Deceleration when no keys are pressed

    // Key state tracking
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
    };

    this.sector = SM.getSectorByCoordinates(this.ship.x, this.ship.y);

    // Event listeners for keyboard input
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));

    window.requestAnimationFrame(() => this.update());
  }

  // Handle keydown events
  handleKeyDown(e) {
    switch (e.key) {
      case 'w':
        this.keys.w = true;
        break;
      case 'a':
        this.keys.a = true;
        break;
      case 's':
        this.keys.s = true;
        break;
      case 'd':
        this.keys.d = true;
        break;
    }
  }

  // Handle keyup events
  handleKeyUp(e) {
    switch (e.key) {
      case 'w':
        this.keys.w = false;
        break;
      case 'a':
        this.keys.a = false;
        break;
      case 's':
        this.keys.s = false;
        break;
      case 'd':
        this.keys.d = false;
        break;
    }
  }

  // Update the ship's position and velocity based on input
  update() {
    // Apply acceleration based on keys pressed
    if (this.keys.w) this.velocity.y -= this.acceleration;
    if (this.keys.s) this.velocity.y += this.acceleration;
    if (this.keys.a) this.velocity.x -= this.acceleration;
    if (this.keys.d) this.velocity.x += this.acceleration;

    // Apply deceleration when no keys are pressed
    this.velocity.x *= this.deceleration;
    this.velocity.y *= this.deceleration;

    // Cap the speed at maxSpeed
    this.velocity.x = Math.max(
      Math.min(this.velocity.x, this.maxSpeed),
      -this.maxSpeed
    );
    this.velocity.y = Math.max(
      Math.min(this.velocity.y, this.maxSpeed),
      -this.maxSpeed
    );

    // Update ship's position based on velocity
    this.ship.x += this.velocity.x;
    this.ship.y += this.velocity.y;

    this.ship.x = Math.round(this.ship.x * 100) / 100;
    this.ship.y = Math.round(this.ship.y * 100) / 100;

    this.sector.updateActorPosition(this.ship);

    // Center the camera on the ship
    this.centerCameraOnShip();

    window.requestAnimationFrame(() => this.update());
  }

  // Method to center the camera on the ship
  centerCameraOnShip() {
    //panX = this.ship.x - this.canvas.width / 2 / zoomFactor;
    //panY = this.ship.y - this.canvas.height / 2 / zoomFactor;

    moveCameraTo(this.ship.x, this.ship.y);
  }
}
