// js/events.js
import { canvas, cellSize } from "/docs/webpage/assets/games/js/config.js";
import { board } from "/docs/webpage/assets/games/js/board.js";
import { selectedTiles, groupMode, selectedId, moveMode } from "/docs/webpage/assets/games/js/controls.js";
import { draw } from "/docs/webpage/assets/games/js/draw.js";

// drag state
let isDragging = false;
let dragStart = null;
let dragOffset = {x:0, y:0};
let ghostPos = null;

export function setupEvents() {
  // --- click placement/selection ---
  canvas.addEventListener("click", e => {
    if(moveMode) return;
    const {gx, gy} = getGridPos(e);
    const tile = board.getTile(gx, gy);

    if(tile){
      if(groupMode){
        if(selectedTiles.includes(tile)){
          selectedTiles.splice(selectedTiles.indexOf(tile),1);
        } else {
          selectedTiles.push(tile);
        }
      } else {
        selectedTiles.length = 0;
        selectedTiles.push(tile);
      }
    } else {
      board.placeTile(selectedId, gx, gy);
      selectedTiles.length = 0;
      selectedTiles.push(board.getTile(gx, gy));
    }
    draw(board);
  });

  // --- touch support (mirrors monolithic generator.js) ---
  canvas.addEventListener("touchstart", e => {
    if(!moveMode) return;
    e.preventDefault();
    const touch = e.touches[0];
    const {gx, gy} = getGridPos(touch);
    const tile = board.getTile(gx, gy);
    if(selectedTiles.includes(tile)){
        isDragging = true;
        dragStart = {gx, gy};
        dragOffset = {x:0, y:0};
    }
  });

  canvas.addEventListener("touchmove", e => {
    if(!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const {gx, gy} = getGridPos(touch);
    dragOffset = {x: gx - dragStart.gx, y: gy - dragStart.gy};
    ghostPos = {x: dragStart.gx + dragOffset.x, y: dragStart.gy + dragOffset.y};
    draw(board, {isDragging, dragOffset, ghostPos});
  });

  canvas.addEventListener("touchend", e => {
    if(!isDragging) return;
    selectedTiles.forEach(t => {
      t.x += dragOffset.x;
      t.y += dragOffset.y;
    });
    isDragging = false;
    dragStart = null;
    dragOffset = {x:0,y:0};
    ghostPos = null;
    draw(board);
  });

  // --- mouse drag ---
  canvas.addEventListener("mousedown", e => {
    if (!moveMode) return;
    const {gx, gy} = getGridPos(e);
    const tile = board.getTile(gx, gy);

    if (tile && selectedTiles.includes(tile)) {
      isDragging = true;
      dragStart = {gx, gy};
      dragOffset = {x:0,y:0};
    }
  });

  canvas.addEventListener("mousemove", e => {
    if (!isDragging) return;
    const {gx, gy} = getGridPos(e);
    dragOffset = {x: gx - dragStart.gx, y: gy - dragStart.gy};
    ghostPos = {x: dragStart.gx + dragOffset.x, y: dragStart.gy + dragOffset.y};
    draw(board, {isDragging, dragOffset, ghostPos});
  });

  canvas.addEventListener("mouseup", e => {
    if (!isDragging) return;
    selectedTiles.forEach(t => {
      t.x += dragOffset.x;
      t.y += dragOffset.y;
    });
    isDragging = false;
    dragStart = null;
    dragOffset = {x:0,y:0};
    ghostPos = null;
    draw(board);
  });
}

function getGridPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    gx: Math.floor((e.clientX-rect.left)/cellSize),
    gy: Math.floor((e.clientY-rect.top)/cellSize)
  };
}







