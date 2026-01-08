(function() {
  const mgr = window.gameManager;

  function drawMap(_, mgr) {
    const ctx  = mgr.mapCtx, size = 40;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    // rooms
    Object.values(mgr.rooms).forEach(r => {
      ctx.fillStyle = '#444';
      ctx.fillRect(r.x*size+.5, r.y*size+.5, size-4, size-4);
    });

    // connections
    ctx.strokeStyle = '#888';
    Object.values(mgr.rooms).forEach(r => {
      ['N','E','S','W'].forEach((d,i) => {
        if (r.exits?.includes(d)) {
          const [dx,dy] = [[0,-1],[1,0],[0,1],[-1,0]][i];
          ctx.beginPath();
          ctx.moveTo(r.x*size + size/2, r.y*size + size/2);
          ctx.lineTo((r.x+dx)*size + size/2, (r.y+dy)*size + size/2);
          ctx.stroke();
        }
      });
    });

    // player arrow
    const p = mgr.rooms[mgr.currentRoomId];
    const cx = p.x*size + size/2, cy = p.y*size + size/2;
    const L  = size * 0.4;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((mgr.rotation * Math.PI)/2);
    ctx.fillStyle = '#0f0';
    ctx.beginPath();
    ctx.moveTo(0, -L);
    ctx.lineTo(L/2, L/2);
    ctx.lineTo(-L/2, L/2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  mgr.registerFunction('drawMap', drawMap);
})();
