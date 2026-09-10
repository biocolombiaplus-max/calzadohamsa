function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Dibuja la foto centrada en un lienzo cuadrado de tamaño fijo (para que
// toda foto de producto termine con el mismo formato prolijo), partiendo
// siempre de mostrar el producto COMPLETO sin recortar nada (zoom=1, la
// foto entera cabe adentro, con fondo blanco a los lados si hace falta) y
// permitiendo acercar desde ahí (zoom > 1) para un encuadre más ajustado —
// el acercamiento siempre recorta por igual desde el centro hacia afuera,
// nunca deforma la foto ni la sale de proporción.
export async function getZoomedContainBlob(imageSrc: string, zoom = 1, outputSize = 1200): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen en este navegador.');

  const containScale = Math.min(outputSize / image.width, outputSize / image.height);
  const scale = containScale * Math.max(zoom, 1);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  const offsetX = (outputSize - drawWidth) / 2;
  const offsetY = (outputSize - drawHeight) / 2;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputSize, outputSize);
  ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

  return canvasToJpegBlob(canvas);
}

function canvasToJpegBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen.'))),
      'image/jpeg',
      0.92,
    );
  });
}
