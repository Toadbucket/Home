// js/main.js
import { Board } from "/Home/webpage/assets/games/js/board.js";
import { draw } from "/Home/webpage/assets/games/js/draw.js";
import { setupEvents } from "/Home/webpage/assets/games/js/events.js";
import { SpellStorageSystem } from "/Home/webpage/assets/games/js/spellStorageSystem.js";

export const board = new Board();

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
