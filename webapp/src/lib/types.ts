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

export type PaymentMethod = 'contra_entrega' | 'transferencia' | 'wompi';

export type OrderStatus = 'pendiente' | 'confirmado' | 'enviado' | 'entregado' | 'cancelado';

export interface OrderCustomer {
  name: string;
  phone: string;
  address: string;
  city: string;
  department: string;
  note?: string;
  locationUrl?: string;
}

export const CARRIERS = [
  'Interrapidísimo',
  'Coordinadora',
  'Servientrega',
  'TCC',
  'Envía',
  'Otra',
] as const;

export type Carrier = (typeof CARRIERS)[number];

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
  carrier?: Carrier;
  trackingNumber?: string;
  paymentReference?: string;
  couponCode?: string;
  createdAt: number;
}

export type OrderInput = Omit<Order, 'id' | 'createdAt' | 'orderNumber'>;

export interface TrustItem {
  icon: string;
  title: string;
  sub: string;
}

export interface BenefitItem {
  icon: string;
  title: string;
  text: string;
}

export interface TestimonialItem {
  name: string;
  city: string;
  review: string;
}

export interface DepartmentRate {
  department: string;
  rate: number;
}

export interface ShippingException {
  department: string;
  municipio: string;
  rate: number;
}

export interface ShippingSettings {
  defaultRate: number;
  rates: DepartmentRate[];
  exceptions: ShippingException[];
}

export interface SiteColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  cream: string;
  creamAlt: string;
  ink: string;
  muted: string;
  border: string;
}

export interface CollectionMenuItem {
  label: string;
  value: string;
}

export interface SiteSettings {
  storeName: string;
  logoUrl: string;
  logoHeight: number;
  whatsappCountryCode: string;
  whatsappNumber: string;
  collectionsMenu: CollectionMenuItem[];
  colors: SiteColors;
  fonts: {
    headingFont: string;
    bodyFont: string;
  };
  announcementMessages: string[];
  hero: {
    eyebrow: string;
    heading: string;
    subtext: string;
    image: string;
    badge1: string;
    badge2: string;
    badge3: string;
    button1Text: string;
    button1Url: string;
    button2Text: string;
    button2Url: string;
    titleSize: 'sm' | 'md' | 'lg' | 'xl';
    subtextSize: 'sm' | 'md' | 'lg';
  };
  shipping: ShippingSettings;
  bundle2x1: {
    price: number;
  };
  trustItems: TrustItem[];
  benefitsHeading: string;
  benefits: BenefitItem[];
  testimonialsHeading: string;
  testimonialsSubtext: string;
  testimonials: TestimonialItem[];
  cta: {
    eyebrow: string;
    heading: string;
    text: string;
    buttonText: string;
    buttonUrl: string;
  };
  footer: {
    brandText: string;
    contactText: string;
    instagram: string;
    facebook: string;
    tiktok: string;
    copyrightText: string;
  };
}
