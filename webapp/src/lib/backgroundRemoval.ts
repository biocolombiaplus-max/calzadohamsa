// La librería de quitar fondo (@imgly/background-removal) solo es
// compatible con Next.js 15 al empaquetarla localmente: su dependencia
// onnxruntime-web incluye un archivo minificado que el compilador de
// Next.js 14 (el que usa este proyecto) no logra analizar y rompe el
// build de producción por completo.
//
// Para no arriesgar el sitio, esta función NO instala la librería como
// dependencia del proyecto: la carga en tiempo real directamente en el
// navegador de quien administra la tienda, vía esm.sh (un CDN que resuelve
// también las dependencias internas del paquete). El comentario
// "webpackIgnore" le dice a Next.js que no intente empaquetar ni analizar
// esta importación — queda a cargo del propio navegador, igual que un
// <script> externo. Todo el procesamiento de la imagen ocurre en el
// navegador; no se sube la foto a ningún servicio.
export async function removeImageBackground(
  input: Blob | string,
  onProgress?: (pct: number) => void,
): Promise<Blob> {
  const cdnUrl = 'https://esm.sh/@imgly/background-removal@1.7.0';
  const mod: any = await import(/* webpackIgnore: true */ cdnUrl);
  const removeBackground = mod.default;

  return removeBackground(input, {
    output: { format: 'image/png', quality: 0.9 },
    progress: onProgress
      ? (_key: string, current: number, total: number) => {
          onProgress(total > 0 ? Math.round((current / total) * 100) : 0);
        }
      : undefined,
  });
}
