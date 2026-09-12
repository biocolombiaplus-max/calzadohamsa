function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// zoom=1 siempre corresponde a "mostrar la foto completa sin recortar nada"
// (con fondo blanco a los lados si la foto no es cuadrada). Un zoom más
// alto acerca desde ahí, recortando por igual desde el centro — nunca
// deforma la foto ni la sale de proporción. getCoverZoom() (abajo) calcula
// el zoom exacto al que la foto llena el cuadrado sin ninguna franja
// blanca, para usarlo como punto de partida recomendado.
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

// El zoom (relativo al "contain" de arriba) al que la foto llena el
// cuadrado por completo, sin ninguna franja blanca — equivale al recorte
// clásico tipo "cover". Siempre es >= 1.
export function getCoverZoom(naturalWidth: number, naturalHeight: number): number {
  return Math.max(naturalWidth, naturalHeight) / Math.min(naturalWidth, naturalHeight);
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
