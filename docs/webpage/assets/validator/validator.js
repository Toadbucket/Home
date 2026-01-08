document.getElementById("validateButton").addEventListener("click", validateSpell);

const nameProfiles = {
  original: 'assets/validator/spellNames.json',
  ttrpg: 'assets/validator/spellNames_ttrpg.json',
  pvp:  'assets/validator/spellNames_pvp.json',
  vrpg: 'assets/validator/spellNames_vrpg.json',
  custom: null  // will be set by user file input
};
// Registry of mechanic profiles
const mechanicProfiles = {
  original: 'assets/validator/spellMechanics.json',
  ttrpg: 'assets/validator/spellMechanics_ttrpg.json',
  pvp:  'assets/validator/spellMechanics_pvp.json',
  vrpg: 'assets/validator/spellMechanics_vrpg.json',
  jewelry: 'assets/validator/spellMechanics_jewelry.json',
  custom: null  // will be set by user file input
};
const flavorProfiles = {
  original: 'assets/validator/spellFlavorText.json',
  ttrpg: 'assets/validator/spellFlavorText_ttrpg.json',
  pvp:  'assets/validator/spellFlavorText_pvp.json',
  vrpg: 'assets/validator/spellFlavorText_vrpg.json',
  custom: null  // will be set by user file input
};
// Track which profile is active
let activeMechanicProfile = 'ttrpg';
let activeFlavorProfile = 'original';
let activeNameProfile = 'original';


// Global variable to store fetched spell data
let spellData = {
  names: {},
  flavorText: {},
  bodyMechanics: [],
  trailMechanics: [],
  impactMechanics: [],
};

(async function initializeSpellData() {
  try {
    await loadNameProfiles(activeNameProfile);
    // Load initial flavor text
    await loadFlavorProfile(activeFlavorProfile);
    await loadMechanicsProfile(activeMechanicProfile);
    console.log("Initial name and flavor data loaded.");
  } catch (e) {
    console.error("Initialization error:", e);
    displayCard("<b>Error</b>Spell data initialized.");
    document.getElementById("validateButton").disabled = false;
  }})();

async function loadNameProfiles(profileKey) {
  const path = nameProfiles[profileKey];
  if (!path) return;  // custom handled elsewhere

  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${profileKey}`);
  const names = await res.json();

  spellData.names = names;
}

async function loadMechanicsProfile(profileKey) {
  const path = mechanicProfiles[profileKey];
  if (!path) return;  // custom handled elsewhere

  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${profileKey}`);
  const mechanics = await res.json();

  spellData.bodyMechanics   = mechanics.body;
  spellData.trailMechanics  = mechanics.trail;
  spellData.impactMechanics = mechanics.impact;
}

async function loadFlavorProfile(profileKey) {
  const path = flavorProfiles[profileKey];
  if (!path) return;  // custom handled elsewhere

  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${profileKey}`);
  const flavor = await res.json();

  spellData.bodyFlavorText   = flavor.body;
  spellData.trailFlavorText  = flavor.trail;
  spellData.impactFlavorText = flavor.impact;
  // also keep the top-level flavorText mapping for backward compatibility
  spellData.flavorText = flavor;
}

// Use an async IIFE (Immediately Invoked Function Expression) to load data on page load
(async function loadSpellData() {
try {
const [namesResponse, mechanicsResponse, flavorResponse] = await Promise.all([
fetch('assets/validator/spellNames.json'),
fetch('assets/validator/spellMechanics.json'),
fetch('assets/validator/spellFlavorText.json')
]);

if (!namesResponse.ok || !mechanicsResponse.ok || !flavorResponse.ok) {
throw new Error('One or more JSON files could not be loaded.');
}

const names = await namesResponse.json();
const mechanics = await mechanicsResponse.json();
const flavorText = await flavorResponse.json();

// Organize the data into a single object
spellData = {
names: names,
bodyMechanics: mechanics.body,
trailMechanics: mechanics.trail,
impactMechanics: mechanics.impact,
flavorText: flavorText
};

console.log("Spell data loaded successfully.");
} catch (error) {
console.error("Failed to load spell data:", error);
displayCard(`<b>Error:</b> Could not load spell data. Check console for details.`);
document.getElementById("validateButton").disabled = true; // Disable button if data fails to load
}
})();

function validateSpell() {
// Check if spell data is loaded
if (Object.keys(spellData).length === 0) {
displayCard(`<b>Error:</b> Spell data is still loading or failed to load. Please try again.`);
return;
}

const input = document.getElementById("spellSeed").value.trim();

// Clean input to allow only digits, dots, spaces and commas
if (!/^[\d.\s,]*$/.test(input)) {
displayCard(`<b>Error:</b> Invalid characters. Use format: 1.2 2.3 3.0`);
return;
}

// Parse input, initialize all to zero
let spellMap = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
const pairs = input.split(/[\s,]+/).filter(Boolean);

for (const pair of pairs) {
const [idStr, totalStr] = pair.split(".");
const id = parseInt(idStr);
const total = parseFloat(totalStr);

if (isNaN(id) || isNaN(total) || id < 1 || id > 6) {
displayCard(`<b>Error:</b> Invalid pair "${pair}". Use format like 1.2 2.3`);
return;
}
spellMap[id] = total;
}

// Build element array, filtering out any with a total of 0
const elements = [
{ id: 1, name: "Fire", parity: "Odd", total: spellMap[1] },
{ id: 2, name: "Water", parity: "Even", total: spellMap[2] },
{ id: 3, name: "Air", parity: "Odd", total: spellMap[3] },
{ id: 4, name: "Earth", parity: "Even", total: spellMap[4] },
{ id: 5, name: "Chaos", parity: "Odd", total: spellMap[5] },
{ id: 6, name: "Arcane", parity: "Even", total: spellMap[6] },
].filter(el => el.total > 0);

// If no valid elements are entered, display an error
if (elements.length === 0) {
displayCard(`<b>Error:</b> Please enter at least one valid spell seed (e.g., 1.2).`);
return;
}

let totalOdd = 0, totalEven = 0, totalSum = 0;
elements.forEach(el => {
totalSum += el.total;
if (el.parity === "Odd") totalOdd += el.total;
else totalEven += el.total;
});

// Sort by total desc then id asc
elements.sort((a, b) => (b.total !== a.total ? b.total - a.total : a.id - b.id));

const statsOrder = ["Duration", "Distance", "Speed", "Spread", "Accuracy", "AOE Size"];
const rankedStats = elements.map((s, i) => {
const statValue = Math.round((s.total * s.id) / (i + 1));
return { stat: statsOrder[i], element: s.name, value: statValue };
});

let validity = "", manaCost = 0;
if (totalOdd === totalEven) {
validity = "<span class='invalid'>❌ Invalid Spell: equal odd and even totals.</span>";
} else {
const dominant = totalOdd > totalEven ? "Odd" : "Even";
manaCost = Math.max(totalOdd, totalEven);
validity = `<span class='valid'>✅ Valid Spell. Dominant: ${dominant}, Mana Cost: ${manaCost}</span>`;
}

// Generate spell card content
const cardContent = generateSpellContent(elements, rankedStats, totalSum, validity);

displayCard(cardContent);

  // Expose structured spell info for external consumers (e.g., the RPG)
  try {
    const dominant = totalOdd > totalEven ? 'Odd' : 'Even';
    const isValid = totalOdd !== totalEven;
    // store a compact, structured version on window for the game to use
    window.lastGeneratedSpell = {
      elements: elements, // array of element objects (sorted)
      primary: elements[0] || null,
      secondary: elements[1] || null,
      tertiary: elements[2] || null,
      rankedStats: rankedStats,
      totalPower: totalSum,
      manaCost: manaCost,
      validityText: validity,
      valid: isValid,
      dominantParity: dominant
    };
  } catch (e) { console.warn('Could not set lastGeneratedSpell', e); }

// Generate image depending on how many elements are present.
// Pass element objects so we can use ids for image lookup (id-based files) and fall back to names.
if (elements.length >= 1) {
  const p = elements[0] || null;
  const s = elements[1] || null;
  const t = elements[2] || null;
  generateSpellImage(p, s, t, elements.length);
} else {
  // Clear the canvas if not enough elements
  const canvas = document.getElementById("spellCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
}

function generateSpellName(elements) {
const primary = elements[0] ? elements[0].name : null;
const secondary = elements[1] ? elements[1].name : null;
const tertiary = elements[2] ? elements[2].name : null;

let nameParts = [];

if (primary) {
const primaryNames = spellData.names.primary[primary];
nameParts.push(randomFrom(primaryNames));
}

if (secondary) {
const secondaryNames = spellData.names.secondary[secondary];
nameParts.push(randomFrom(secondaryNames));
}

if (tertiary) {
const tertiaryNames = spellData.names.tertiary[tertiary];
nameParts.push(randomFrom(tertiaryNames));
}

// Join the collected parts with a space
return nameParts.join(" ") || "Unnamed Spell";
}

function randomFrom(arr) {
if (!arr || arr.length === 0) return "Unknown";
return arr[Math.floor(Math.random() * arr.length)];
}

function generateSpellContent(elements, rankedStats, totalSum, validity) {
const primary = elements[0] ? elements[0] : null;
const secondary = elements[1] ? elements[1] : null;
const tertiary = elements[2] ? elements[2] : null;

let html = "";

// Spell Name
const spellName = generateSpellName(elements);
html += `<h2>${spellName}</h2>`;

      // Spell Profile Section
html += `<div class="section"><b>Spell Profile:</b><ul>`;

  
// Power and Validity
html += `<div class="section"><b>Power:</b> ${totalSum}</div>`;
html += `<div class="section">${validity}</div>`;

// Body Mechanic
if (primary) {
const bodyMech = spellData.bodyMechanics.find(item => item.id === primary.id);
html += `<li><b>Body:</b> ${bodyMech ? bodyMech.text : "N/A"}</li>`;
}

// Trail Mechanic
if (secondary) {
const trailMech = spellData.trailMechanics.find(item => item.id === secondary.id);
html += `<li><b>Trail:</b> ${trailMech ? trailMech.text : "N/A"}</li>`;
}

// Impact Mechanic
if (tertiary) {
const impactMech = spellData.impactMechanics.find(item => item.id === tertiary.id);
html += `<li><b>Impact:</b> ${impactMech ? impactMech.text : "N/A"}</li>`;
}

html += `</ul></div>`;

// Flavor Text Section
html += `<div class="section"><b>Flavor Text:</b><ul>`;
elements.forEach(el => {
const flavor = spellData.flavorText[el.name];
html += `<li>${el.name}: ${flavor ? flavor : "N/A"}</li>`;
});
html += `</ul></div>`;
  
  // Attributes Section
html += `<div class="section"><b>Attributes:</b><ul>`;
rankedStats.forEach(r => {
html += `<li>${r.stat}: ${r.value} (via ${r.element})</li>`;
});
html += `</ul></div>`;

// Seed Breakdown Section
html += `<div class="section"><b>Seed Breakdown:</b><ul>`;
elements.forEach((s, i) => {
html += `<li>Rank ${i + 1}: ${s.name} (#${s.id}) Total=${s.total}</li>`;
});
html += `</ul></div>`;

return html;
}

function displayCard(content) {
const card = document.getElementById("spellCard");
card.innerHTML = content;
card.classList.remove("hidden");
}

// Animation handle so we can cancel previous runs
let __validatorAnimationId = null;

/**
 * Generate a composite spell image.
 * primary/secondary/tertiary are element objects ({id, name, ...}) or null.
 * count controls how many layers to render: 1 -> primary only, 2 -> primary+secondary, 3+ -> all three.
 */
async function generateSpellImage(primary, secondary, tertiary, count = 3) {
  const canvas = document.getElementById("spellCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Build possible base paths for an element: prefer id-based (e.g., '1'), then name-based ('fire')
  function baseCandidates(category, element) {
    if (!element) return [];
    const name = (element.name || '').toLowerCase();
    const id = element.id != null ? String(element.id) : null;
    const base = `assets/validator/images/${category}/`;
    const candidates = [];
    if (id) candidates.push(base + id);
    if (name) candidates.push(base + name);
    return candidates;
  }

  // Try to load frames for a single base (without extension). We attempt single png then numbered sequences.
  // Returns an array of Image objects (length 0 if none found).
  function loadFramesFromBase(base) {
    return new Promise(resolve => {
      const frames = [];

      // Try single png first
      const single = new Image();
      single.onload = () => resolve([single]);
      single.onerror = () => {
        // try sequence patterns
        const maxFrames = 100;
        let loaded = 0;
        let attempts = 0;
        for (let i = 0; i < maxFrames; i++) {
          const candidates = [
            `${base}_${i}.png`,
            `${base}${i}.png`,
            `${base}-${i}.png`,
            `${base}_${String(i).padStart(3, '0')}.png`
          ];

          // closure to capture candidate
          (function tryCandidate(listIndex) {
            if (listIndex >= candidates.length) return; // shouldn't happen
          })(0);
        }

        // We'll attempt sequentially with a helper to reduce concurrent requests
        let seqIndex = 0;
        let consecutiveMisses = 0;
        function tryNext() {
          if (seqIndex >= maxFrames || consecutiveMisses >= 4) {
            // done
            resolve(frames);
            return;
          }
          const i = seqIndex++;
          const candidates = [
            `${base}_${i}.png`,
            `${base}${i}.png`,
            `${base}-${i}.png`,
            `${base}_${String(i).padStart(3, '0')}.png`
          ];

          let found = false;
          function tryCandidateAt(ci) {
            if (ci >= candidates.length) {
              if (!found) {
                consecutiveMisses++;
                tryNext();
              }
              return;
            }
            const url = candidates[ci];
            const img = new Image();
            img.onload = () => {
              frames.push(img);
              found = true;
              consecutiveMisses = 0;
              // continue to next index
              tryNext();
            };
            img.onerror = () => tryCandidateAt(ci + 1);
            img.src = url;
          }
          tryCandidateAt(0);
        }
        tryNext();
      };
      single.src = base + '.png';
    });
  }

  // Prepare layers (up to count)
  const allLayers = [
    { category: 'primary', element: primary, alpha: 1.0, x: 0, y: 0, fps: 12 },
    { category: 'secondary', element: secondary, alpha: 0.7, x: 10, y: 10, fps: 12 },
    { category: 'tertiary', element: tertiary, alpha: 0.5, x: 20, y: 20, fps: 12 }
  ];
  const layers = allLayers.slice(0, Math.max(0, Math.min(3, count)));

  // For each layer, try candidate bases (id then name) until we find frames
  await Promise.all(layers.map(async layer => {
    layer.frames = [];
    const candidates = baseCandidates(layer.category, layer.element);
    for (const b of candidates) {
      const f = await loadFramesFromBase(b);
      if (f && f.length) {
        layer.frames = f;
        break;
      }
    }
  }));

  // If no frames at all, clear and return
  if (layers.every(l => !l.frames || l.frames.length === 0)) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  // Cancel previous animation
  if (__validatorAnimationId) cancelAnimationFrame(__validatorAnimationId);

  // Simple animation loop for sequences
  const start = performance.now();
  function tick(now) {
    const elapsed = now - start;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layers.forEach(layer => {
      if (!layer.frames || layer.frames.length === 0) return;
      ctx.save();
      ctx.globalAlpha = layer.alpha;
      if (layer.frames.length === 1) {
        try { ctx.drawImage(layer.frames[0], layer.x, layer.y, canvas.width, canvas.height); } catch (e) {}
      } else {
        const idx = Math.floor((elapsed / 1000) * layer.fps) % layer.frames.length;
        try { ctx.drawImage(layer.frames[idx], layer.x, layer.y, canvas.width, canvas.height); } catch (e) {}
      }
      ctx.restore();
    });

    __validatorAnimationId = requestAnimationFrame(tick);
  }

  __validatorAnimationId = requestAnimationFrame(tick);
}
document.getElementById("mechanicSelector")
  .addEventListener("change", async function(e) {
    const key = e.target.value;
    activeMechanicProfile = key;

    if (key === 'custom') {
      document.getElementById("customMechanicFile").classList.remove("hidden");
      return;
    }
    document.getElementById("customMechanicFile").classList.add("hidden");
    try {
      await loadMechanicsProfile(key);
      displayCard("Mechanics switched to " + key);
    } catch (err) {
      console.error(err);
      displayCard(`<b>Error:</b> Could not load ${key} mechanics.`);
    }
  });

document.getElementById("customMechanicFile")
  .addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        spellData.bodyMechanics   = obj.body;
        spellData.trailMechanics  = obj.trail;
        spellData.impactMechanics = obj.impact;
        displayCard("Custom mechanics loaded.");
      } catch {
        displayCard("<b>Error:</b> Invalid JSON format.");
      }
    };
    reader.readAsText(file);
  });
const _flavorSelector = document.getElementById("flavorSelector");
if (_flavorSelector) {
  _flavorSelector.addEventListener("change", async function(e) {
    const key = e.target.value;
    activeFlavorProfile = key;

    if (key === 'custom') {
      const cf = document.getElementById("customFlavorFile");
      if (cf) cf.classList.remove("hidden");
      return;
    }
    const cfHide = document.getElementById("customFlavorFile");
    if (cfHide) cfHide.classList.add("hidden");
    try {
      await loadFlavorProfile(key);
      displayCard("flavor switched to " + key);
    } catch (err) {
      console.error(err);
      displayCard(`<b>Error:</b> Could not load ${key} flavor.`);
    }
  });
} else console.warn('flavorSelector element not found');

const _customFlavorFile = document.getElementById("customFlavorFile");
if (_customFlavorFile) {
  _customFlavorFile.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        // populate both the detailed fields and the top-level flavorText mapping
        spellData.bodyFlavorText   = obj.body;
        spellData.trailFlavorText  = obj.trail;
        spellData.impactFlavorText = obj.impact;
        spellData.flavorText = obj;
        displayCard("Custom flavor loaded.");
      } catch {
        displayCard("<b>Error:</b> Invalid JSON format.");
      }
    };
    reader.readAsText(file);
  });
} else console.warn('customFlavorFile element not found');

// Name selector + custom upload (mirrors mechanic selector behavior)
const _nameSelector = document.getElementById("nameSelector");
if (_nameSelector) {
  _nameSelector.addEventListener("change", async function(e) {
    const key = e.target.value;
    activeNameProfile = key;

    const nameFileInput = document.getElementById("customNameFile");
    if (key === 'custom') {
      if (nameFileInput) nameFileInput.classList.remove("hidden");
      return;
    }
    if (nameFileInput) nameFileInput.classList.add("hidden");
    try {
      await loadNameProfiles(key);
      displayCard("Names switched to " + key);
    } catch (err) {
      console.error(err);
      displayCard(`<b>Error:</b> Could not load ${key} names.`);
    }
  });
} else console.warn('nameSelector element not found');

const _customNameFile = document.getElementById("customNameFile");
if (_customNameFile) {
  _customNameFile.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        // Expecting the same structure as other name JSONs (primary/secondary/tertiary)
        spellData.names = obj;
        displayCard("Custom names loaded.");
      } catch (err) {
        console.error(err);
        displayCard("<b>Error:</b> Invalid JSON format for names.");
      }
    };
    reader.readAsText(file);
  });
} else console.warn('customNameFile element not found');








