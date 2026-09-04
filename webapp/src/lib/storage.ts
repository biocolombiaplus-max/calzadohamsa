// Hospedaje de imágenes con Cloudinary (plan gratis, sin tarjeta de crédito),
// en lugar de Firebase Storage — que ahora exige el plan de pago Blaze
// incluso para uso gratuito. Mantiene la misma firma de funciones que antes
// para no tener que tocar el formulario de productos.

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadProductImage(file: File, productSlug: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      'Cloudinary no está configurado. Agrega NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (ver README.md).',
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', `products/${productSlug}`);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('No se pudo subir la imagen a Cloudinary.');
  }

  const data = (await response.json()) as { secure_url: string };
  return data.secure_url;
}

export async function deleteProductImage(_url: string): Promise<void> {
  // Borrar un archivo en Cloudinary requiere firmar la petición con la API
  // secret, que nunca debe exponerse en el navegador (necesitaría una
  // función de servidor). Por ahora solo se quita de la lista de fotos del
  // producto; el archivo original queda en tu cuenta de Cloudinary y puedes
  // borrarlo manualmente desde su panel si lo deseas.
}
