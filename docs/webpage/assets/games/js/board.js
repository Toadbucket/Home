// js/board.js
import { seedDisplay } from "/webpage/assets/games/js/config.js";
import { Tile } from "/webpage/assets/games/js/tile.js";

export class Board {
  constructor() {
    this.tiles = [];
  }

  placeTile(id, x, y) {
    this.tiles = this.tiles.filter(t => !(t.x === x && t.y === y));
    this.tiles.push(new Tile(id, x, y));
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
  }
}





