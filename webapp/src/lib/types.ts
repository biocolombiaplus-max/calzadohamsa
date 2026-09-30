export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export interface ProductReview {
  name: string;
  city?: string;
  rating: number;
  text: string;
  date?: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  images: string[];
  // URLs (subconjunto de "images") que deben mostrarse COMPLETAS, sin
  // recortar a cuadrado, cuando esa foto no encuadra bien recortada — se
  // marca foto por foto desde el admin, sin afectar el resto del diseño.
  noCropImages?: string[];
  // Porcentaje de tamaño (40-100) para encoger aún más una foto marcada como
  // "Completa", foto por foto, hasta que se vea perfecta — 100 = tamaño
  // normal. Mapa de URL de la foto -> porcentaje.
  imageScale?: Record<string, number>;
  sizes: string[];
  colors: ProductColor[];
  collection: string;
  stock: number;
  featured: boolean;
  active: boolean;
  soldCount?: number;
  reviewsCount?: number;
  reviews?: ProductReview[];
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
  // Foto o PDF de la guía de envío, subida desde /admin/pedidos — se
  // adjunta como link dentro del mensaje de WhatsApp al avisarle a la
  // clienta que su pedido ya salió.
  shippingLabelUrl?: string;
  paymentReference?: string;
  couponCode?: string;
  createdAt: number;
}

export type OrderInput = Omit<Order, 'id' | 'createdAt' | 'orderNumber'>;

// ---- CRM / WhatsApp ----
// Embudo de ventas estilo Kommo: cada clienta que escribe por WhatsApp
// entra como "nuevo" y la administradora la va moviendo a mano por las
// etapas según avanza la conversación real.
export const CRM_STAGES = ['nuevo', 'interesado', 'negociando', 'cliente', 'perdido'] as const;
export type CrmStage = (typeof CRM_STAGES)[number];

export const CRM_STAGE_LABELS: Record<CrmStage, string> = {
  nuevo: '🆕 Nuevo',
  interesado: '👀 Interesado',
  negociando: '💬 Negociando',
  cliente: '✅ Cliente',
  perdido: '❌ Perdido',
};

export interface CrmContact {
  id: string;
  // Teléfono en formato E.164 sin "+" (como lo entrega la API de Meta), ej. "573001234567".
  phone: string;
  name: string;
  stage: CrmStage;
  notes?: string;
  tags?: string[];
  lastMessageAt: number;
  lastMessagePreview: string;
  lastInboundAt?: number;
  unreadCount: number;
  nextFollowUpAt?: number | null;
  createdAt: number;
}

export type CrmMessageDirection = 'in' | 'out';
export type CrmMessageStatus = 'sent' | 'delivered' | 'read' | 'failed';

export interface CrmMessage {
  id: string;
  contactId: string;
  direction: CrmMessageDirection;
  text: string;
  status?: CrmMessageStatus;
  waMessageId?: string;
  templateName?: string;
  createdAt: number;
}

export interface CrmQuickReply {
  id: string;
  label: string;
  text: string;
}

// Plantillas APROBADAS por Meta para escribirle primero a una clienta
// después de que la ventana de 24 horas de mensajes libres se cierra — el
// nombre y la cantidad de variables deben coincidir EXACTO con lo aprobado
// en Meta Business Manager, si no el envío falla.
export interface CrmTemplate {
  id: string;
  name: string;
  label: string;
  language: string;
  variableCount: number;
}

export interface CrmConfig {
  quickReplies: CrmQuickReply[];
  templates: CrmTemplate[];
}

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

export interface BundleShippingException {
  department: string;
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
  notificationEmail: string;
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
    images: string[];
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
    shippingExceptions: BundleShippingException[];
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
