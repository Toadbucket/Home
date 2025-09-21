document.getElementById("validateButton").addEventListener("click", validateSpell);

// Global variable to store fetched spell data
let spellData = {};

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

// Only generate an image if there are enough elements
if (elements.length >= 3) {
generateSpellImage(elements[0].name, elements[1].name, elements[2].name);
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

// Seed Breakdown Section
html += `<div class="section"><b>Seed Breakdown:</b><ul>`;
elements.forEach((s, i) => {
html += `<li>Rank ${i + 1}: ${s.name} (#${s.id}) Total=${s.total}</li>`;
});
html += `</ul></div>`;

// Attributes Section
html += `<div class="section"><b>Attributes:</b><ul>`;
rankedStats.forEach(r => {
html += `<li>${r.stat}: ${r.value} (via ${r.element})</li>`;
});
html += `</ul></div>`;

// Spell Profile Section
html += `<div class="section"><b>Spell Profile:</b><ul>`;

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

// Power and Validity
html += `<div class="section"><b>Power:</b> ${totalSum}</div>`;
html += `<div class="section">${validity}</div>`;

return html;
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

