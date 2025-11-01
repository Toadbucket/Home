// Spell logic module
import { notify } from './ui.js';

let savedSpells = JSON.parse(localStorage.getItem("savedSpells") || "[]");

export function renderSavedSpells(spellsContainer, seedInput) {
  spellsContainer.innerHTML = "";
  savedSpells.forEach(({ name, seed }) => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.dataset.seed = seed;
    btn.onclick = () => seedInput.value = seed;
    spellsContainer.appendChild(btn);
  });
}

export function saveSpell(nameInput, seedInput, spellsContainer) {
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
  renderSavedSpells(spellsContainer, seedInput);
  notify(`Saved “${name}”`);
}

export function deleteSpell(seedInput, spellsContainer) {
  const seed = seedInput.value.trim();
  const idx = savedSpells.findIndex(s => s.seed === seed);
  if (idx === -1) {
    notify("No saved spell matches the current seed.");
    return;
  }
  const { name } = savedSpells[idx];
  savedSpells.splice(idx, 1);
  localStorage.setItem("savedSpells", JSON.stringify(savedSpells));
  renderSavedSpells(spellsContainer, seedInput);
  notify(`Deleted “${name}”`);
}

export function generateAdvancedSeed(board, advancedSeedInput) {
  const seedData = {};
  board.tiles.forEach(tile => {
    if (!seedData[tile.id]) {
      seedData[tile.id] = [];
    }
    seedData[tile.id].push({ x: tile.x, y: tile.y, rot: tile.rot });
  });
  let advancedSeed = "";
  for (const id in seedData) {
    const coords = seedData[id].map(coord => `${coord.x},${coord.y},${coord.rot}`).join(".");
    advancedSeed += `${id},(${getElementFromId(parseInt(id))}),${coords} `;
  }
  advancedSeedInput.value = advancedSeed.trim();
  if (!advancedSeed) {
    alert("Place tiles to Generate advance seed.");
  } else {
    notify('Advanced Seed generated and copied to the input field.');
  }
}

export function applyAdvancedSeed(board, advancedSeedInput, draw) {
  const advancedSeed = advancedSeedInput.value;
  if (!advancedSeed) {
    notify("Please paste an advanced seed into the input field.");
    return;
  } else {
    notify("Spell Reconstructed.");
  }
  board.tiles = [];
  const tileGroups = advancedSeed.split(" ").filter(Boolean);
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

function getElementFromId(id) {
  const elements = {
    1: "fire",
    2: "water",
    3: "air",
    4: "earth",
    5: "chaos",
    6: "arcane"
  };
  return elements[id] || "unknown";
}
