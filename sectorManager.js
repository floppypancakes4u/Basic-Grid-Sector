import { Sector } from './sectors.js';

class SectorManager {
  constructor() {
    if (!SectorManager.instance) {
      this.sectors = [];
      SectorManager.instance = this;
    }
    return SectorManager.instance;
  }

  spawnSector(x, y, width, height) {
    let newSector = new Sector(x, y, width, height);

    this.sectors.push(newSector);
    return newSector;
  }

  // Add a sector to the manager
  addSector(sector) {
    this.sectors.push(sector);
  }

  // This takes the x and y of the actor and automatically handles the sector it needs to be in.
  actorEnter(actor) {
    let enteringSector = this.ensureSectorExistsForActor(actor);

    if (enteringSector) {
      enteringSector.enterSector(actor);
    } else {
    }
  }

  spawnActor(data) {
    if (data.x == undefined || data.y == undefined) return;

    let sector = this.ensureSectorExistsForActor({x: data.x, y: data.y});

    // create actor here
    sector.spawnActor(data);
  }

  // Look up a sector by world coordinates (x, y)
  getSectorByCoordinates(worldX, worldY) {
    return this.sectors.find(
      (sector) =>
        worldX >= sector.x &&
        worldX <= sector.x + sector.width &&
        worldY >= sector.y &&
        worldY <= sector.y + sector.height
    );
  }

  migrateActorToSector(actor, oldSector) {
    let newSector = this.ensureSectorExistsForActor(actor);

    if (newSector) {
      newSector.enterSector(actor);
      oldSector.deleteMigratingActor(actor);
    } else {
    }
  }

  ensureSectorExistsAtLocation(x, y) {
    let sector = this.getSectorByCoordinates(x, y);
    if (!sector) {
      // Calculate the top-left corner of the new sector, aligning to a 1000x1000 grid
      const newSectorX = Math.floor(x / 1000) * 1000;
      const newSectorY = Math.floor(y / 1000) * 1000;

      // Spawn the new sector
      sector = this.spawnSector(newSectorX, newSectorY, 1000, 1000);

      // console.log(
      //   `Spawned new sector at (${newSectorX}, ${newSectorY}) to cover actor at (${x}, ${y}).`
      // );
    }

    return sector;
  }

  ensureSectorExistsForActor(actor) {
    return this.ensureSectorExistsAtLocation(actor.x, actor.y);
  }

  // Method to retrieve all sectors
  getAllSectors() {
    return this.sectors;
  }
}

// Export the singleton instance
export const SM = new SectorManager();
//Object.freeze(SM); // Ensure it's immutable
//export default SM;
