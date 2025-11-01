// Utility functions module
export function getElementFromId(id) {
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

export function randomSeed() {
  return Math.random().toString(36).substring(2, 10);
}
