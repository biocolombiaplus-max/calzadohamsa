// Hospedaje de imágenes con Cloudinary (plan gratis, sin tarjeta de crédito),
// en lugar de Firebase Storage — que ahora exige el plan de pago Blaze
// incluso para uso gratuito. Mantiene la misma firma de funciones que antes
// para no tener que tocar el formulario de productos.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Importante: NO se recorta a cuadrado aquí. Antes se usaba
// "c_fill,g_auto,w_1200,h_1200" para forzar un cuadrado al subir, pero eso
// recorta y DESCARTA para siempre los píxeles que quedan fuera del cuadrado
// — por eso el interruptor "Completa/Recortada" del admin no cambiaba nada
// visualmente (la foto guardada ya era cuadrada). Ahora solo se limita el
// tamaño máximo (sin recortar nada) y se comprime/sirve en el formato más
// liviano posible (WebP/AVIF). El recorte a cuadrado o el ajuste "completa"
// se decide después, foto por foto, con CSS al mostrarla (ver
// ProductGallery/ProductCard) — así se puede cambiar en cualquier momento
// sin volver a subir el archivo y sin perder nada de la foto original.
const AUTO_OPTIMIZE = 'c_limit,w_1600,h_1600,q_auto,f_auto';

function withAutoOptimization(url: string): string {
  return url.replace('/image/upload/', `/image/upload/${AUTO_OPTIMIZE}/`);
}

export async function uploadProductImage(file: File, _productSlug: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary no está configurado. Agrega NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (ver README.md).',
    );
  }

  // Deliberadamente solo se envían "file" y "upload_preset": son los dos
  // únicos parámetros que Cloudinary permite sin restricción en TODAS las
  // cuentas para subidas "unsigned". Parámetros como "folder" pueden ser
  // rechazados según el modo de carpetas de la cuenta (cuentas nuevas usan
  // "Dynamic Folder Mode" por defecto), así que se evitan para máxima
  // compatibilidad.
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message || `No se pudo subir la imagen (error ${response.status}).`;
    throw new Error(message);
  }

  if (!data?.secure_url) {
    throw new Error('Cloudinary no devolvió la URL de la imagen. Intenta de nuevo.');
  }

  return withAutoOptimization(data.secure_url as string);
}

export async function deleteProductImage(_url: string): Promise<void> {
  // Borrar un archivo en Cloudinary requiere firmar la petición con la API
  // secret, que nunca debe exponerse en el navegador (necesitaría una
  // función de servidor). Por ahora solo se quita de la lista de fotos del
  // producto; el archivo original queda en tu cuenta de Cloudinary y puedes
  // borrarlo manualmente desde su panel si lo deseas.
}
