import {
  setCanvasSize,
  canvasRenderLoop,
  initEventListeners,
} from './canvas.js';
//import { SectorManager } from './sectors.js';
//import { Sector } from './sectors.js';
import { ShapeObject, Actor, Ship, AIActor } from './actor.js';
import { PlayerController } from './playerController.js';
import { SM } from './sectorManager.js';

export function initGame() {
  setCanvasSize();
  initEventListeners();
  //SectorManager.initialize();
  //SectorManager.addPlayerShip(300, 300, 20); // Adding the player ship
  window.requestAnimationFrame(canvasRenderLoop);

  let sector = SM.spawnSector(0, 0, 1000, 1000);
  //let sector = SM.spawnSector(-500, -500, 500, 500);

  // Example of spawning actors
  SM.actorEnter(new ShapeObject(100, 150, { primative: 'circle' }, 'blue'));
  SM.actorEnter(new ShapeObject(300, 400, { primative: 'triangle' }, 'red'));

  //let randomActorCount = Math.floor(1000 + Math.random() * 50);
  let randomActorCount = 3
  for (let i = 0; i < randomActorCount; i++) {
    let x = Math.random() * 4000 - 2000;
    let y = Math.random() * 4000 - 2000;
    SM.ensureSectorExistsAtLocation(x, y);
    let newActor = new AIActor(x, y, { primative: 'triangle' });
    SM.actorEnter(newActor);
  }

  console.log('Spawned', randomActorCount, 'actors');

  const ship = new Ship(100, 100, { primative: 'triangle' }, 'yellow'); // Create the player's ship
  SM.actorEnter(ship);
  const playerController = new PlayerController(ship, canvas); // Create the player controller
}

initGame();
