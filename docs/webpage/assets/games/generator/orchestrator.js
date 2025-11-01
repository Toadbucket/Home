// Orchestrator: imports and coordinates all modules
import { Board, draw, cellSize, gridSize, tileColors } from './board.js';
import * as tile from './tile.js';
import * as group from './group.js';
import * as ui from './ui.js';
import * as spell from './spell.js';
import * as utils from './utils.js';

// Setup canvas and context
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const seedDisplay = document.getElementById('seed');
canvas.width = cellSize * gridSize;
canvas.height = cellSize * gridSize;

// Board instance
const board = new Board(seedDisplay);

// Image for tiles
const tileImg = new Image();
tileImg.src = 'assets/media/tile.png';
let imageLoaded = false;
tileImg.onload = () => {
  imageLoaded = true;
  draw(board, ctx, canvas, group.getSelectedTiles(), {x:0,y:0}, null, false, imageLoaded, tileImg);
};

// Initial draw
board.updateSeed();
draw(board, ctx, canvas, group.getSelectedTiles(), {x:0,y:0}, null, false, imageLoaded, tileImg);

// Expose orchestrator API to window
window.runetileOrchestrator = {
  board,
  tile,
  group,
  ui,
  spell,
  utils,
  canvas,
  ctx,
  tileImg,
  imageLoaded,
  draw: () => draw(board, ctx, canvas, group.getSelectedTiles(), {x:0,y:0}, null, false, imageLoaded, tileImg)
};

// Initialize UI
ui.initUI();
