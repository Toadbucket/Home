class ScriptManager {
  constructor(mapId, fppId) {
    this.mapCanvas     = document.getElementById(mapId);
    this.fppCanvas     = document.getElementById(fppId);
    this.mapCtx        = this.mapCanvas.getContext('2d');
    this.fppCtx        = this.fppCanvas.getContext('2d');
    this.registry      = {};
    this.scripts = [
  { src: 'assets/VisualScene/mapScript.js' },
  { src: 'assets/VisualScene/fppScript.js' },
  { src: 'assets/games/generator.js' },
  //{ src: 'assets/games/js/main.js', type: 'module' },
  { src: 'assets/validator/validator.js' },
  { src: 'assets/VisualScene/sceneEffects.js' },
];

    this.jsonFile      = 'assets/VisualScene/sceneData.json';
    this.rooms         = {};
    this.currentRoomId = null;
    this.rotation      = 0; // 0=N,1=E,2=S,3=W
    this.spellbook     = {}; // store validated spells here
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
      this.renderAll();
    });
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
        return;
      }
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
    this.renderAll();
  }

  renderAll() {
    this.runInstruction({ function: 'drawMap', args: {} });
    this.runInstruction({ function: 'drawFPP', args: {} });
  }
}











