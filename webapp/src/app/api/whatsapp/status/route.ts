import { NextResponse } from 'next/server';
import { isWhatsAppConfigured } from '@/lib/whatsapp';

// Solo dice si las variables de entorno de WhatsApp/Firebase Admin ya están
// puestas o no — nunca expone ningún valor real, para que el panel pueda
// mostrar el estado de conexión sin arriesgar ningún secreto.
export async function GET() {
  return NextResponse.json({
    whatsappConfigured: isWhatsAppConfigured(),
    adminSdkConfigured: !!process.env.FIREBASE_ADMIN_PROJECT_ID && !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
    verifyTokenConfigured: !!process.env.WHATSAPP_VERIFY_TOKEN,
    appSecretConfigured: !!process.env.WHATSAPP_APP_SECRET,
  });
}
