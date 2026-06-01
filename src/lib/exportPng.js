export async function exportPng(canvas, gl, drawFn, width, height, filename) {
  const origW = canvas.width;
  const origH = canvas.height;

  if (width && height && (width !== origW || height !== origH)) {
    canvas.width = width;
    canvas.height = height;
    gl.viewport(0, 0, width, height);
    drawFn();
  }

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      if (!blob) { resolve(false); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `aurora-export.png`;
      a.click();
      URL.revokeObjectURL(url);
      resolve(true);

      if (width && height && (width !== origW || height !== origH)) {
        canvas.width = origW;
        canvas.height = origH;
        gl.viewport(0, 0, origW, origH);
        drawFn();
      }
    }, 'image/png');
  });
}
