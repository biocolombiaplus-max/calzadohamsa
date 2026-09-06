import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { SiteSettings } from './types';

const DOC_PATH = { collection: 'settings', id: 'site' } as const;

export const DEFAULT_SETTINGS: SiteSettings = {
  storeName: process.env.NEXT_PUBLIC_STORE_NAME || 'Hamsa Shoes',
  logoUrl: '',
  whatsappCountryCode: process.env.NEXT_PUBLIC_WHATSAPP_COUNTRY_CODE || '57',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  colors: {
    primary: '#A9673A',
    primaryHover: '#8C5429',
    primaryLight: '#C9A06C',
    cream: '#FBF3E5',
    creamAlt: '#F5E6CE',
    ink: '#1C1208',
    muted: '#8A7660',
    border: '#E6D5BC',
  },
  announcementMessages: [
    '🔥 2×1 en sandalias — $159.900 + ENVÍO GRATIS',
    '💵 PAGO CONTRA ENTREGA — paga al recibir',
    '✨ +2.400 mujeres ya las tienen',
    '↩️ CAMBIO DE TALLA sin costo',
    '🔒 COMPRA 100% GARANTIZADA',
    '⚡ DESPACHO en 24-48 horas',
  ],
  hero: {
    eyebrow: '✨ Colección 2025 — Nuevos ingresos',
    heading: 'Sandalias que te hacen brillar',
    subtext:
      'Diseños exclusivos para la mujer colombiana. Pago al recibir · Envío a todo el país · Cambio de talla gratis.',
    image: '/hero-placeholder.svg',
    badge1: '🔥 2×1 con envío gratis',
    badge2: '💵 Contra entrega',
    badge3: '⭐ +2.400 felices',
    button1Text: '🛍️ Ver colección',
    button1Url: '/catalogo',
    button2Text: '🔥 Oferta 2×1',
    button2Url: '/oferta-2x1',
  },
  shipping: {
    defaultRate: 15000,
    rates: [],
    exceptions: [],
  },
  bundle2x1: {
    price: 159900,
  },
  trustItems: [
    { icon: '🔥', title: '2×1 + envío GRATIS', sub: 'Solo en la oferta especial' },
    { icon: '💵', title: 'Contra entrega', sub: 'Paga al recibir' },
    { icon: '↩️', title: 'Cambio gratis', sub: 'Sin complicaciones' },
    { icon: '🔒', title: 'Compra segura', sub: '100% protegida' },
    { icon: '⭐', title: '+2.400 clientas', sub: 'Nos recomiendan' },
  ],
  benefitsHeading: '¿Por qué +2.400 mujeres eligen Hamsa?',
  benefits: [
    { icon: '⭐', title: 'Calidad garantizada', text: 'Materiales premium, cambio fácil si algo no queda perfecto.' },
    { icon: '🛡️', title: 'Pago 100% seguro', text: 'Contra entrega o en línea con Wompi.' },
    { icon: '💵', title: 'Contra entrega', text: 'Paga cuando el paquete llega a tu puerta. Sin riesgo.' },
    { icon: '🔥', title: '2×1 con envío gratis', text: 'Lleva 2 pares por $159.900 y el envío corre por nuestra cuenta.' },
  ],
  testimonialsHeading: 'Ellas ya lo tienen — y no paran de recomendarnos',
  testimonialsSubtext: 'Reseñas reales de clientas en toda Colombia',
  testimonials: [
    {
      name: 'Valentina M.',
      city: 'Medellín',
      review:
        'Me llegaron rapidísimo y son exactamente como las fotos. Las usé en una boda y recibí mil piropos. ¡Ya pedí otro par!',
    },
    {
      name: 'Daniela R.',
      city: 'Bogotá',
      review:
        'Súper cómodas y de muy buena calidad. El pago contra entrega me dio mucha confianza para comprar. 100% recomendadas.',
    },
    {
      name: 'Alejandra C.',
      city: 'Cali',
      review: 'Dudé al principio pero me arriesgué y quedé encantada. La talla me quedó perfecta y llegaron en 3 días.',
    },
    {
      name: 'Isabella T.',
      city: 'Barranquilla',
      review: 'Hermosas y muy cómodas para caminar todo el día. El servicio de WhatsApp es muy rápido.',
    },
  ],
  cta: {
    eyebrow: '¿Lista para lucir increíble?',
    heading: 'Tu sandalia perfecta te está esperando',
    text: 'Más de 2.400 mujeres colombianas ya las tienen. Paga al recibir, cambio de talla sin costo, y llévate 2 pares con envío gratis.',
    buttonText: '🔥 Ver oferta 2×1',
    buttonUrl: '/oferta-2x1',
  },
  footer: {
    brandText:
      'Sandalias y zapatos femeninos elegantes, con envíos a toda Colombia. Comodidad y estilo en cada paso.',
    contactText: '¿Dudas con tu talla o tu pedido? Escríbenos, respondemos rápido.',
    instagram: '',
    facebook: '',
    tiktok: '',
    copyrightText: '',
  },
};

function mergeWithDefaults(data: Partial<SiteSettings> | undefined): SiteSettings {
  if (!data) return DEFAULT_SETTINGS;
  return {
    ...DEFAULT_SETTINGS,
    ...data,
    colors: { ...DEFAULT_SETTINGS.colors, ...data.colors },
    hero: { ...DEFAULT_SETTINGS.hero, ...data.hero },
    cta: { ...DEFAULT_SETTINGS.cta, ...data.cta },
    footer: { ...DEFAULT_SETTINGS.footer, ...data.footer },
    shipping: {
      ...DEFAULT_SETTINGS.shipping,
      ...data.shipping,
      rates: data.shipping?.rates ?? DEFAULT_SETTINGS.shipping.rates,
      exceptions: data.shipping?.exceptions ?? DEFAULT_SETTINGS.shipping.exceptions,
    },
    bundle2x1: { ...DEFAULT_SETTINGS.bundle2x1, ...data.bundle2x1 },
    announcementMessages: data.announcementMessages?.length ? data.announcementMessages : DEFAULT_SETTINGS.announcementMessages,
    trustItems: data.trustItems?.length ? data.trustItems : DEFAULT_SETTINGS.trustItems,
    benefits: data.benefits?.length ? data.benefits : DEFAULT_SETTINGS.benefits,
    testimonials: data.testimonials?.length ? data.testimonials : DEFAULT_SETTINGS.testimonials,
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const ref = doc(db, DOC_PATH.collection, DOC_PATH.id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return DEFAULT_SETTINGS;
    return mergeWithDefaults(snap.data() as Partial<SiteSettings>);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateSiteSettings(settings: SiteSettings): Promise<void> {
  const ref = doc(db, DOC_PATH.collection, DOC_PATH.id);
  await setDoc(ref, settings, { merge: true });
}
