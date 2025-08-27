const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");
const seedDisplay = document.getElementById("seed");

const cellSize = 60;
const gridSize = 50;

const tileColors = {
  1: "#f87171", // red
  2: "#fbbf24", // yellow
  3: "#34d399", // green
  4: "#60a5fa", // blue
  5: "#c084fc", // purple
  6: "#f472b6"  // pink
};



class Tile {
  constructor(id, x, y) {
    this.id = id;   // value (1–6)
    this.x = x;     // grid x
    this.y = y;     // grid y
    this.rot = 0;   // rotation (90° steps)
  }
}

class Board {
  constructor() { this.tiles = []; }
  placeTile(id, x, y) {
    this.tiles = this.tiles.filter(t => !(t.x===x && t.y===y));
    this.tiles.push(new Tile(id,x,y));
    this.updateSeed();
  }
  getTile(x,y) { return this.tiles.find(t=>t.x===x && t.y===y); }
  deleteTile(tile) {
    this.tiles = this.tiles.filter(t => t!==tile);
    this.updateSeed();
  }
  updateSeed() {
    const counts = {};
    this.tiles.forEach(t => counts[t.id]=(counts[t.id]||0)+1);
    const seed = Object.entries(counts).map(([id,n]) => `${id}.${n}`).join(" ");
    seedDisplay.textContent = "Seed: " + (seed || "—");
  }
}

const board = new Board();
let selectedId = 1;
let selectedTiles = [];
let groupMode = false;

function spawnTile(id) { selectedId = id; }

function toggleGroupMode() {
  groupMode = !groupMode;
  alert("Group Mode: " + (groupMode ? "ON" : "OFF"));
}

function rotateSelection() {
  if(selectedTiles.length === 1) {
    // rotate single tile normally
    selectedTiles[0].rot = (selectedTiles[0].rot+45)%360;
  } else if(selectedTiles.length > 1) {
    // rotate group as a block
    const cx = Math.round(selectedTiles.reduce((sum,t)=>sum+t.x,0)/selectedTiles.length);
    const cy = Math.round(selectedTiles.reduce((sum,t)=>sum+t.y,0)/selectedTiles.length);

    selectedTiles.forEach(t=>{
      let dx = t.x - cx;
      let dy = t.y - cy;
      t.x = cx + dy;
      t.y = cy - dx;
    });
  }
  draw();
}

function deleteSelected() {
  selectedTiles.forEach(t=>board.deleteTile(t));
  selectedTiles = [];
  draw();
}

function deselectOne() {
  selectedTiles.pop();
  draw();
}

function clearSelection() {
  selectedTiles = [];
  draw();
}

function clearBoard() {
  board.tiles = [];
  selectedTiles = [];
  board.updateSeed();
  draw();
}

let moveMode = false;  // toggled by Button


let isDragging = false;       // are we currently dragging?
let dragStart = null;         // grid position where drag started
let dragOffset = {x:0, y:0};  // current offset from drag start
let ghostPos = null;          // ghost tile preview


let groupAnchor = null;

function toggleMoveMode() {
    moveMode = !moveMode;
    if(moveMode && selectedTiles.length > 0) {
        alert("Move mode: ON (drag selected tiles)");
    } else {
        alert("Move mode: OFF");
    }
}

canvas.addEventListener("click", e => {
    if(moveMode) return; // ignore clicks while dragging

    const {gx, gy} = getGridPos(e);
    const tile = board.getTile(gx, gy);

    if(tile){
        if(groupMode){
            if(selectedTiles.includes(tile)){
                selectedTiles = selectedTiles.filter(t=>t!==tile);
            } else {
                selectedTiles.push(tile);
            }
        } else {
            selectedTiles = [tile];
        }
    } else {
        board.placeTile(selectedId, gx, gy);
        selectedTiles = [board.getTile(gx, gy)];
    }

    draw();
});


// touchstart
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

// touchmove
canvas.addEventListener("touchmove", e => {
    if(!isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    const {gx, gy} = getGridPos(touch);

    dragOffset = {x: gx - dragStart.gx, y: gy - dragStart.gy};
    ghostPos = {x: dragStart.gx + dragOffset.x, y: dragStart.gy + dragOffset.y};

    draw();
});

// touchend
canvas.addEventListener("touchend", e => {
    if(!isDragging) return;

    selectedTiles.forEach(t => {
        t.x += dragOffset.x;
        t.y += dragOffset.y;
    });

    isDragging = false;
    dragStart = null;
    dragOffset = {x:0, y:0};
    ghostPos = null;

    draw();
});


function getGridPos(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    gx: Math.floor((e.clientX-rect.left)/cellSize),
    gy: Math.floor((e.clientY-rect.top)/cellSize)
  };
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // grid
  ctx.strokeStyle="#333";
  for(let i=0;i<=gridSize;i++){
    ctx.beginPath();
    ctx.moveTo(i*cellSize,0); ctx.lineTo(i*cellSize,gridSize*cellSize);
    ctx.moveTo(0,i*cellSize); ctx.lineTo(gridSize*cellSize,i*cellSize);
    ctx.stroke();
  }
  // tiles
  board.tiles.forEach(t=>{
    const x=t.x*cellSize+cellSize/2;
    const y=t.y*cellSize+cellSize/2;
    ctx.save();
    ctx.translate(x,y);
    ctx.rotate(t.rot*Math.PI/180);
    ctx.fillStyle = selectedTiles.includes(t) ? "#6ee7b7" : tileColors[t.id];
    ctx.beginPath();
    ctx.rect(-cellSize/2+5,-cellSize/2+5,cellSize-10,cellSize-10);
    ctx.fill();
    ctx.fillStyle="#111";
    ctx.fillText(t.id,-4,4);
    ctx.restore();
// ghost preview for dragging
if(isDragging && ghostPos){
    ctx.save();
    ctx.globalAlpha = 0.5;
    selectedTiles.forEach(t => {
        const gx = t.x + dragOffset.x;
        const gy = t.y + dragOffset.y;
        ctx.fillStyle = "#6ee7b7";
        ctx.fillRect(gx*cellSize+5, gy*cellSize+5, cellSize-10, cellSize-10);
    });
    ctx.restore();
}
  });
}

board.updateSeed();
draw();
