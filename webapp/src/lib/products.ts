import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fbLimit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Product, ProductInput } from './types';
import { stripUndefined } from './utils';

const COLLECTION = 'products';

function toProduct(id: string, data: any): Product {
  const toMillis = (value: unknown) => (value instanceof Timestamp ? value.toMillis() : undefined);
  return {
    id,
    slug: data.slug,
    title: data.title,
    description: data.description ?? '',
    price: data.price ?? 0,
    compareAtPrice: data.compareAtPrice ?? null,
    images: data.images ?? [],
    sizes: data.sizes ?? [],
    colors: data.colors ?? [],
    collection: data.collection ?? 'sandalias',
    stock: data.stock ?? 0,
    featured: !!data.featured,
    active: data.active !== false,
    soldCount: data.soldCount ?? 0,
    reviewsCount: data.reviewsCount ?? 0,
    createdAt: toMillis(data.createdAt),
    updatedAt: toMillis(data.updatedAt),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => toProduct(d.id, d.data()));
}

export async function getActiveProducts(): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.active);
}

export async function getFeaturedProducts(max = 8): Promise<Product[]> {
  const products = await getActiveProducts();
  return products.filter((p) => p.featured).slice(0, max);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const snap = await getDocs(query(collection(db, COLLECTION), where('slug', '==', slug), fbLimit(1)));
  if (snap.empty) return null;
  const docSnap = snap.docs[0];
  return toProduct(docSnap.id, docSnap.data());
}

export async function getProductById(id: string): Promise<Product | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toProduct(snap.id, snap.data());
}

export async function getRelatedProducts(currentId: string, collectionName: string, max = 4): Promise<Product[]> {
  const products = await getActiveProducts();
  return products.filter((p) => p.id !== currentId && p.collection === collectionName).slice(0, max);
}

// Dos productos con la misma URL (slug) rompen la tienda: al abrir esa URL,
// Firestore devuelve cualquiera de los dos (el que encuentre primero) sin
// avisar — así fue como "Sandalia Prada" terminó abriendo otra referencia.
// Se valida ANTES de guardar para que ese choque ya no pueda volver a pasar.
async function isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
  const snap = await getDocs(query(collection(db, COLLECTION), where('slug', '==', slug)));
  return snap.docs.some((d) => d.id !== excludeId);
}

export async function createProduct(input: ProductInput): Promise<string> {
  if (await isSlugTaken(input.slug)) {
    throw new Error(`Ya existe otro producto con la URL "${input.slug}". Cambia el slug e intenta de nuevo.`);
  }
  const ref = await addDoc(collection(db, COLLECTION), {
    ...stripUndefined(input),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<void> {
  if (input.slug && (await isSlugTaken(input.slug, id))) {
    throw new Error(`Ya existe otro producto con la URL "${input.slug}". Cambia el slug e intenta de nuevo.`);
  }
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, { ...stripUndefined(input), updatedAt: serverTimestamp() });
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
