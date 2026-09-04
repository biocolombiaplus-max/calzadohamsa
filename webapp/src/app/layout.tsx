import type { Metadata } from 'next';
import '../styles/globals.css';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Hamsa Shoes';

export const metadata: Metadata = {
  title: `${STORE_NAME} — Sandalias y calzado femenino`,
  description:
    'Sandalias elegantes y cómodas para la mujer colombiana. Envío gratis, pago contra entrega y cambio de talla sin costo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-body">{children}</body>
    </html>
  );
}
