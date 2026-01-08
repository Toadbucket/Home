const canvas       = document.getElementById("board");
const ctx          = canvas.getContext("2d");
const seedDisplay  = document.getElementById("seed");
// … other constants and classes …
const cellSize = 40;
const gridSize = 15;

// Tile Style Configuration - Separate base and ID label
let currentBaseStyle = "default";
let currentIdStyle = "default";

// Base tile image paths
const baseTilePaths = {
  default: "assets/media/tile.png",
  glyphs: "assets/media/glyphs/base-tile.png",
  runes: "assets/media/runes/base-tile.png",
  custom: "assets/media/custom/base-tile.png"
};

// ID label/glyph symbol paths (transparent overlays)
const idLabelPaths = {
  digits: {
    1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 0: null
  },
  glyphs: {
    1: "assets/media/glyphs/glyph-1.png",
    2: "assets/media/glyphs/glyph-2.png",
    3: "assets/media/glyphs/glyph-3.png",
    4: "assets/media/glyphs/glyph-4.png",
    5: "assets/media/glyphs/glyph-5.png",
    6: "assets/media/glyphs/glyph-6.png",
    0: "assets/media/glyphs/glyph-0.png"
  },
  runes: {
    1: "assets/media/runes/symbol-1.png",
    2: "assets/media/runes/symbol-2.png",
    3: "assets/media/runes/symbol-3.png",
    4: "assets/media/runes/symbol-4.png",
    5: "assets/media/runes/symbol-5.png",
    6: "assets/media/runes/symbol-6.png",
    0: "assets/media/runes/symbol-0.png"
  },
  custom: {
    1: "assets/media/custom/symbol-1.png",
    2: "assets/media/custom/symbol-2.png",
    3: "assets/media/custom/symbol-3.png",
    4: "assets/media/custom/symbol-4.png",
    5: "assets/media/custom/symbol-5.png",
    6: "assets/media/custom/symbol-6.png",
    0: "assets/media/custom/symbol-0.png"
  }
};

// Cache for loaded images
const imageCache = {};



const tileColors = {
  1: "#f87171", // red
  2: "#fbbf24", // yellow
  3: "#34d399", // green
  4: "#60a5fa", // blue
  5: "#c084fc", // purple
  6: "#f472b6"  // pink
};



canvas.width  = cellSize * gridSize;
canvas.height = cellSize * gridSize;

// Function to get the base tile image
function getBaseTileImage() {
  const basePath = baseTilePaths[currentBaseStyle];
  
  if (!imageCache[basePath]) {
    const img = new Image();
    img.src = basePath;
    imageCache[basePath] = img;
  }
  return imageCache[basePath];
}

// Function to get the ID label/glyph symbol for a tile ID
function getIdLabel(tileId) {
  const labelStyle = currentIdStyle;
  const symbolPath = idLabelPaths[labelStyle]?.[tileId];
  
  if (!symbolPath) return null;
  
  // Return cached image or create new one
  if (!imageCache[symbolPath]) {
    const img = new Image();
    img.src = symbolPath;
    imageCache[symbolPath] = img;
  }
  return imageCache[symbolPath];
}

// Keep reference to default tile image for backwards compatibility
const tileImg = new Image();
tileImg.src = "assets/media/tile.png";
tileImg.onload = () => draw();



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
  placeTile(id, x, y, rot = 0) {
  this.tiles = this.tiles.filter(t => !(t.x === x && t.y === y));
  const tile = new Tile(id, x, y);
  tile.rot = rot;
  this.tiles.push(tile);
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




Board.prototype.updateSeed = function() {
  const counts = {};
  this.tiles.forEach(t => counts[t.id] = (counts[t.id]||0)+1);
  const seed = Object.entries(counts)
    .map(([id,n]) => `${id}.${n}`)
    .join(" ");
  // Build a richer display: main seed + grouped seeds (tomes/runes/glyphs) + spell forms/scripts
  // Keep the board prototype seed display as the original compact form (e.g. "1.1 2.2 3.3 ...")
  seedDisplay.textContent = "Seed: " + (seed || "—");
  // **Push main seed into validator input**
  const seedInput = document.getElementById("spellSeed");
  if (seedInput) seedInput.value = seed;
};




function notify(message, duration = 2000) {
  const note = document.getElementById("notification");
  note.textContent = message;
  note.classList.add("visible");
  note.classList.remove("hidden");
  clearTimeout(note._timeout);
  note._timeout = setTimeout(() => {
    note.classList.add("hidden");
    note.classList.remove("visible");
  }, duration);
}







// … rest of your generator code unchanged …
function spawnTile(id) { selectedId = id; }

function toggleGroupMode() {
  groupMode = !groupMode;
}
function displayMessage() {
      document.getElementById("message").innerText = "group mode " +(groupMode ? "ON" : "OFF");
      syncButtonHighlightWithMessage();
    }
    
function rotateSelectionCW() {
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
function rotateSelectionCC() {
  if(selectedTiles.length === 1) {
    // rotate single tile normally
    selectedTiles[0].rot = (selectedTiles[0].rot-45)%360;
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

// --- Seed Generation and Interpretation ---
function generateAdvancedSeed() {
  const seedData = {};

  // Group tiles by their ID
  board.tiles.forEach(tile => {
    if (!seedData[tile.id]) {
      seedData[tile.id] = [];
    }
    seedData[tile.id].push({x: tile.x, y: tile.y, rot: tile.rot});
  });

  // Format the data into the advanced seed string
  let advancedSeed = "";
  for (const id in seedData) {
    const coords = seedData[id].map(coord => `${coord.x},${coord.y},${coord.rot}`).join(".");
    // Use the element names (fire, water, etc.) if you have them, otherwise use the ID
    const element = getElementFromId(parseInt(id)); // This function is explained below
    advancedSeed += `${id},(${element}),${coords} `;
  }

  // Display the advanced seed in the input field
  document.getElementById("advancedSeedInput").value = advancedSeed.trim();
  if (!advancedSeed) {
  alert("Place tiles to Generate advance seed.");
  }
    else {
      notify('Advanced Seed generated and copied to the input field.');
    }
  }


function applyAdvancedSeed() {
  const advancedSeedInput = document.getElementById("advancedSeedInput").value;
  if (!advancedSeedInput) {
    notify("Please paste an advanced seed into the input field.");
    return;
  } else{
    notify("Spell Reconstructed.");
  }

  clearBoard();

  const tileGroups = advancedSeedInput.split(" ").filter(Boolean);

  tileGroups.forEach(group => {
    const parts = group.split(",");
    const id = parseInt(parts[0]);

    const coordStrings = parts.slice(2).join(",").split(".");

    coordStrings.forEach(coordString => {
      const coords = coordString.split(",").map(c => parseInt(c));
      const [x, y, rot] = coords;
      if (!isNaN(id) && !isNaN(x) && !isNaN(y) && !isNaN(rot)) {
        board.placeTile(id, x, y, rot);
      }
    });
  });

  board.updateSeed();
  draw();
}

// 1) Hook up the select + button
const tutorialSelect = document.getElementById("tutorialSelect");
const loadTutorialBtn = document.getElementById("loadTutorialBtn");

tutorialSelect.addEventListener("change", () => {
  loadTutorialBtn.disabled = !tutorialSelect.value;
});

// 2) When user clicks “Load Tutorial”, fetch the JSON
loadTutorialBtn.addEventListener("click", async () => {
  const key = tutorialSelect.value;
  if (!key) return; // safety

  try {
    // adjust path as needed: e.g. /data/tutorials/${key}.json
    const res = await fetch(`assets/tutorials/${key}.json`);
    if (!res.ok) throw new Error(res.statusText);

    const state = await res.json();
    loadBoardState(state, key);
  } catch (err) {
    alert("Could not load tutorial JSON:\n" + err.message);
    console.error(err);
  }
});

/**
 * Load a tutorial or level JSON into your board.
 * Supports two shapes:
 *   { tiles: [ {id, x, y, rot}, … ] }
 *   { rooms: [ { tileId, x, y, rotation, … }, … ] }
 */
function loadBoardState(state, filename) {
  // Pick the array that exists
  const list = Array.isArray(state.tiles)
    ? state.tiles
    : Array.isArray(state.rooms)
      // convert rooms → tile‐like entries
      ? state.rooms.map(r => ({
          id:   r.tileId, 
          x:    r.x, 
          y:    r.y, 
          rot:  r.rotation 
        }))
      : null;

  if (!list) {
    console.error("loadBoardState: no tiles or rooms in state", state);
  } else {
    // Use filename to determine tutorial message
    const messageMap = {
      'level0': "Each basic spell group is a Cantrip, tiles (1), tomes (2), runes (3), glyphs (4). Place one tile to create a basic Spell. Select a spell group to validate and view its effects.",
      'level1': "Every tile is odd or even. A group is valid when there is a polarity (odd or even) majority. Basic groups can be valid to cast alone or capped to build valid Spell Forms. Complete the tome group using polarity logic and validate to see the effects.",
      'level2': "this is an unfinished Spell Form next to an unfinished Spell Script, build a tome, rune, or glyph to connect the two spell structures and cap loose connections following polarity logic to finalize the structure and validate the spell.",
      'level3': "This is a Glyph. Add four tiles to cap the ends to turn this cantrip into a complete Spell.",
      'level4': "Custom level loaded. Experiment with different tile arrangements to create unique Spells."
    };

    document.getElementById("message").innerText = messageMap[filename] || "not loaded";
  }

  // Clear existing tiles
  board.tiles = [];
  selectedTiles = [];

  // Place each entry
  list.forEach(t => {
    // t.id is numeric element ID
    const id  = t.id;
    const x   = t.x;
    const y   = t.y;
    const rot = t.rot || 0;
    board.placeTile(id, x, y, rot);
  });

  // Refresh seed display and redraw
  board.updateSeed();
  draw();
}


// Helper function to get the element name from the ID
function getElementFromId(id) {
  const elements = {
    1: "fire",
    2: "water",
    3: "air", // You didn't provide this one, so I'll add a placeholder
    4: "earth",
    5: "chaos",
    6: "arcane"
  };
  return elements[id] || "unknown";
}


let moveMode = false;  // toggled by Button


let isDragging = false;       // are we currently dragging?
let dragStart = null;         // grid position where drag started
let dragOffset = {x:0, y:0};  // current offset from drag start
let ghostPos = null;          // ghost tile preview


let groupAnchor = null;

function toggleMoveMode() {
    moveMode = !moveMode;
    
}
function displayMessage1() {
      document.getElementById("message").innerText = "move mode " +(moveMode ? "ON" : "OFF");
      syncButtonHighlightWithMessage();
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

// mousedown
canvas.addEventListener("mousedown", e => {
  if (!moveMode) return;
  const {gx, gy} = getGridPos(e);
  const tile = board.getTile(gx, gy);

  if (selectedTiles.includes(tile)) {
    isDragging = true;
    dragStart = {gx, gy};
    dragOffset = {x: 0, y: 0};
  }
});

// mousemove
canvas.addEventListener("mousemove", e => {
  if (!isDragging) return;
  const {gx, gy} = getGridPos(e);

  dragOffset = {x: gx - dragStart.gx, y: gy - dragStart.gy};
  ghostPos = {x: dragStart.gx + dragOffset.x, y: dragStart.gy + dragOffset.y};

  draw();
});

// mouseup
canvas.addEventListener("mouseup", e => {
  if (!isDragging) return;

  selectedTiles.forEach(t => {
    t.x += dragOffset.x;
    t.y += dragOffset.y;
  });

  isDragging = false;
  dragStart = null;
  dragOffset = {x: 0, y: 0};
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

// after tileImg.src = "...";
let imageLoaded = false;
tileImg.onload = () => {
  imageLoaded = true;
  draw();
};

function draw() {
  // clear + grid (unchanged)
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.strokeStyle="#333";
  for(let i=0;i<=gridSize;i++){
    ctx.beginPath();
    ctx.moveTo(i*cellSize,0);
    ctx.lineTo(i*cellSize,gridSize*cellSize);
    ctx.moveTo(0,i*cellSize);
    ctx.lineTo(gridSize*cellSize,i*cellSize);
    ctx.stroke();
  }

  // draw tiles with optional image
  board.tiles.forEach(t => {
    // compute tile center
    const cx = t.x * cellSize + cellSize/2;
    const cy = t.y * cellSize + cellSize/2;
    const color = selectedTiles.includes(t) ? "#6ee7b7" : tileColors[t.id];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t.rot * Math.PI/180);

    // single declaration of offsets
    const offsetX = -cellSize/2;
    const offsetY = -cellSize/2;

    // 1) draw base tile image
    const baseTile = getBaseTileImage();
    if (baseTile && baseTile.complete && baseTile.naturalHeight !== 0) {
      ctx.drawImage(
        baseTile,
        offsetX - 1,
        offsetY + 3,
        cellSize + 3,
        cellSize + 3
      );
    } else {
      // fallback: colored rect
      ctx.fillStyle = t.id === 0 ? "#000" : tileColors[t.id];
      ctx.fillRect(
        offsetX + 5,
        offsetY + 5,
        cellSize - 10,
        cellSize - 10
      );
    }

    // 2) tint overlay
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = selectedTiles.includes(t) ? .7 : .3;
    ctx.fillStyle = selectedTiles.includes(t)
      ? "#BA4126"
      : tileColors[t.id];
    ctx.fillRect(offsetX, offsetY + 7, cellSize, cellSize - 10);

    // reset state
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    // 3) draw ID label or overlay symbol
    const idLabel = getIdLabel(t.id);
    if (idLabel && idLabel.complete && idLabel.naturalHeight !== 0) {
      // Draw transparent ID label overlay
      ctx.drawImage(
        idLabel,
        -cellSize/2 + 5,
        -cellSize/2 + 5,
        cellSize - 10,
        cellSize - 10
      );
    } else {
      // Fallback: draw ID digit
      ctx.fillStyle = "#111";
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t.id, 0, 0);
    }

    ctx.restore();
  });

  // ghost‐drag preview (unchanged)
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
  


// Grab the new name-input element
const nameInput      = document.getElementById("spellNameInput");

// Existing elements
const seedInput      = document.getElementById("advancedSeedInput");
const saveBtn        = document.getElementById("saveSpellBtn");
const deleteBtn      = document.getElementById("deleteSpellBtn");
const spellsContainer= document.getElementById("savedSpellsContainer");

// Load or initialize saved array
let savedSpells = JSON.parse(localStorage.getItem("savedSpells") || "[]");

// Render function (unchanged)
function renderSavedSpells() {
  spellsContainer.innerHTML = "";
  savedSpells.forEach(({ name, seed }) => {
    const btn = document.createElement("button");
    btn.textContent  = name;
    btn.dataset.seed = seed;
    btn.onclick      = () => seedInput.value = seed;
    spellsContainer.appendChild(btn);
  });
}

// Save handler: use inline input instead of prompt
saveBtn.addEventListener("click", () => {
  const seed = seedInput.value.trim();
  const name = nameInput.value.trim();
  if (!seed) {
    notify("Generate or paste an advanced seed first.");
    return;
  }
  if (!name) {
    notify("Please enter a name for your spell.");
    return;
  }
  if (savedSpells.some(s => s.seed === seed)) {
    notify("This spell is already saved.");
    return;
  }
  savedSpells.push({ name, seed });
  localStorage.setItem("savedSpells", JSON.stringify(savedSpells));
  nameInput.value = "";
  renderSavedSpells();
  notify(`Saved “${name}”`);
});

// Delete handler: matches current seed, removes entry
deleteBtn.addEventListener("click", () => {
  const seed = seedInput.value.trim();
  const idx  = savedSpells.findIndex(s => s.seed === seed);
  if (idx === -1) {
    notify("No saved spell matches the current seed.");
    return;
  }
  const { name } = savedSpells[idx];
  savedSpells.splice(idx, 1);
  localStorage.setItem("savedSpells", JSON.stringify(savedSpells));
  renderSavedSpells();
  notify(`Deleted “${name}”`);
});

// Initial render
renderSavedSpells();

}

// ==========================================
// Tile Style Management (Base and ID Labels)
// ==========================================

// Handle base tile dropdown changes
const tileBaseStyleSelector = document.getElementById("tileBaseStyleSelector");
if (tileBaseStyleSelector) {
  tileBaseStyleSelector.addEventListener("change", (e) => {
    currentBaseStyle = e.target.value;
    
    // Clear image cache for base tiles
    Object.keys(imageCache).forEach(key => {
      if (key.includes("assets/media/") && key.includes("base-tile") || key === baseTilePaths[e.target.value]) {
        delete imageCache[key];
      }
    });
    
    draw();
    notify(`Base tile changed to: ${currentBaseStyle}`);
  });
}

// Handle ID label/glyph dropdown changes
const tileIdStyleSelector = document.getElementById("tileIdStyleSelector");
const userUploadSection = document.getElementById("userUploadSection");

if (tileIdStyleSelector) {
  tileIdStyleSelector.addEventListener("change", (e) => {
    currentIdStyle = e.target.value;
    
    // Show/hide upload section when custom is selected
    if (userUploadSection) {
      if (currentIdStyle === "custom") {
        userUploadSection.classList.remove("hidden");
      } else {
        userUploadSection.classList.add("hidden");
      }
    }
    
    // Clear image cache for ID labels
    Object.keys(imageCache).forEach(key => {
      if (key.includes("glyph-") || key.includes("symbol-")) {
        delete imageCache[key];
      }
    });
    
    draw();
    notify(`ID labels changed to: ${currentIdStyle}`);
  });
}

// Placeholder for user glyph upload processing
function processCustomGlyphs() {
  const fileInput = document.getElementById("customGlyphUpload");
  if (!fileInput || !fileInput.files.length) {
    notify("Please select glyph images to upload.");
    return;
  }
  
  // TODO: Implement file upload and processing
  // This will handle converting uploaded images to the custom tile style
  notify("Custom glyph upload processing - to be implemented");
}

// Sync button highlight with message output
function syncButtonHighlightWithMessage() {
  const msg = document.getElementById("message").innerText;
  const moveModeBtn = document.getElementById("toggleMoveMode");
  const groupModeBtn = document.getElementById("toggleGroupMode");
  if (moveModeBtn) {
    if (msg === "move mode ON") {
      moveModeBtn.classList.add("active-toggle");
    } else if (msg === "move mode OFF") {
      moveModeBtn.classList.remove("active-toggle");
    } // else: do not change highlight
  }
  if (groupModeBtn) {
    if (msg === "group mode ON") {
      groupModeBtn.classList.add("active-toggle");
    } else if (msg === "group mode OFF") {
      groupModeBtn.classList.remove("active-toggle");
    } // else: do not change highlight
  }
}


// make sure canvas is sized to your grid on init
canvas.width  = cellSize * gridSize;
canvas.height = cellSize * gridSize;

// initial draw
board.updateSeed();
draw();

// -------------------------
// Spell grouping utilities
// -------------------------

/**
 * Convert arbitrary rotation (degrees) to a cardinal bottom direction.
 * We snap rotation to nearest 90° so grouping works even if tiles were rotated
 * in smaller increments in the editor.
 */
function getBottomDirFromRot(rot) {
  const r = ((rot % 360) + 360) % 360; // normalize
  const idx = Math.round(r / 90) % 4; // 0..3
  // mapping: 0 -> down, 1 -> right, 2 -> up, 3 -> left
  switch (idx) {
    case 0: return {dx: 0, dy: 1};
    case 1: return {dx: 1, dy: 0};
    case 2: return {dx: 0, dy: -1};
    case 3: return {dx: -1, dy: 0};
  }
}

/**
 * Given the current board, compute groups of tiles that share the same empty
 * cell in front of their bottom sides. Each tile is still considered a single
 * seed, and groups of size 2/3/4 are classified as tome/rune/glyph.
 * Also computes whether the group's top openings are fully capped.
 */
Board.prototype.computeSpellGroups = function() {
  const tiles = this.tiles;
  const occupied = new Map(); // "x,y" -> tile
  tiles.forEach(t => occupied.set(`${t.x},${t.y}`, t));

  // group tiles by the coordinates of the empty cell they face.
  // A tile "faces" a cell either with its bottom OR with its top.
  // We record which side faces the anchor so we can compute the opposite
  // (outer) opening and test for caps correctly.
  const anchorMap = new Map(); // "ax,ay" -> [ {tile, face: 'bottom'|'top', bottomDir } ]
  tiles.forEach(t => {
    const bottomDir = getBottomDirFromRot(t.rot || 0);
    const topDir = {dx: -bottomDir.dx, dy: -bottomDir.dy};

    const bottomKey = `${t.x + bottomDir.dx},${t.y + bottomDir.dy}`;
    const topKey = `${t.x + topDir.dx},${t.y + topDir.dy}`;

    if (!anchorMap.has(bottomKey)) anchorMap.set(bottomKey, []);
    anchorMap.get(bottomKey).push({ tile: t, face: 'bottom', bottomDir });

    if (!anchorMap.has(topKey)) anchorMap.set(topKey, []);
    anchorMap.get(topKey).push({ tile: t, face: 'top', bottomDir });
  });

  const groups = [];

  // For each potential anchor cell, if that cell is empty treat it as a potential tome/rune/glyph
  anchorMap.forEach((entries, key) => {
    const [ax, ay] = key.split(",").map(Number);
    if (occupied.has(key)) return; // anchor must be a blank cell

    // Deduplicate tiles (a tile may appear twice if its top and bottom both point to same cell, unlikely)
    const tileSet = new Map();
    entries.forEach(e => tileSet.set(e.tile, e));
    const uniqueEntries = Array.from(tileSet.values());

    const tilesInGroup = uniqueEntries.map(e => e.tile);
    const size = tilesInGroup.length;
    let type = null;
    if (size === 2) type = 'tome';
    else if (size === 3) type = 'rune';
    else if (size === 4) type = 'glyph';

    if (type) {
      // For each participating tile compute its outer opening (the side opposite the face
      // that is pointing at the anchor) and determine whether that outer cell is capped
      const outers = uniqueEntries.map(e => {
        const tile = e.tile;
        // which side of the tile faces the anchor?
        // face === 'bottom' means tile.bottom -> anchor, so outer is the top
        // face === 'top' means tile.top -> anchor, so outer is the bottom
        const outerDir = (e.face === 'bottom')
          ? {dx: -e.bottomDir.dx, dy: -e.bottomDir.dy}
          : {dx: e.bottomDir.dx, dy: e.bottomDir.dy};

        const ox = tile.x + outerDir.dx;
        const oy = tile.y + outerDir.dy;
        const occ = occupied.get(`${ox},${oy}`);
        let capped = false;
        if (occ) {
          const occBottom = getBottomDirFromRot(occ.rot || 0);
          // cap exists if the occupant's bottom OR top points at THIS tile
          const occBottomPoints = (occ.x + occBottom.dx === tile.x) && (occ.y + occBottom.dy === tile.y);
          const occTopPoints = (occ.x - occBottom.dx === tile.x) && (occ.y - occBottom.dy === tile.y);
          capped = occBottomPoints || occTopPoints;
        }

        // include the outerDir used to reach this outer cell (already computed above)
        return { tile, outer: {x: ox, y: oy}, outerDir, capped, outerOccupied: occ || null };
      });

      const allOutersCapped = outers.every(o => o.capped);

      groups.push({
        type,
        anchor: {x: ax, y: ay},
        tiles: tilesInGroup,
        outers,
        allOutersCapped
      });
    }
  });

  // Exclude tiles that already belong to groups from the singles list

  const groupedSet = new Set();
  const capSet = new Set();
  groups.forEach(g => {
    g.tiles.forEach(t => groupedSet.add(t));
    if (g.outers) {
      g.outers.forEach(o => {
        if (o.capped && o.outerOccupied) capSet.add(o.outerOccupied);
      });
    }
  });

  const singles = tiles
    .filter(t => !groupedSet.has(t) && !capSet.has(t))
    .map(t => ({ type: 'single', tiles: [t] }));

  // Build connectivity between groups: two groups are connected if any outer cell of one
  // equals the anchor cell of the other (i.e. they plug into each other's openings).
  const n = groups.length;
  const adj = Array.from({length: n}, () => new Set());
  for (let i = 0; i < n; i++) {
    for (let j = i+1; j < n; j++) {
      const gi = groups[i];
      const gj = groups[j];
      let connected = false;
      // Check several kinds of loose connections:
      // 1) outer cell of gi equals anchor of gj (plug-in)
      // 2) outer cell of gj equals anchor of gi (plug-in)
      // 3) outer cell of gi adjacent (manhattan=1) to anchor of gj
      // 4) outer cell of gj adjacent to anchor of gi
      // 5) any outer cell of gi adjacent to any outer cell of gj (loose side-by-side)
      for (const oi of (gi.outers || [])) {
        if (oi.outer.x === gj.anchor.x && oi.outer.y === gj.anchor.y) { connected = true; break; }
        if (Math.abs(oi.outer.x - gj.anchor.x) + Math.abs(oi.outer.y - gj.anchor.y) === 1) { connected = true; break; }
      }
      if (!connected) {
        for (const oj of (gj.outers || [])) {
          if (oj.outer.x === gi.anchor.x && oj.outer.y === gi.anchor.y) { connected = true; break; }
          if (Math.abs(oj.outer.x - gi.anchor.x) + Math.abs(oj.outer.y - gi.anchor.y) === 1) { connected = true; break; }
        }
      }
      if (!connected) {
        // outer-to-outer adjacency
        for (const oi of (gi.outers || [])) {
          for (const oj of (gj.outers || [])) {
            if (Math.abs(oi.outer.x - oj.outer.x) + Math.abs(oi.outer.y - oj.outer.y) === 1) { connected = true; break; }
          }
          if (connected) break;
        }
      }
      if (connected) {
        adj[i].add(j);
        adj[j].add(i);
      }
    }
  }

  // Find connected components (groups connected via loose openings)
  const seen = new Array(n).fill(false);
  const components = [];
  for (let i = 0; i < n; i++) {
    if (seen[i]) continue;
    const stack = [i];
    const comp = [];
    seen[i] = true;
    while (stack.length) {
      const u = stack.pop();
      comp.push(u);
      adj[u].forEach(v => { if (!seen[v]) { seen[v] = true; stack.push(v); } });
    }
    components.push(comp);
  }

  // Classify components: Spell Forms are lone groups fully capped; Spell Scripts are components with multiple groups
  const spellForms = [];
  const spellScripts = [];
  components.forEach(comp => {
    if (comp.length === 1) {
      const g = groups[comp[0]];
      if (g.allOutersCapped) {
        // include cap tiles used to cap this group's outers
        const capTiles = (g.outers || []).filter(o => o.capped && o.outerOccupied).map(o => o.outerOccupied);
        const uniqueTiles = Array.from(new Set([].concat(g.tiles, capTiles)));
        spellForms.push({ groups: [g], tiles: uniqueTiles });
        g.container = { type: 'form', idx: spellForms.length - 1 };
      }
    } else if (comp.length > 1) {
      // combine tiles from all groups in this component
      const compGroups = comp.map(idx => groups[idx]);
      // include caps for each group as well
      const compTiles = [];
      compGroups.forEach(g => {
        compTiles.push(...g.tiles);
        if (g.outers) {
          g.outers.forEach(o => { if (o.capped && o.outerOccupied) compTiles.push(o.outerOccupied); });
        }
      });
      const uniqueTiles = Array.from(new Set(compTiles));
      spellScripts.push({ groups: compGroups, tiles: uniqueTiles });
      // tag member groups
      compGroups.forEach(g => { g.container = { type: 'script', idx: spellScripts.length - 1 }; });
    }
  });

  return { groups, singles, spellForms, spellScripts };
};

/**
 * Format a set of tiles into an "advanced seed" snippet compatible with the
 * existing generator format so it can be copied into the validator input.
 */
function formatSeedForTiles(tiles) {
  // group by id
  const byId = {};
  tiles.forEach(t => {
    if (!byId[t.id]) byId[t.id] = [];
    byId[t.id].push(`${t.x},${t.y},${t.rot}`);
  });
  const parts = Object.keys(byId).map(id => `${id},(${getElementFromId(parseInt(id))}),${byId[id].join('.')}`);
  return parts.join(" ");
}

/**
 * Return compact seed (counts) like "1.1 2.2 3.3" for a tile array.
 */
function compactSeedForTiles(tiles) {
  const counts = {};
  tiles.forEach(t => { counts[t.id] = (counts[t.id]||0) + 1; });
  return Object.keys(counts)
    .sort((a,b) => parseInt(a) - parseInt(b))
    .map(id => `${id}.${counts[id]}`)
    .join(' ');
}

/**
 * Small on-canvas panel that lists computed groups and lets the user
 * click one to select its tiles and copy its advanced-seed into the input.
 */
function updateGroupPanel() {
  const panelId = 'groupPanel';
  let panel = document.getElementById(panelId);
  // Expect a static panel in the HTML. If it's not present, warn and skip.
  if (!panel) {
    console.warn('updateGroupPanel: no element with id "groupPanel" found in the DOM.\nPlease add a static <div id="groupPanel"></div> to your HTML and style it with the provided CSS.');
    return;
  }

  const data = board.computeSpellGroups();
  panel.innerHTML = '';

  const title = document.createElement('div');
  title.style.fontWeight = '700';
  title.style.marginBottom = '6px';
  title.textContent = 'Spell Groups';
  panel.appendChild(title);

  // 1) Individual (ungrouped) tiles
  const tilesTitle = document.createElement('div');
  tilesTitle.style.fontWeight = '600';
  tilesTitle.style.marginBottom = '6px';
  tilesTitle.textContent = 'Tiles';
  panel.appendChild(tilesTitle);

  if (data.singles.length === 0) {
    const none = document.createElement('div');
    none.textContent = 'No ungrouped tiles.';
    none.style.marginBottom = '6px';
    panel.appendChild(none);
  } else {
    data.singles.forEach((s, i) => {
      const t = s.tiles[0];
      const btn = document.createElement('button');
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.marginBottom = '4px';
      btn.textContent = `Tile ${i+1}: ${t.id} @ ${t.x},${t.y}`;
      btn.onclick = () => {
        selectedTiles = [t];
        draw();
        const seedStr = formatSeedForTiles([t]);
        const adv = document.getElementById('advancedSeedInput');
        if (adv) adv.value = seedStr;
        // also set compact seed into spellSeed
        const compact = compactSeedForTiles([t]);
        const spellSeedInput = document.getElementById('spellSeed');
        if (spellSeedInput) spellSeedInput.value = compact;
        notify('Tile selected');
      };
      panel.appendChild(btn);
    });
  }

  // 2) Grouped categories: tomes (2), runes (3), glyphs (4)
  const types = ['tome', 'rune', 'glyph'];
  types.forEach(type => {
    // only show groups that are not already part of a form or script
    const arr = data.groups.filter(g => g.type === type && !g.container);
    const heading = document.createElement('div');
    heading.style.fontWeight = '600';
    heading.style.margin = '8px 0 6px';
    heading.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}s`;
    panel.appendChild(heading);

    if (arr.length === 0) {
      const none = document.createElement('div');
      none.textContent = `No ${type}s.`;
      none.style.marginBottom = '6px';
      panel.appendChild(none);
    } else {
      arr.forEach((g, idx) => {
  const btn = document.createElement('button');
        btn.style.display = 'block';
        btn.style.width = '100%';
        btn.style.marginBottom = '4px';
  const membership = g.container ? ` [in ${g.container.type.charAt(0).toUpperCase()+g.container.type.slice(1)} ${g.container.idx+1}]` : '';
  btn.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} ${idx+1} @ ${g.anchor.x},${g.anchor.y} (${g.tiles.length}) ${g.allOutersCapped? '✓capped':'open'}${membership}`;
        btn.onclick = () => {
          // include cap tiles in the selection when present
          const caps = (g.outers||[]).filter(o=>o.capped && o.outerOccupied).map(o=>o.outerOccupied);
          const sel = Array.from(new Set([].concat(g.tiles, caps)));
          selectedTiles = sel;
          draw();
          const seedStr = formatSeedForTiles(sel);
          const adv = document.getElementById('advancedSeedInput');
          if (adv) adv.value = seedStr;
          // set compact seed into spellSeed
          const compact = compactSeedForTiles(sel);
          const spellSeedInput = document.getElementById('spellSeed');
          if (spellSeedInput) spellSeedInput.value = compact;
          notify(`${type} selected`);
        };
        panel.appendChild(btn);
      });
    }
  });

  // 3) Spell Forms (single group fully capped)
  const formsHeading = document.createElement('div');
  formsHeading.style.fontWeight = '600';
  formsHeading.style.margin = '8px 0 6px';
  formsHeading.textContent = 'Spell Forms';
  panel.appendChild(formsHeading);

  if (!data.spellForms || data.spellForms.length === 0) {
    const none = document.createElement('div');
    none.textContent = 'No Spell Forms.';
    none.style.marginBottom = '6px';
    panel.appendChild(none);
  } else {
    data.spellForms.forEach((f, idx) => {
      const btn = document.createElement('button');
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.marginBottom = '4px';
      const seedStr = formatSeedForTiles(f.tiles);
      btn.textContent = `Form ${idx+1}: (${f.tiles.length})`;
      btn.onclick = () => {
        selectedTiles = f.tiles.slice();
        draw();
        const adv = document.getElementById('advancedSeedInput');
        if (adv) adv.value = seedStr;
        // set compact seed into spellSeed
        const compact = compactSeedForTiles(f.tiles);
        const spellSeedInput = document.getElementById('spellSeed');
        if (spellSeedInput) spellSeedInput.value = compact;
        notify('Spell Form selected');
      };
      panel.appendChild(btn);
    });
  }

  // 4) Spell Scripts (connected groups)
  const scriptsHeading = document.createElement('div');
  scriptsHeading.style.fontWeight = '600';
  scriptsHeading.style.margin = '8px 0 6px';
  scriptsHeading.textContent = 'Spell Scripts';
  panel.appendChild(scriptsHeading);

  if (!data.spellScripts || data.spellScripts.length === 0) {
    const none = document.createElement('div');
    none.textContent = 'No Spell Scripts.';
    none.style.marginBottom = '6px';
    panel.appendChild(none);
  } else {
    data.spellScripts.forEach((s, idx) => {
      const btn = document.createElement('button');
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.marginBottom = '4px';
      const seedStr = formatSeedForTiles(s.tiles);
      btn.textContent = `Script ${idx+1}: (${s.tiles.length} tiles)`;
      btn.onclick = () => {
        selectedTiles = s.tiles.slice();
        draw();
        const adv = document.getElementById('advancedSeedInput');
        if (adv) adv.value = seedStr;
        const compact = compactSeedForTiles(s.tiles);
        const spellSeedInput = document.getElementById('spellSeed');
        if (spellSeedInput) spellSeedInput.value = compact;
        notify('Spell Script selected');
      };
      panel.appendChild(btn);
    });
  }
}

// update the group panel every time we draw so it stays in sync
const _origDraw = draw;
draw = function() {
  _origDraw();
  try { updateGroupPanel(); } catch (e) { console.error('updateGroupPanel', e); }
};













