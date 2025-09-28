// js/main.js
import { Board } from "./board.js";
import { draw } from "./draw.js";
import { setupEvents } from "./events.js";

export const board = new Board();

board.updateSeed();
draw(board);
setupEvents();
