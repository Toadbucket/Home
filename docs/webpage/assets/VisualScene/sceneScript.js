/* Example scene-drawing functions */

(function() {
  const mgr = window.gameManager;

  // Draw a single tile at (x, y) with a color or image
  function drawTile(ctx, { x, y, size = 32, color = '#0a0' }) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
  }

  // Draw a character sprite placeholder
  function drawCharacter(ctx, { x, y, size = 32, color = '#fa0' }) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      x * size + size / 2,
      y * size + size / 2,
      size / 2 - 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Register functions with the manager
  mgr.registerFunction('drawTile', drawTile);
  mgr.registerFunction('drawCharacter', drawCharacter);
})();
