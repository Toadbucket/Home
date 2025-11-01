// Group logic module
let groupMode = false;
let moveMode = false;
let selectedTiles = [];

export function toggleGroupMode() {
  groupMode = !groupMode;
  return groupMode;
}
export function getGroupMode() {
  return groupMode;
}

export function toggleMoveMode() {
  moveMode = !moveMode;
  return moveMode;
}
export function getMoveMode() {
  return moveMode;
}

export function setSelectedTiles(tiles) {
  selectedTiles = tiles;
}
export function getSelectedTiles() {
  return selectedTiles;
}

export function rotateSelectionCW() {
  if (selectedTiles.length === 1) {
    selectedTiles[0].rot = (selectedTiles[0].rot + 45) % 360;
  } else if (selectedTiles.length > 1) {
    const cx = Math.round(selectedTiles.reduce((sum, t) => sum + t.x, 0) / selectedTiles.length);
    const cy = Math.round(selectedTiles.reduce((sum, t) => sum + t.y, 0) / selectedTiles.length);
    selectedTiles.forEach(t => {
      let dx = t.x - cx;
      let dy = t.y - cy;
      t.x = cx + dy;
      t.y = cy - dx;
    });
  }
}

export function rotateSelectionCC() {
  if (selectedTiles.length === 1) {
    selectedTiles[0].rot = (selectedTiles[0].rot - 45) % 360;
  } else if (selectedTiles.length > 1) {
    const cx = Math.round(selectedTiles.reduce((sum, t) => sum + t.x, 0) / selectedTiles.length);
    const cy = Math.round(selectedTiles.reduce((sum, t) => sum + t.y, 0) / selectedTiles.length);
    selectedTiles.forEach(t => {
      let dx = t.x - cx;
      let dy = t.y - cy;
      t.x = cx + dy;
      t.y = cy - dx;
    });
  }
}
