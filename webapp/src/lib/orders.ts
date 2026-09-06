import { collection, doc, getDoc, getDocs, addDoc, updateDoc, orderBy, query, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from './firebase';
import type { Carrier, Order, OrderInput, OrderStatus } from './types';
import { generateOrderNumber } from './utils';

const COLLECTION = 'orders';

function toOrder(id: string, data: any): Order {
  return {
    id,
    orderNumber: data.orderNumber,
    items: data.items ?? [],
    subtotal: data.subtotal ?? 0,
    shipping: data.shipping ?? 0,
    total: data.total ?? 0,
    customer: data.customer,
    paymentMethod: data.paymentMethod,
    status: data.status ?? 'pendiente',
    carrier: data.carrier || undefined,
    trackingNumber: data.trackingNumber || undefined,
    paymentReference: data.paymentReference || undefined,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
  };
}

export async function createOrder(input: OrderInput): Promise<{ id: string; orderNumber: string }> {
  const orderNumber = generateOrderNumber();
  const ref = await addDoc(collection(db, COLLECTION), {
    ...input,
    orderNumber,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, orderNumber };
}

export async function getOrderById(id: string): Promise<Order | null> {
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return toOrder(snap.id, snap.data());
}

export async function getAllOrders(): Promise<Order[]> {
  const snap = await getDocs(query(collection(db, COLLECTION), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => toOrder(d.id, d.data()));
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { status });
}

export async function updateOrderShipping(
  id: string,
  shipping: { carrier?: Carrier; trackingNumber?: string },
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    carrier: shipping.carrier ?? '',
    trackingNumber: shipping.trackingNumber ?? '',
  });
}
