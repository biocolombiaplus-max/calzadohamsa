import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { CartItem, RecentSale } from './types';

const COLLECTION = 'recentSales';

// Se llama justo después de crear un pedido — guarda solo el primer nombre
// de la clienta, su ciudad y qué compró, para el aviso "compró hace X min"
// en la ficha de producto. Nunca debe afectar la compra real si falla.
export function recordRecentSale(customer: { name: string; city: string }, items: CartItem[]): void {
  if (!db || items.length === 0) return;
  const firstName = customer.name.trim().split(' ')[0]?.slice(0, 40) || 'Alguien';
  addDoc(collection(db, COLLECTION), {
    firstName,
    city: (customer.city || '').slice(0, 60),
    productTitle: items[0].title.slice(0, 120),
    createdAt: serverTimestamp(),
  }).catch(() => {});
}

// Últimas ventas reales de toda la tienda, en vivo — alimenta el aviso de
// prueba social en cada ficha de producto.
export function subscribeToRecentSales(onChange: (sales: RecentSale[]) => void): () => void {
  if (!db) return () => {};
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(15));
  return onSnapshot(
    q,
    (snap) =>
      onChange(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            firstName: data.firstName ?? '',
            city: data.city ?? '',
            productTitle: data.productTitle ?? '',
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
          };
        }),
      ),
    () => {},
  );
}
