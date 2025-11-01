// Board logic module
// Board and tile management, drawing, grid logic
export const cellSize = 40;
export const gridSize = 15;

export const tileColors = {
  1: "#f87171", // red
  2: "#fbbf24", // yellow
  3: "#34d399", // green
  4: "#60a5fa", // blue
  5: "#c084fc", // purple
  6: "#f472b6"  // pink
};

export class Tile {
  constructor(id, x, y) {
    this.id = id;   // value (1–6)
    this.x = x;     // grid x
    this.y = y;     // grid y
    this.rot = 0;   // rotation (90° steps)
  }
}

export class Board {
  constructor(seedDisplay) {
    this.tiles = [];
    this.seedDisplay = seedDisplay;
  }
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
  updateSeed() {
    const counts = {};
    this.tiles.forEach(t => counts[t.id] = (counts[t.id] || 0) + 1);
    const seed = Object.entries(counts).map(([id, n]) => `${id}.${n}`).join(" ");
    if (this.seedDisplay) {
      this.seedDisplay.textContent = "Seed: " + (seed || "—");
    }
    // Push seed into validator input
    const seedInput = document.getElementById("spellSeed");
    if (seedInput) seedInput.value = seed;
  }
}

export function getGridPos(e, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    gx: Math.floor((e.clientX - rect.left) / cellSize),
    gy: Math.floor((e.clientY - rect.top) / cellSize)
  };
}

// Drawing logic
export function draw(board, ctx, canvas, selectedTiles, dragOffset, ghostPos, isDragging, imageLoaded, tileImg) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#333";
  for (let i = 0; i <= gridSize; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, gridSize * cellSize);
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(gridSize * cellSize, i * cellSize);
    ctx.stroke();
  }

  board.tiles.forEach(t => {
    const cx = t.x * cellSize + cellSize / 2;
    const cy = t.y * cellSize + cellSize / 2;
    const color = selectedTiles.includes(t) ? "#6ee7b7" : tileColors[t.id];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t.rot * Math.PI / 180);
    const offsetX = -cellSize / 2;
    const offsetY = -cellSize / 2;
    if (t.id > 0 && imageLoaded) {
      ctx.drawImage(tileImg, offsetX - 1, offsetY + 3, cellSize + 3, cellSize + 3);
    } else {
      ctx.fillStyle = t.id === 0 ? "#000" : tileColors[t.id];
      ctx.fillRect(offsetX + 5, offsetY + 5, cellSize - 10, cellSize - 10);
    }
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = selectedTiles.includes(t) ? .7 : .3;
    ctx.fillStyle = selectedTiles.includes(t) ? "#BA4126" : tileColors[t.id];
    ctx.fillRect(offsetX, offsetY + 7, cellSize, cellSize - 10);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#111";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.id, 0, 0);
    ctx.restore();
  });

  if (isDragging && ghostPos) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    selectedTiles.forEach(t => {
      const gx = (t.x + dragOffset.x) * cellSize + 5;
      const gy = (t.y + dragOffset.y) * cellSize + 5;
      ctx.fillStyle = "#6ee7b7";
      ctx.fillRect(gx, gy, cellSize - 10, cellSize - 10);
    });
    ctx.restore();
  }
}
