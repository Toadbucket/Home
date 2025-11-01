// js/board.js
import { seedDisplay } from "/docs/webpage/assets/games/js/config.js";
import { Tile } from "/docs/webpage/assets/games/js/tile.js";

export class Board {
  constructor() {
    this.tiles = [];
  }

  // accept optional rotation when placing (parity with monolithic generator)
  placeTile(id, x, y, rot = 0) {
    this.tiles = this.tiles.filter(t => !(t.x === x && t.y === y));
    const tile = new Tile(id, x, y);
    tile.rot = rot;
    this.tiles.push(tile);
    this.updateSeed();
  }

  getTile(x, y) {
    return this.tiles.find(t => t.x === x && t.y === y);
  }

  deleteTile(tile) {
    this.tiles = this.tiles.filter(t => t !== tile);
    this.updateSeed();
  }

  clear() {
    this.tiles = [];
    this.updateSeed();
  }

  updateSeed() {
    const counts = {};
    this.tiles.forEach(t => counts[t.id] = (counts[t.id] || 0) + 1);
    const seed = Object.entries(counts).map(([id, n]) => `${id}.${n}`).join(" ");
    seedDisplay.textContent = "Seed: " + (seed || "—");

    // push seed into validator input if present (parity with generator.js)
    const seedInput = document.getElementById("spellSeed");
    if (seedInput) seedInput.value = seed;
  }
}

// export a singleton board instance to avoid circular imports
export const board = new Board();






