// Tile logic module
import { Tile } from './board.js';

export function createTile(type, x, y) {
  return new Tile(type, x, y);
}

export function rotateTile(tile, direction) {
  // direction: 'cw' or 'cc'
  if (direction === 'cw') {
    tile.rot = (tile.rot + 45) % 360;
  } else if (direction === 'cc') {
    tile.rot = (tile.rot - 45) % 360;
  }
}
