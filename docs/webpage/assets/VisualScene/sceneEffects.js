(function() {
  const mgr = window.gameManager;

  function lightTorch(_, { x, y }) {
    const f = mgr.fppCtx;
    f.fillStyle = 'rgba(255,200,0,0.5)';
    f.beginPath();
    f.arc(200, 300, 50, 0, Math.PI*2);
    f.fill();
  }

  function clearDebris() {
    console.log('Debris cleared in', mgr.currentRoomId);
  }

  mgr.registerFunction('lightTorch', lightTorch);
  mgr.registerFunction('clearDebris', clearDebris);
  mgr.registerFunction('triggerTag', ({ tag }) => {
    const effects = mgr.rooms[mgr.currentRoomId].tagEffects?.[tag] || [];
    effects.forEach(i => mgr.runInstruction(i));
  });
})();
