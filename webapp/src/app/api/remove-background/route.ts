import { NextResponse } from 'next/server';

// Quitar el fondo de una foto con buena calidad requiere un modelo de IA
// pesado. Probamos primero a correrlo directo en el navegador (sin
// servidor ni cuenta de por medio), pero resultó poco confiable en la
// práctica: depende de que el navegador permita módulos externos, workers
// entre distintos orígenes y descargar ~50MB — Safari en modo privado (muy
// común al probar desde el celular) bloquea buena parte de eso.
//
// Por eso esta ruta corre en el servidor y llama a remove.bg (ver README
// para crear la cuenta gratuita y la llave). La llave nunca se expone al
// navegador — solo existe aquí, en el servidor.
export async function POST(request: Request) {
  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Quitar fondo no está configurado todavía (falta REMOVE_BG_API_KEY, ver README.md).' },
      { status: 500 },
    );
  }

  const incoming = await request.formData().catch(() => null);
  const file = incoming?.get('image_file');
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ error: 'Falta la imagen a procesar.' }, { status: 400 });
  }

  const forwardData = new FormData();
  forwardData.append('image_file', file, 'foto.jpg');
  forwardData.append('size', 'auto');

  let response: Response;
  try {
    response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: forwardData,
    });
  } catch {
    return NextResponse.json({ error: 'No se pudo conectar con el servicio de quitar fondo.' }, { status: 502 });
  }

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    const message = data?.errors?.[0]?.title || `El servicio de quitar fondo respondió con un error (${response.status}).`;
    return NextResponse.json({ error: message }, { status: response.status });
  }

  const resultBuffer = await response.arrayBuffer();
  return new NextResponse(resultBuffer, { headers: { 'Content-Type': 'image/png' } });
}
