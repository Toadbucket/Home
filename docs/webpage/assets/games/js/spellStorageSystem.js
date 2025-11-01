// assets/games/js/spellStorageSystem.js
import { notify } from "/docs/webpage/assets/games/js/notify.js";
export class SpellStorageSystem {
  constructor({ seedInputId, nameInputId, saveBtnId, deleteBtnId, containerId }) {
    this.seedInput       = document.getElementById(seedInputId);
    this.nameInput       = document.getElementById(nameInputId);
    this.saveBtn         = document.getElementById(saveBtnId);
    this.deleteBtn       = document.getElementById(deleteBtnId);
    this.spellsContainer = document.getElementById(containerId);
    this.savedSpells     = JSON.parse(localStorage.getItem("savedSpells") || "[]");
  }
  setup() {
    this.renderSavedSpells();
    this.saveBtn.addEventListener("click", () => this.saveSpell());
    this.deleteBtn.addEventListener("click", () => this.deleteSpell());
  }

  renderSavedSpells() {
    this.spellsContainer.innerHTML = "";
    this.savedSpells.forEach(({ name, seed }) => {
      const btn = document.createElement("button");
      btn.textContent  = name;
      btn.dataset.seed = seed;
      btn.onclick      = () => this.seedInput.value = seed;
      this.spellsContainer.appendChild(btn);
    });
  }

  saveSpell() {
    const seed = this.seedInput.value.trim();
    const name = this.nameInput.value.trim();
    if (!seed) return notify("Generate or paste an advanced seed first.");
    if (!name) return notify("Please enter a name for your spell.");
    if (this.savedSpells.some(s => s.seed === seed)) return notify("This spell is already saved.");

    this.savedSpells.push({ name, seed });
    localStorage.setItem("savedSpells", JSON.stringify(this.savedSpells));
    this.nameInput.value = "";
    this.renderSavedSpells();
    notify(`Saved “${name}”`);
  }

  deleteSpell() {
    const seed = this.seedInput.value.trim();
    const idx  = this.savedSpells.findIndex(s => s.seed === seed);
    if (idx === -1) return notify("No saved spell matches the current seed.");

    const { name } = this.savedSpells[idx];
    this.savedSpells.splice(idx, 1);
    localStorage.setItem("savedSpells", JSON.stringify(this.savedSpells));
    this.renderSavedSpells();
    notify(`Deleted “${name}”`);
  }
}
