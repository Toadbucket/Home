/* Entity system for VisualScene
   - Defines simple entity types (key, door, torch, enemy, chest)
   - Draws entity markers on the map and shows labels in FPP
   - Interactions (pickup/open) are handled by ScriptManager.interact()
*/
(function(){
  const types = {
    key:   { color:'#ff0', name:'Key' },
    torch: { color:'#f90', name:'Torch' },
    door:  { color:'#a52', name:'Door' },
    enemy: { color:'#f33', name:'Enemy' },
    chest: { color:'#fc0', name:'Chest' },
    puzzle: { color:'#0cf', name:'Puzzle' },
    largeRoom: { color:'#6cf', name:'LargeRoom' }
  };

  this.player = {
    inventory: [],
    hp: 20,
    maxHp: 50
  };


  function drawEntities(_, mgr) {
    const ctx = mgr.mapCtx, size = 40;
    if (!ctx) return;
    Object.values(mgr.rooms).forEach(r => {
      if (!r.entities) return;
      r.entities.forEach((e, i) => {
        const col = (types[e.type] && types[e.type].color) || '#fff';
        const cx = r.x * size + size * 0.75;
        const cy = r.y * size + size * 0.25 + i * 8;
        ctx.beginPath();
        ctx.fillStyle = col;
        ctx.arc(cx, cy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((e.icon || e.type[0] || '?').toUpperCase(), cx, cy + 3);
      });
    });
  }

  function drawFPPEntities(_, mgr) {
    const ctx = mgr.fppCtx;
    if (!ctx) return;
    const room = mgr.rooms[mgr.currentRoomId];
    if (!room || !room.entities || !room.entities.length) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(ctx.canvas.width - 220, 10, 210, room.entities.length * 20 + 10);
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    let y = 30;
    room.entities.forEach(e => {
      const label = (types[e.type] && types[e.type].name) || e.type;
      ctx.fillStyle = (types[e.type] && types[e.type].color) || '#fff';
      ctx.fillText(`${label}${e.name ? ' - ' + e.name : ''}`, ctx.canvas.width - 20, y);
      y += 20;
    });
    ctx.restore();
  }

  // Expose registration when manager exists
  if (window.gameManager) {
    window.gameManager.registerFunction('drawEntities', drawEntities);
    window.gameManager.registerFunction('drawFPPEntities', drawFPPEntities);
  } else {
    // In case scripts load before manager is created (unlikely here), attach to window
    window._visualSceneEntityFns = { drawEntities, drawFPPEntities };
  }
})();
