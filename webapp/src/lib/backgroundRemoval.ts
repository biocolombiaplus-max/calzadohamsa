// Quita el fondo de una foto llamando a /api/remove-background (que a su
// vez llama a remove.bg desde el servidor, con la llave secreta a salvo).
// Devuelve un PNG con fondo transparente.
export async function removeImageBackground(imageSrc: string): Promise<Blob> {
  const sourceBlob = await (await fetch(imageSrc)).blob();

  const formData = new FormData();
  formData.append('image_file', sourceBlob, 'foto.jpg');

  const response = await fetch('/api/remove-background', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error || 'No se pudo quitar el fondo. Intenta de nuevo.');
  }

  return response.blob();
}
