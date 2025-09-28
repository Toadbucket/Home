// js/events.js
import { canvas, cellSize } from "/Home/webpage/assets/games/js/config.js";
import { board } from "/Home/webpage/assets/games/js/main.js";
import { selectedTiles, groupMode, selectedId, moveMode } from "/Home/webpage/assets/games/js/controls.js";
import { draw } from "/Home/webpage/assets/games/js/draw.js";

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






