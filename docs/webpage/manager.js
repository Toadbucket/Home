class ScriptManager {
  constructor(mapId, fppId) {
    this.mapCanvas     = document.getElementById(mapId);
    this.fppCanvas     = document.getElementById(fppId);
    this.mapCtx        = this.mapCanvas.getContext('2d');
    this.fppCtx        = this.fppCanvas.getContext('2d');
    this.registry      = {};
    this.scripts = [
  { src: 'assets/VisualScene/mapScript.js' },
  { src: 'assets/VisualScene/entities.js' },
  { src: 'assets/VisualScene/fppScript.js' },
  { src: 'assets/games/generator.js' },
  //{ src: 'assets/games/js/main.js', type: 'module' },
  { src: 'assets/validator/validator.js' },
  { src: 'assets/VisualScene/sceneEffects.js' },
];

    this.jsonFile      = 'assets/VisualScene/sceneDataComplex.json';
    this.rooms         = {};
    this.currentRoomId = null;
    this.rotation      = 0; // 0=N,1=E,2=S,3=W
    this.spellbook     = {}; // store validated spells here
    this.inventory     = {}; // basic inventory: map of itemId -> count or details
    this._sceneStack    = []; // stack for large-room sublevels
    this._inventoryEl   = null; // inventory UI element
  }

  loadScript(srcOrObj) {
    return new Promise((resolve, reject) => {
      const tag = document.createElement('script');
      const src  = typeof srcOrObj === 'string' ? srcOrObj : (srcOrObj && srcOrObj.src);
      const type = srcOrObj && srcOrObj.type;
      if (!src) return reject(new Error('No script src provided'));
      tag.src = src;
      if (type) tag.type = type;
      tag.onload  = () => resolve(src);
      tag.onerror = () => reject(new Error(`Failed to load ${src}`));
      document.body.appendChild(tag);
    });
  }

  async loadJSON(src) {
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Failed to fetch ${src}`);
    return res.json();
  }

  registerFunction(name, fn) {
    this.registry[name] = fn;
  }

  addItem(itemId, details) {
    if (!itemId) return;
    const key = itemId;
    if (!this.inventory[key]) this.inventory[key] = 0;
    this.inventory[key] += 1;
    if (!this.inventory.__meta) this.inventory.__meta = {};
    this.inventory.__meta[key] = details || {};
    console.log(`Picked up ${itemId}`);
    this.updateInventoryUI();
  }

  hasItem(itemId) {
    return !!(this.inventory && this.inventory[itemId]);
  }

  removeItem(itemId) {
    if (this.inventory && this.inventory[itemId]) {
      this.inventory[itemId] -= 1;
      if (this.inventory[itemId] <= 0) delete this.inventory[itemId];
      this.updateInventoryUI();
    }
  }

  runInstruction(inst) {
    const fn = this.registry[inst.function];
    if (typeof fn === 'function') fn(inst.args, this);
    else console.warn(`No function for "${inst.function}"`);
  }

  bindKeys() {
    window.addEventListener('keydown', e => {
      switch (e.key) {
        case 'ArrowLeft':  this.rotation = (this.rotation + 3) % 4; break;
        case 'ArrowRight': this.rotation = (this.rotation + 1) % 4; break;
        case 'ArrowUp':    this.moveForward();  break;
        case 'ArrowDown':  this.moveBackward(); break;
      }
      // Interact with entities using Space or Enter
      if (e.key === ' ' || e.key === 'Enter') {
        this.interact();
      }
      this.renderAll();
    });
  }

  interact() {
    const room = this.rooms[this.currentRoomId];
    if (!room || !room.entities || !room.entities.length) {
      console.log('Nothing to interact with here.');
      return;
    }
    // Pick the first interactable entity
    const entIndex = room.entities.findIndex(en => en.interactable !== false);
    if (entIndex === -1) {
      console.log('No interactable entities in this room.');
      return;
    }
    const ent = room.entities[entIndex];
    console.log('Interacting with', ent);
    // Handle common entity types
    switch (ent.type) {
      case 'largeRoom':
        // enter a nested sublevel
        if (ent.subLevel) {
          this.enterLargeRoom({ entity: ent, parentRoomId: this.currentRoomId });
        } else console.log('Large room entity missing subLevel path');
        break;
      case 'key':
        this.addItem(ent.id || ('key_' + Date.now()), { name: ent.name || 'Key' });
        room.entities.splice(entIndex, 1);
        break;
      case 'torch':
        this.addItem(ent.id || ('torch_' + Date.now()), { name: ent.name || 'Torch' });
        room.entities.splice(entIndex, 1);
        break;
      case 'door':
        // door should include required (key id) and direction
        if (ent.required && !this.hasItem(ent.required)) {
          console.log('Door is locked. Requires', ent.required);
        } else {
          // open the door by adding exits between rooms
          this.addExitBetweenRooms(this.rooms[this.currentRoomId], ent.direction || ent.dir || 'N');
          // optionally consume key
          if (ent.required) this.removeItem(ent.required);
          // mark door as opened
          ent.opened = true;
          console.log('Door opened');
        }
        break;
      case 'chest':
        if (ent.required && !this.hasItem(ent.required)) {
          console.log('Chest is locked. Requires', ent.required);
        } else {
          if (ent.contents && Array.isArray(ent.contents)) {
            if (ent.required) this.removeItem(ent.required);
            ent.contents.forEach(item => {  
              this.addItem(item.id || ('item_' + Date.now()), { name: item.name || 'Item' });
            });
          }
        }
        break;
      case 'puzzle': {
  // Collect any requirement fields that exist
  const reqs = [
    ent.requiredPrimary,
    ent.requiredSecondary,
    ent.requiredTertiary
  ].filter(Boolean);

  // If no requirements were defined, treat as no requirement
  if (reqs.length === 0) {
    console.log(`Puzzle '${ent.name || ent.id}' has no requirements.`);
    break;
  }

  // Find missing spells
  const missing = reqs.filter(r => !this.spellbook[r]);

  if (missing.length > 0) {
    console.log(
      `Puzzle '${ent.name || ent.id}' is unsolved. Missing: ${missing.join(', ')}`
    );
  } else {
    // All requirements met → open the exit
    this.addExitBetweenRooms(
      this.rooms[this.currentRoomId],
      ent.direction || ent.dir || 'N'
    );

    ent.solved = true;
    console.log(`Puzzle '${ent.name || ent.id}' solved.`);
  }
  break;
}

      case 'enemy':
        // simplistic: requires 'attack' or 'spell' in spellbook; here we just log
        console.log('Enemy encountered:', ent.name || ent.type);
        break;
      default:
        console.log('Interacted with', ent.type);
        break;
    }
    this.renderAll();
  }

  addExitBetweenRooms(room, direction) {
    if (!room) return;
    const dirs = { N:[0,-1], E:[1,0], S:[0,1], W:[-1,0] };
    const opp = { N:'S', E:'W', S:'N', W:'E' };
    const d = direction.toUpperCase();
    if (!dirs[d]) return;
    const [dx,dy] = dirs[d];
    const neighborKey = Object.keys(this.rooms).find(id => {
      const r = this.rooms[id];
      return r.x === room.x + dx && r.y === room.y + dy;
    });
    if (!neighborKey) {
      console.log('No room in that direction to connect to.');
      return;
    }
    if (!room.exits) room.exits = [];
    if (!room.exits.includes(d)) room.exits.push(d);
    const nb = this.rooms[neighborKey];
    if (!nb.exits) nb.exits = [];
    if (!nb.exits.includes(opp[d])) nb.exits.push(opp[d]);
  }

  moveForward()  { this.moveInDirection(this.rotation); }
  moveBackward() { this.moveInDirection((this.rotation + 2) % 4); }

  moveInDirection(rot) {
    const dirs = ['N','E','S','W'];
    const room = this.rooms[this.currentRoomId];
    if (!room?.exits?.includes(dirs[rot])) return;
    const [dx,dy] = { N:[0,-1], E:[1,0], S:[0,1], W:[-1,0] }[dirs[rot]];
    for (let id in this.rooms) {
      const r = this.rooms[id];
      if (r.x === room.x + dx && r.y === room.y + dy) {
        this.currentRoomId = id;
        // If we're inside a pushed sublevel and the new room indicates returnToParent, exit
        if (this._sceneStack && this._sceneStack.length > 0) {
          const cur = this.rooms[this.currentRoomId];
          if (cur && cur.returnToParent) {
            // exit back to parent scene
            setTimeout(() => this.exitLargeRoom(), 100);
          }
        }
        return;
      }
    }
  }

  // Load level with optional behavior for sublevels
  async loadSelectedLevel(levelPath, options = {}) {
    try {
      // If options.push is true, keep current scene on stack (caller should have pushed state)
      this.rooms = {};
      this.rotation = 0;
      // Load the level JSON file
      const levelData = await this.loadJSON(levelPath);

      // Populate rooms from the level data
      if (levelData.rooms && Array.isArray(levelData.rooms)) {
        levelData.rooms.forEach(r => {
          if (!r.entities) r.entities = [];
          this.rooms[r.id] = r;
        });
      }

      // Set starting room
      if (levelData.startRoom) {
        this.currentRoomId = levelData.startRoom;
      } else {
        const firstRoomId = Object.keys(this.rooms)[0];
        this.currentRoomId = firstRoomId;
      }

      // Execute any level instructions
      if (levelData.instructions && Array.isArray(levelData.instructions)) {
        levelData.instructions.forEach(i => this.runInstruction(i));
      }

      this.renderAll();
      console.log(`Level loaded successfully: ${levelPath}`);
    } catch (error) {
      console.error(`Failed to load level: ${error.message}`);
    }
  }

  // Enter a large sublevel: push current scene and load sublevel path
  async enterLargeRoom({ entity, parentRoomId }) {
    if (!entity || !entity.subLevel) return;
    // push current scene state
    this._sceneStack.push({
      rooms: this.rooms,
      currentRoomId: this.currentRoomId,
      jsonFile: this.jsonFile,
      parentRoomId: parentRoomId,
      parentEntityId: entity.id,
      parentDirection: entity.direction || entity.dir || null
    });
    // load sublevel
    await this.loadSelectedLevel(entity.subLevel, { push: true });
  }

  // Exit the current sublevel and restore parent scene, placing the player past the large room cell
  exitLargeRoom() {
    if (!this._sceneStack || this._sceneStack.length === 0) return;
    const parent = this._sceneStack.pop();
    if (!parent) return;
    // Restore rooms and jsonFile
    this.rooms = parent.rooms;
    // compute target room (past the large room cell) using parentDirection
    const parentRoom = this.rooms[parent.parentRoomId];
    if (!parentRoom) {
      this.currentRoomId = parent.currentRoomId;
      this.renderAll();
      return;
    }
    const dirs = { N:[0,-1], E:[1,0], S:[0,1], W:[-1,0] };
    const dir = (parent.parentDirection || 'E').toUpperCase();
    const [dx,dy] = dirs[dir] || [1,0];
    // find room at parentRoom.x + dx, parentRoom.y + dy
    const target = Object.keys(this.rooms).find(id => {
      const r = this.rooms[id];
      return r.x === parentRoom.x + dx && r.y === parentRoom.y + dy;
    });
    if (target) {
      // ensure exits are connected
      if (!parentRoom.exits) parentRoom.exits = [];
      if (!parentRoom.exits.includes(dir)) parentRoom.exits.push(dir);
      const opp = { N:'S', E:'W', S:'N', W:'E' }[dir];
      const tRoom = this.rooms[target];
      if (!tRoom.exits) tRoom.exits = [];
      if (!tRoom.exits.includes(opp)) tRoom.exits.push(opp);
      this.currentRoomId = target;
    } else {
      // fallback: return to the parent room
      this.currentRoomId = parent.parentRoomId || parent.currentRoomId;
    }
    this.renderAll();
  }

  // Inventory UI helpers
  createInventoryUI() {
    try {
      let panel = document.getElementById('inventoryPanel');
      if (!panel) {
        panel = document.createElement('div');
        panel.id = 'inventoryPanel';
        panel.style.position = 'relative';
        panel.style.width = '100%';
        panel.style.marginTop = '10px';
        panel.style.marginBottom = '10px';
        panel.style.background = '#222';
        panel.style.border = 'solid 3px #555';
        panel.style.color = '#eee';
        panel.style.padding = '10px';
        panel.style.font = '12px sans-serif';
        panel.style.boxSizing = 'border-box';
        panel.innerHTML = '<b style="display:block;margin-bottom:8px;">Inventory (click to use)</b><div id="inventoryItems" style="display:flex;flex-wrap:wrap;gap:5px;"></div>';
        
        // Insert after the views container
        const viewsContainer = document.getElementById('views');
        if (viewsContainer && viewsContainer.parentNode) {
          viewsContainer.parentNode.insertBefore(panel, viewsContainer.nextSibling);
        } else {
          document.body.appendChild(panel);
        }
      }
      this._inventoryEl = document.getElementById('inventoryItems');
      this.updateInventoryUI();
    } catch (e) { console.warn('Could not create inventory UI', e); }
  }

  updateInventoryUI() {
    try {
      if (!this._inventoryEl) return;
      const keys = Object.keys(this.inventory).filter(k => k !== '__meta');
      if (keys.length === 0) {
        this._inventoryEl.innerHTML = '<i style="color:#999;">(empty)</i>';
        return;
      }
      this._inventoryEl.innerHTML = '';
      keys.forEach(k => {
        const meta = (this.inventory.__meta && this.inventory.__meta[k]) || {};
        const cnt = this.inventory[k] || 0;
        const btn = document.createElement('button');
        btn.style.flex = '0 1 auto';
        btn.style.padding = '8px 12px';
        btn.style.fontSize = '12px';
        btn.style.background = '#444';
        btn.style.color = '#eee';
        btn.style.border = 'solid 2px #555';
        btn.style.cursor = 'pointer';
        btn.style.borderRadius = '4px';
        btn.textContent = `${meta.name || k} (x${cnt})`;
        btn.title = 'Click to use this item';
        btn.addEventListener('click', () => this.useItem(k));
        btn.addEventListener('mouseenter', () => btn.style.background = '#666');
        btn.addEventListener('mouseleave', () => btn.style.background = '#444');
        this._inventoryEl.appendChild(btn);
      });
    } catch (e) { console.warn('Could not update inventory UI', e); }
  }

  // Use an item from inventory (generic hook for now)
  useItem(itemId) {
    console.log(`Using item: ${itemId}`);
    // Placeholder: add specific use logic per item type if needed
    // Example: if (itemId === 'torch') { this.lightTorch(); }
  }

  async loadSelectedLevel(levelPath) {
    try {
      // Clear existing rooms
      this.rooms = {};
      this.rotation = 0;
      
      // Load the level JSON file
      const levelData = await this.loadJSON(levelPath);
      
      // Populate rooms from the level data
      if (levelData.rooms && Array.isArray(levelData.rooms)) {
        levelData.rooms.forEach(r => {
          // ensure entities array exists for consistent processing
          if (!r.entities) r.entities = [];
          this.rooms[r.id] = r;
        });
      }
      
      // Set starting room
      if (levelData.startRoom) {
        this.currentRoomId = levelData.startRoom;
      } else {
        // Default to first room if not specified
        const firstRoomId = Object.keys(this.rooms)[0];
        this.currentRoomId = firstRoomId;
      }
      
      // Execute any level instructions
      if (levelData.instructions && Array.isArray(levelData.instructions)) {
        levelData.instructions.forEach(i => this.runInstruction(i));
      }
      
      // Render the loaded level
      this.renderAll();
      console.log(`Level loaded successfully: ${levelPath}`);
    } catch (error) {
      console.error(`Failed to load level: ${error.message}`);
    }
  }


  
  async init() {
    window.gameManager = this;
    // 1) Load all scripts
    await Promise.all(this.scripts.map(s => this.loadScript(s)));
    // 2) Load scene JSON
    const scene = await this.loadJSON(this.jsonFile);
    scene.rooms.forEach(r => (this.rooms[r.id] = r));
    this.currentRoomId = scene.startRoom;
    scene.instructions.forEach(i => this.runInstruction(i));
    // 3) Bind controls & initial render
    this.bindKeys();
    // create inventory UI and initial render
    this.createInventoryUI();
    this.renderAll();
    // 4) Add Cast Spell button to controls area
    try {
      let controlsContainer = document.getElementById('rpgControls');
      if (!controlsContainer) {
        controlsContainer = document.createElement('div');
        controlsContainer.id = 'rpgControls';
        controlsContainer.style.width = '100%';
        controlsContainer.style.marginTop = '10px';
        controlsContainer.style.marginBottom = '10px';
        controlsContainer.style.display = 'flex';
        controlsContainer.style.gap = '10px';
        controlsContainer.style.flexWrap = 'wrap';
        
        // Insert after inventory
        const invPanel = document.getElementById('inventoryPanel');
        if (invPanel && invPanel.parentNode) {
          invPanel.parentNode.insertBefore(controlsContainer, invPanel.nextSibling);
        } else {
          document.body.appendChild(controlsContainer);
        }
      }
      
      let btn = document.getElementById('castSpellBtn');
      if (!btn) {
        btn = document.createElement('button');
        btn.id = 'castSpellBtn';
        btn.textContent = 'Cast Spell';
        btn.style.padding = '10px 20px';
        btn.style.fontSize = '16px';
        btn.style.background = '#444';
        btn.style.color = '#eee';
        btn.style.border = 'solid 3px #555';
        btn.style.cursor = 'pointer';
        controlsContainer.appendChild(btn);
      }
      btn.addEventListener('click', () => this.castSpell());
    } catch (e) { console.warn('Could not add Cast Spell button', e); }
  }

  castSpell() {
    const s = window.lastGeneratedSpell;
    if (!s) {
      console.log('No spell generated yet. Use the validator to build a spell first.');
      return;
    }
    if (!s.valid) {
      console.log('Spell is invalid and fizzles.');
      return;
    }
    const room = this.rooms[this.currentRoomId];
    if (!room) return;

    const primaryName = (s.primary && s.primary.name) || null;
    // Apply effects to entities in the room
    const ents = room.entities || [];
    for (let i = ents.length - 1; i >= 0; i--) {
      const ent = ents[i];
      if (!ent) continue;
      switch (ent.type) {
        case 'enemy': {
  // Initialize enemy HP if not set
  const baseHP = ent.hp != null ? ent.hp : 10;
  if (ent.hp == null) ent.hp = baseHP;

  // If enemy is still alive, it blocks the path AND attacks the player
  if (ent.hp > 0) {
    console.log(`Enemy encountered: ${ent.name || ent.type}`);

    // Enemy attacks player
    const enemyDmg = ent.damage || 2; // default enemy damage
    this.player.hp -= enemyDmg;
    if (this.player.hp < 0) this.player.hp = 0;

    console.log(`${ent.name || 'Enemy'} hits you for ${enemyDmg} damage! Player HP: ${this.player.hp}`);

    // Update UI health bar
    this.updateHealthBar?.();

    // Check for player death
    if (this.player.hp <= 0) {
      console.log("You have been defeated!");
      // Trigger game over logic here if you want
      break;
    }

    // Enemy blocks the path until defeated
    console.log("The enemy blocks your path!");
  }

  // --- Player spell damage (your existing logic) ---
  let dmg = s.totalPower || s.totalPower === 0 ? s.totalPower : (s.totalPower = s.totalPower || 0);

  // Weakness multiplier
  if (ent.weakness) {
    const weak = Array.isArray(ent.weakness) ? ent.weakness : [ent.weakness];
    if (primaryName && weak.map(w => w.toLowerCase()).includes(primaryName.toLowerCase())) {
      dmg *= 2;
    }
  }

  // Apply damage
  ent.hp -= dmg;
  console.log(`Spell hits ${ent.name || 'enemy'} for ${dmg} damage. HP left: ${Math.max(0, ent.hp)}`);

  // Enemy defeated
  if (ent.hp <= 0) {
    console.log(`${ent.name || 'Enemy'} defeated.`);

    // Drop loot
    if (ent.contents && Array.isArray(ent.contents)) {
      ent.contents.forEach(item => {
        this.addItem(item.id || ('item_' + Date.now()), item);
      });
    }

    // Remove enemy from room
    ents.splice(i, 1);
  }

} break;

        case 'puzzle': {
  // Collect any required elements
  const reqs = [
    ent.requiredPrimary,
    ent.requiredSecondary,
    ent.requiredTertiary
  ].filter(Boolean);

  // If puzzle has no requirements, spell does nothing
  if (reqs.length === 0) {
    console.log(`Spell had no effect on puzzle '${ent.name || ent.id}'. No elemental requirements.`);
    break;
  }

  // Check if the spell's primary element matches ANY required element
  const matches = reqs.some(r => r.toLowerCase() === primaryName.toLowerCase());

  if (matches) {
    console.log(`Puzzle '${ent.name || ent.id}' solved by ${primaryName} spell.`);
    this.addExitBetweenRooms(room, ent.direction || ent.dir || 'N');
    ents.splice(i, 1); // remove puzzle entity
  } else {
    console.log(
      `Spell had no effect on puzzle '${ent.name || ent.id}'. Requires: ${reqs.join(', ')}`
    );
  }
} break;
  
        case 'door': {
          // doors can be unlocked by key (existing) or by spells if they specify requiredSpellElement
          if (ent.requiredSpellElement && primaryName && ent.requiredSpellElement.toLowerCase() === primaryName.toLowerCase()) {
            console.log('Door unlocked by spell:', ent.name || ent.id);
            this.addExitBetweenRooms(room, ent.direction || ent.dir || 'N');
            ents.splice(i,1);
          } else {
            // unchanged; spell might do nothing
            console.log('Spell had no direct effect on the door.');
          }
        } break;
        default:
          // generic effect: if entity has 'flammable' and primary is Fire, remove it
          if (ent.flammable && primaryName && primaryName.toLowerCase() === 'fire') {
            console.log(`The ${ent.type} is burned by the spell.`);
            ents.splice(i,1);
          }
      }
    }

    this.renderAll();
  }
  

  renderAll() {
    this.runInstruction({ function: 'drawMap', args: {} });
    this.runInstruction({ function: 'drawEntities', args: {} });
    this.runInstruction({ function: 'drawFPP', args: {} });
    this.runInstruction({ function: 'drawFPPEntities', args: {} });
  }
}


(function() {
  if (console._patched) return; // prevent double patching
  console._patched = true;

  const originalLog = console.log;

  console.log = function(...args) {
    // Keep normal console behavior
    originalLog.apply(console, args);

    // Show message on page
    showMessage(args.join(" "));
  };

  function showMessage(text) {
  const container = document.getElementById("message-container");
  const msg = document.createElement("div");
  msg.className = "message";
  msg.textContent = text;

  // Insert at the top
  if (container.firstChild) {
    container.insertBefore(msg, container.firstChild);
  } else {
    container.appendChild(msg);
  }

  // Remove after 3 seconds
  setTimeout(() => {
    msg.style.opacity = "0";
    setTimeout(() => msg.remove(), 500);
  }, 3000);
}
})();



window.addEventListener('DOMContentLoaded', () => {
      const mgr = new ScriptManager('mapCanvas', 'fppCanvas');
      mgr.init();
      
      // Connect level select button to loadSelectedLevel
      const loadBtn = document.getElementById('loadLevelBtn');
      const levelSelect = document.getElementById('levelSelect');
      
      if (loadBtn && levelSelect) {
        // Enable button when a level is selected
        levelSelect.addEventListener('change', () => {
          loadBtn.disabled = levelSelect.value === '';
        });
        
        // Load level when button is clicked
        loadBtn.addEventListener('click', () => {
          const selectedLevel = levelSelect.value;
          if (selectedLevel && window.gameManager) {
            window.gameManager.loadSelectedLevel(selectedLevel);
          }
        });
      }
    });










