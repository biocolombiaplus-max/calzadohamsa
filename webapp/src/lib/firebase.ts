import { initializeApp, getApps, getApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Todas las páginas que usan Firebase son componentes de cliente que piden
// sus datos dentro de useEffect (nunca durante el render inicial). Next.js,
// sin embargo, sí ejecuta ese render inicial una vez en el servidor antes de
// hidratar en el navegador. Para que ese primer render en el servidor nunca
// falle por falta/errores de configuración de Firebase, estas instancias
// solo se crean en el navegador (typeof window !== 'undefined'); en el
// servidor quedan como `undefined`, lo cual es seguro porque nunca se usan ahí.
const isBrowser = typeof window !== 'undefined';

export const firebaseApp: FirebaseApp = isBrowser
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : (undefined as unknown as FirebaseApp);

export const db: Firestore = isBrowser ? getFirestore(firebaseApp) : (undefined as unknown as Firestore);
export const storage: FirebaseStorage = isBrowser
  ? getStorage(firebaseApp)
  : (undefined as unknown as FirebaseStorage);
export const auth: Auth = isBrowser ? getAuth(firebaseApp) : (undefined as unknown as Auth);
