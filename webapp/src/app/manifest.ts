import type { MetadataRoute } from 'next';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Hamsa Shoes';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${STORE_NAME} — Sandalias y calzado femenino`,
    short_name: STORE_NAME,
    description: 'Sandalias elegantes para la mujer colombiana. Pago contra entrega y 2×1 con envío gratis.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FBF3E5',
    theme_color: '#A9673A',
    icons: [
      { src: '/icon', sizes: '64x64', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
