document.getElementById("validateButton").addEventListener("click", validateSpell);

function validateSpell() {
const input = document.getElementById("spellSeed").value.trim();

// Clean input to allow only digits, dots, spaces and commas
if (!/^[\d.\s,]*$/.test(input)) {
displayCard(`<b>Error:</b> Invalid characters. Use format: 1.2 2.3 3.0`);
return;
}

// Parse input, initialize all to zero
let spellMap = {1:0,2:0,3:0,4:0,5:0,6:0};
const pairs = input.split(/[\s,]+/).filter(Boolean);

for (const pair of pairs) {
const [idStr, totalStr] = pair.split(".");
const id = parseInt(idStr);
const total = parseInt(totalStr);

if (isNaN(id) || isNaN(total) || id < 1 || id > 6) {
displayCard(`<b>Error:</b> Invalid pair "${pair}". Use format like 1.2 2.3`);
return;
}
spellMap[id] = total;
}

// Build element array
const elements = [
{ id:1, name:"Fire", parity:"Odd", total: spellMap[1] },
{ id:2, name:"Water", parity:"Even", total: spellMap[2] },
{ id:3, name:"Air", parity:"Odd", total: spellMap[3] },
{ id:4, name:"Earth", parity:"Even", total: spellMap[4] },
{ id:5, name:"Chaos", parity:"Odd", total: spellMap[5] },
{ id:6, name:"Arcane", parity:"Even", total: spellMap[6] },
];

let totalOdd = 0, totalEven = 0, totalSum = 0;
elements.forEach(el => {
totalSum += el.total;
if (el.parity === "Odd") totalOdd += el.total;
else totalEven += el.total;
});

// Sort by total desc then id asc
elements.sort((a,b) => (b.total !== a.total ? b.total - a.total : a.id - b.id));

const statsOrder = ["Duration", "Distance", "Speed", "Spread", "Accuracy", "AOE Size"];
const rankedStats = elements.map((s,i) => {
const statValue = Math.round((s.total * s.id) / (i+1));
return { stat: statsOrder[i], element: s.name, value: statValue };
});

const [primary, secondary, tertiary] = elements;

let validity = "", manaCost = 0;
if (totalOdd === totalEven) {
validity = "<span class='invalid'>? Invalid Spell: equal odd and even totals.</span>";
} else {
const dominant = totalOdd > totalEven ? "Odd" : "Even";
manaCost = Math.max(totalOdd, totalEven);
validity = `<span class='valid'>? Valid Spell. Dominant: ${dominant}, Mana Cost: ${manaCost}</span>`;
}

const spellName = generateSpellName(primary.name, secondary.name, tertiary.name);

let html = `<h2>${spellName}</h2>`;
html += `<div class="section"><b>Seed Breakdown:</b><ul>`;
elements.forEach((s,i) => {
html += `<li>Rank ${i+1}: ${s.name} (#${s.id}) Total=${s.total}</li>`;
});
html += `</ul></div>`;

html += `<div class="section"><b>Attributes:</b><ul>`;
rankedStats.forEach(r => {
html += `<li>${r.stat}: ${r.value} (via ${r.element})</li>`;
});
html += `</ul></div>`;

html += `<div class="section"><b>Spell Profile:</b>
<ul>
<li>Primary Effect: ${primary.name}</li>
<li>Secondary Trail: ${secondary.name}</li>
<li>Tertiary Linger: ${tertiary.name}</li>
</ul>
</div>`;

html += `<div class="section"><b>Power:</b> ${totalSum}</div>`;
html += `<div class="section">${validity}</div>`;

displayCard(html);
generateSpellImage(primary.name, secondary.name, tertiary.name);
}

function generateSpellName(primary, secondary, tertiary) {
const prefixes = {
Fire: ["Flaming", "Pyro", "Blazing"],
Water: ["Tidal", "Aqua", "Frost"],
Air: ["Zephyr", "Gale", "Storm"],
Earth: ["Stone", "Terra", "Rooted"],
Chaos: ["Chaotic", "Wild", "Fractured"],
Arcane: ["Mystic", "Eldritch", "Arcane"]
};
const middles = {
Fire: ["Flare", "Inferno", "Spark"],
Water: ["Surge", "Torrent", "Mist"],
Air: ["Draft", "Whirl", "Breeze"],
Earth: ["Quake", "Wall", "Spire"],
Chaos: ["Flux", "Rift", "Vortex"],
Arcane: ["Sigil", "Bolt", "Rune"]
};
const suffixes = {
Fire: ["Ember", "Ash", "Scorch"],
Water: ["Dew", "Flood", "Wash"],
Air: ["Whisp", "Echo", "Wing"],
Earth: ["Shard", "Crust", "Bloom"],
Chaos: ["Scatter", "Twist", "Echo"],
Arcane: ["Seal", "Focus", "Pulse"]
};

const p = randomFrom(prefixes[primary]);
const m = randomFrom(middles[secondary]);
const s = randomFrom(suffixes[tertiary]);

return `${p} ${m} ${s}`;
}

function randomFrom(arr) {
return arr[Math.floor(Math.random() * arr.length)];
}

function displayCard(content) {
const card = document.getElementById("spellCard");
card.innerHTML = content;
card.classList.remove("hidden");
}

// image generator stub
function generateSpellImage(primary, secondary, tertiary) {
const canvas = document.getElementById("spellCanvas");
const ctx = canvas.getContext("2d");
ctx.clearRect(0, 0, canvas.width, canvas.height);

// placeholder colors for now
ctx.fillStyle = primary === "Fire" ? "red" :
primary === "Water" ? "blue" :
primary === "Air" ? "lightblue" :
primary === "Earth" ? "brown" :
primary === "Chaos" ? "purple" : "cyan";
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = "white";
ctx.font = "20px Arial";
ctx.fillText(primary, 10, 30);
ctx.fillText(secondary, 10, 60);
ctx.fillText(tertiary, 10, 90);
}

