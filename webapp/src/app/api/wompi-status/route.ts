import { NextResponse } from 'next/server';

// Solo dice si las 3 variables de Wompi ya están puestas o no — nunca
// expone ningún valor real. Sin las 3, "Pagar en línea" se ve en la
// tienda pero falla al final (la clienta llena todo el formulario y ahí
// se entera) — esto deja verlo antes de que le pase a una clienta.
export async function GET() {
  return NextResponse.json({
    publicKeyConfigured: !!process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
    integritySecretConfigured: !!process.env.WOMPI_INTEGRITY_SECRET,
    privateKeyConfigured: !!process.env.WOMPI_PRIVATE_KEY,
  });
}
