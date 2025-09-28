// js/main.js
import { Board } from "/Home/webpage/assets/games/js/board.js";
import { draw } from "/Home/webpage/assets/games/js/draw.js";
import { setupEvents } from "/Home/webpage/assets/games/js/events.js";

export const board = new Board();

board.updateSeed();
draw(board);
setupEvents();









