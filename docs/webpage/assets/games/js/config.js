// js/config.js
export const cellSize = 40;
export const gridSize = 12;

export const tileColors = {
  1: "#f87171", // red
  2: "#fbbf24", // yellow
  3: "#34d399", // green
  4: "#60a5fa", // blue
  5: "#c084fc", // purple
  6: "#f472b6"  // pink
};

export const canvas = document.getElementById("board");
export const ctx = canvas.getContext("2d");
export const seedDisplay = document.getElementById("seed");
export const messageBox = document.getElementById("message");

canvas.width = cellSize * gridSize;
canvas.height = cellSize * gridSize;


