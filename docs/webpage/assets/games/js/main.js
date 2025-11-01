// js/main.js
import { board } from "/docs/webpage/assets/games/js/board.js";
import { draw } from "/docs/webpage/assets/games/js/draw.js";
import { setupEvents } from "/docs/webpage/assets/games/js/events.js";
import { SpellStorageSystem } from "/docs/webpage/assets/games/js/spellStorageSystem.js";

// board singleton is exported from board.js
board.updateSeed();
draw(board);
setupEvents();

// Initialize spell storage system
const spellSystem = new SpellStorageSystem({
  seedInputId:      "advancedSeedInput",
  nameInputId:      "spellNameInput",
  saveBtnId:        "saveSpellBtn",
  deleteBtnId:      "deleteSpellBtn",
  containerId:      "savedSpellsContainer"
});

spellSystem.setup();
