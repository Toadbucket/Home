// js/controls.js
import { messageBox } from "assets/games/js/config.js";
import { draw } from "assets/games/js/draw.js";
import { board } from "assets/games/js/main.js";

export let selectedId = 1;
export let selectedTiles = [];
export let groupMode = false;
export let moveMode = false;

// --- selection & modes ---
export function spawnTile(id) { selectedId = id; }

export function toggleGroupMode() {
  groupMode = !groupMode;
  messageBox.innerText = "group mode " + (groupMode ? "ON" : "OFF");
}

export function toggleMoveMode() {
  moveMode = !moveMode;
  messageBox.innerText = "move mode " + (moveMode ? "ON" : "OFF");
}

// --- rotation ---
export function rotateSelectionCW() {
  if(selectedTiles.length === 1) {
    selectedTiles[0].rot = (selectedTiles[0].rot + 45) % 360;
  } else if(selectedTiles.length > 1) {
    rotateGroup(1);
  }
  draw(board);
}

export function rotateSelectionCC() {
  if(selectedTiles.length === 1) {
    selectedTiles[0].rot = (selectedTiles[0].rot - 45) % 360;
  } else if(selectedTiles.length > 1) {
    rotateGroup(-1);
  }
  draw(board);
}

function rotateGroup(dir) {
  const cx = Math.round(selectedTiles.reduce((s,t)=>s+t.x,0)/selectedTiles.length);
  const cy = Math.round(selectedTiles.reduce((s,t)=>s+t.y,0)/selectedTiles.length);
  selectedTiles.forEach(t => {
    let dx = t.x - cx;
    let dy = t.y - cy;
    if(dir === 1) { // CW
      t.x = cx + dy;
      t.y = cy - dx;
    } else { // CCW
      t.x = cx - dy;
      t.y = cy + dx;
    }
  });
}

// --- deletion & clearing ---
export function deleteSelected() {
  selectedTiles.forEach(t => board.deleteTile(t));
  selectedTiles = [];
  draw(board);
}

export function deselectOne() {
  selectedTiles.pop();
  draw(board);
}

export function clearSelection() {
  selectedTiles = [];
  draw(board);
}

export function clearBoard() {
  board.clear();
  selectedTiles = [];
  draw(board);
}

