export interface ProductColor {
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  collection: string;
  stock: number;
  featured: boolean;
  active: boolean;
  soldCount?: number;
  reviewsCount?: number;
  createdAt?: number;
  updatedAt?: number;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

export interface CartItem {
  productId: string;
  slug: string;
  title: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
}

export type PaymentMethod = 'contra_entrega' | 'transferencia';

export type OrderStatus = 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: OrderCustomer;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  createdAt: number;
}

export type OrderInput = Omit<Order, 'id' | 'createdAt' | 'orderNumber'>;
