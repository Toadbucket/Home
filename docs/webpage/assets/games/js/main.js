// js/main.js
import { Board } from "/assets/games/js/board.js";
import { draw } from "/assets/games/js/draw.js";
import { setupEvents } from "/assets/games/js/events.js";

export const board = new Board();

board.updateSeed();
draw(board);
setupEvents();

