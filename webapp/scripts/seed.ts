/**
 * Script de datos de ejemplo.
 *
 * Requiere que ya exista un usuario administrador (ver README, sección
 * "Crear tu primer usuario administrador") y sus credenciales en .env.local:
 *   SEED_ADMIN_EMAIL=tu-correo@ejemplo.com
 *   SEED_ADMIN_PASSWORD=tu-contraseña
 *
 * Ejecuta:  npm run seed
 */
import { config } from 'dotenv';
config({ path: '.env.local' });

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const SAMPLE_PRODUCTS = [
  {
    slug: 'sandalia-camel-trenzada',
    title: 'Sandalia Camel Trenzada',
    description: 'Sandalia trenzada en tono camel, suela cómoda y flexible. Ideal para el día a día.',
    price: 99900,
    compareAtPrice: 139900,
    images: [],
    sizes: ['35', '36', '37', '38', '39', '40'],
    colors: [
      { name: 'Camel', hex: '#C9A06C' },
      { name: 'Terracota', hex: '#A9673A' },
    ],
    collection: 'sandalias',
    stock: 24,
    featured: true,
    active: true,
    soldCount: 342,
    reviewsCount: 87,
  },
  {
    slug: 'sandalia-terracota-tiras',
    title: 'Sandalia Terracota de Tiras',
    description: 'Diseño elegante de tiras cruzadas, perfecta para looks de oficina o casuales.',
    price: 109900,
    compareAtPrice: 149900,
    images: [],
    sizes: ['35', '36', '37', '38', '39'],
    colors: [
      { name: 'Terracota', hex: '#A9673A' },
      { name: 'Negro', hex: '#1C1208' },
    ],
    collection: 'sandalias',
    stock: 18,
    featured: true,
    active: true,
    soldCount: 214,
    reviewsCount: 54,
  },
  {
    slug: 'sandalia-beige-plataforma',
    title: 'Sandalia Beige Plataforma',
    description: 'Plataforma cómoda de 4cm, ideal para lucir más altura sin sacrificar comodidad.',
    price: 119900,
    compareAtPrice: null,
    images: [],
    sizes: ['36', '37', '38', '39', '40'],
    colors: [{ name: 'Beige', hex: '#F5E6CE' }],
    collection: 'sandalias',
    stock: 12,
    featured: true,
    active: true,
    soldCount: 98,
    reviewsCount: 31,
  },
];

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('Faltan SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD en .env.local');
    process.exit(1);
  }

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  await signInWithEmailAndPassword(auth, email, password);
  console.log(`Autenticado como ${email}. Creando productos de ejemplo...`);

  for (const product of SAMPLE_PRODUCTS) {
    await addDoc(collection(db, 'products'), {
      ...product,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`✓ Creado: ${product.title}`);
  }

  console.log('¡Listo! Ingresa a /admin/productos para subirles fotos reales.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
