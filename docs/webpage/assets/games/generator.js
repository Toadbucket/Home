const canvas       = document.getElementById("board");
const ctx          = canvas.getContext("2d");
const seedDisplay  = document.getElementById("seed");
// … other constants and classes …
const cellSize = 40;
const gridSize = 15;

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

const tileImg = new Image();
tileImg.src = "assets/media/tile.png"; // your greyscale PNG
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
  seedDisplay.textContent = "Seed: " + (seed || "—");
  // **Push seed into validator input**
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
      'level0': "test",
      'level1': "This is a Tome. Add two tiles to cap the ends to turn this cantrip into a Spell Form."
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

    // 1) base—either draw the PNG or fallback to your rect
    if (t.id > 0 && imageLoaded) {
      ctx.drawImage(
        tileImg,
        offsetX - 1,
        offsetY + 3,
        cellSize + 3,
        cellSize + 3
      );
    } else {
      // fallback: black if id=0, else colored rect
      ctx.fillStyle = t.id === 0 ? "#000" : tileColors[t.id];
      ctx.fillRect(
        offsetX + 5,
        offsetY + 5,
        cellSize - 10,
        cellSize - 10
      );
    }

    // 2) tint overlay (unchanged)
    ctx.globalCompositeOperation = "source-atop";
    ctx.globalAlpha = selectedTiles.includes(t) ? .7 : .3;
    ctx.fillStyle = selectedTiles.includes(t)
      ? "#BA4126"
      : tileColors[t.id];
    ctx.fillRect(offsetX, offsetY + 7, cellSize, cellSize - 10);

    // reset state
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    // 3) draw ID label (unchanged)
    ctx.fillStyle = "#111";
    ctx.font = "30px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(t.id, 0, 0);

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

// make sure canvas is sized to your grid on init
canvas.width  = cellSize * gridSize;
canvas.height = cellSize * gridSize;

// initial draw
board.updateSeed();
draw();













