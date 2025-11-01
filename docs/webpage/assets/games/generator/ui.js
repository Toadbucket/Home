// UI logic module
export function notify(message, duration = 2000) {
  const note = document.getElementById("notification");
  note.textContent = message;
  note.classList.add("visible");
  note.classList.remove("hidden");
  clearTimeout(note._timeout);
  note._timeout = setTimeout(() => {
    note.classList.add("hidden");
    note.classList.remove("visible");
  }, duration);
}

export function initUI() {
  // Tutorial select and load
  const tutorialSelect = document.getElementById("tutorialSelect");
  const loadTutorialBtn = document.getElementById("loadTutorialBtn");
  tutorialSelect.addEventListener("change", () => {
    loadTutorialBtn.disabled = !tutorialSelect.value;
  });
}

export async function loadTutorial(key, board, draw) {
  try {
    const res = await fetch(`assets/tutorials/${key}.json`);
    if (!res.ok) throw new Error(res.statusText);
    const state = await res.json();
    loadBoardState(state, key, board, draw);
  } catch (err) {
    alert("Could not load tutorial JSON:\n" + err.message);
    console.error(err);
  }
}

function loadBoardState(state, filename, board, draw) {
  const list = Array.isArray(state.tiles)
    ? state.tiles
    : Array.isArray(state.rooms)
      ? state.rooms.map(r => ({ id: r.tileId, x: r.x, y: r.y, rot: r.rotation }))
      : null;
  if (!list) {
    console.error("loadBoardState: no tiles or rooms in state", state);
  } else {
    const messageMap = {
      'level0': "test",
      'level1': "This is a Tome. Add two tiles to cap the ends to turn this cantrip into a Spell Form."
    };
    document.getElementById("message").innerText = messageMap[filename] || "not loaded";
  }
  board.tiles = [];
  // selectedTiles = [];
  list.forEach(t => {
    const id = t.id;
    const x = t.x;
    const y = t.y;
    const rot = t.rot || 0;
    board.placeTile(id, x, y, rot);
  });
  board.updateSeed();
  draw();
}
