import { cert, getApps, getApp, initializeApp, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

// El SDK de administrador de Firebase (a diferencia del SDK normal que usa
// el resto de la app) corre SOLO en el servidor, con una cuenta de servicio
// que se salta las reglas de seguridad de Firestore — por eso solo se usa
// dentro de las rutas /api/whatsapp/* (el webhook de Meta escribe mensajes
// sin que haya una sesión de administradora de por medio, y la ruta de
// envío verifica la identidad de la administradora a mano antes de usarlo).
// Requiere 3 variables de entorno con los datos de una cuenta de servicio
// (Firebase Console > Configuración del proyecto > Cuentas de servicio >
// Generar nueva clave privada) — ver README.md.

let debugReason = '';

function buildApp(): App | undefined {
  if (getApps().length) return getApp();

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  // La clave privada viene con saltos de línea reales en el JSON original,
  // pero las variables de entorno de Vercel los guardan como "\n" literales
  // — hay que convertirlos de vuelta antes de usarla.
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  const missing = [
    !projectId && 'FIREBASE_ADMIN_PROJECT_ID',
    !clientEmail && 'FIREBASE_ADMIN_CLIENT_EMAIL',
    !privateKey && 'FIREBASE_ADMIN_PRIVATE_KEY',
  ].filter(Boolean);
  if (missing.length > 0) {
    debugReason = `Faltan estas variables de entorno (o están vacías): ${missing.join(', ')}.`;
    return undefined;
  }

  try {
    return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    debugReason = `La cuenta de servicio no se pudo inicializar (revisa que FIREBASE_ADMIN_PRIVATE_KEY esté completa y bien copiada): ${message}`;
    console.error('[firebase-admin] No se pudo inicializar la cuenta de servicio.', error);
    return undefined;
  }
}

const app = buildApp();

export const adminDb = (app ? getFirestore(app) : undefined) as Firestore;
export const adminAuth = (app ? getAuth(app) : undefined) as Auth;

export const ADMIN_SDK_CONFIG_ERROR =
  'Falta configurar la cuenta de servicio de Firebase (FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY). Ver README.md.';

// Detalle de por qué falló, para mostrar solo en pantallas ya protegidas
// por otra clave (ej. /admin/agencia) — nunca en una ruta pública.
export const ADMIN_SDK_DEBUG_REASON = debugReason;
