export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

// Recorta la región elegida por el usuario y la dibuja en un lienzo cuadrado
// de tamaño fijo (independiente de las dimensiones originales de la foto),
// para que toda foto de producto termine con el mismo formato prolijo.
export async function getCroppedImageBlob(
  imageSrc: string,
  crop: PixelCrop,
  outputSize = 1200,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen en este navegador.');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, outputSize, outputSize);
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outputSize, outputSize);

  return canvasToJpegBlob(canvas);
}

// Un recorte, por definición, solo puede tomar una parte de la foto que ya
// exista — por eso una foto muy alta o muy ancha nunca puede "verse completa"
// dentro de un recorte cuadrado. Esta función no recorta nada: reduce la
// foto entera (sin deformarla) hasta que quepa completa dentro del cuadro, y
// rellena el espacio sobrante en blanco. Es la opción para cuando la clienta
// quiere ver el producto completo sí o sí, aunque queden franjas blancas.
export async function getContainedImageBlob(imageSrc: string, outputSize = 1200): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo procesar la imagen en este navegador.');

  const scale = Math.min(outputSize / image.width, outputSize / image.height);
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
