// js/draw.js
import { canvas, ctx, cellSize, gridSize, tileColors } from "/assets/games/js/config.js";
import { selectedTiles } from "/assets/games/js/controls.js";

let imageLoaded = false;
const tileImg = new Image();
tileImg.src = "assets/media/tile.png";
tileImg.onload = () => { imageLoaded = true; };

export function draw(board, dragState={}) {
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // --- grid ---
  ctx.strokeStyle="#333";
  for(let i=0;i<=gridSize;i++){
    ctx.beginPath();
    ctx.moveTo(i*cellSize,0);
    ctx.lineTo(i*cellSize,gridSize*cellSize);
    ctx.moveTo(0,i*cellSize);
    ctx.lineTo(gridSize*cellSize,i*cellSize);
    ctx.stroke();
  }

  // --- tiles ---
  board.tiles.forEach(t => {
    const cx = t.x * cellSize + cellSize/2;
    const cy = t.y * cellSize + cellSize/2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t.rot * Math.PI/180);

    if (t.id > 0 && imageLoaded) {
      ctx.drawImage(tileImg, -cellSize/2, -cellSize/2, cellSize, cellSize);
    } else {
      ctx.fillStyle = t.id === 0 ? "#000" : tileColors[t.id];
      ctx.fillRect(-cellSize/2, -cellSize/2, cellSize, cellSize);
    }

    // tint overlay
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = selectedTiles.includes(t) ? .7 : .3;
    ctx.fillStyle = selectedTiles.includes(t) ? "#BA4126" : tileColors[t.id];
    ctx.fillRect(-cellSize/2, -cellSize/2, cellSize, cellSize);

    // reset blend
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    // ID text
    ctx.fillStyle = "#111";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.id, 0, 0);

    ctx.restore();
  });

  // --- ghost preview for dragging ---
  if (dragState.isDragging && dragState.ghostPos) {
    ctx.save();
    ctx.globalAlpha = 0.5;
    selectedTiles.forEach(t => {
      const gx = (t.x + dragState.dragOffset.x) * cellSize + 5;
      const gy = (t.y + dragState.dragOffset.y) * cellSize + 5;
      ctx.fillStyle = "#6ee7b7";
      ctx.fillRect(gx, gy, cellSize - 10, cellSize - 10);
    });
    ctx.restore();
  }
}




