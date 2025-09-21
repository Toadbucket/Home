(function() {
  const mgr = window.gameManager;

  function drawFPP(_, mgr) {
    const ctx = mgr.fppCtx, w = ctx.canvas.width, h = ctx.canvas.height;
    ctx.clearRect(0,0,w,h);

    const room = mgr.rooms[mgr.currentRoomId];
    if (!room) return;

    // floor
    ctx.fillStyle = room.floorColor || '#333';
    ctx.beginPath();
    ctx.moveTo(0,h); ctx.lineTo(w,h);
    ctx.lineTo(w-100,h/2); ctx.lineTo(100,h/2);
    ctx.closePath(); ctx.fill();

    // ceiling
    ctx.fillStyle = room.ceilingColor || '#222';
    ctx.beginPath();
    ctx.moveTo(100,h/6); ctx.lineTo(w-100,h/6.5);
    ctx.lineTo(w,0); ctx.lineTo(0,0);
    ctx.closePath(); ctx.fill();

    // walls
    const dirs     = ['N','E','S','W'];
    const back     = room.walls?.[dirs[mgr.rotation]]               || '#555';
    const left     = room.walls?.[dirs[(mgr.rotation+3)%4]]        || '#444';
    const right    = room.walls?.[dirs[(mgr.rotation+1)%4]]        || '#444';

    ctx.fillStyle = back;
    ctx.fillRect(100, h/6-6, w-200, h/2+2);

    ctx.fillStyle = left;
    ctx.beginPath();
    ctx.moveTo(0,0); ctx.lineTo(100,h/6.5);
    ctx.lineTo(100,h/1.54+2); ctx.lineTo(0,h);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = right;
    ctx.beginPath();
    ctx.moveTo(w,0); ctx.lineTo(w-100,h/6.5);
    ctx.lineTo(w-100,h/1.54+2); ctx.lineTo(w,h);
    ctx.closePath(); ctx.fill();

    // overlays
    (room.overlays||[]).forEach(o => {
      ctx.fillStyle = o.color||'#aaa';
      const bx = 100 + (w-200)*o.offsetX;
      const by = h/2 + (h/2)*o.offsetY;
      ctx.fillRect(bx-10, by-10, 20, 20);
    });
  }

  mgr.registerFunction('drawFPP', drawFPP);
})();
