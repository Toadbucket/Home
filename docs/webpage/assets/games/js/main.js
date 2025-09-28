// js/main.js
import { Board } from "/webpage//assets/games/js/board.js";
import { draw } from "/webpage/assets/games/js/draw.js";
import { setupEvents } from "/webpage/assets/games/js/events.js";

export const board = new Board();

board.updateSeed();
draw(board);
setupEvents();







