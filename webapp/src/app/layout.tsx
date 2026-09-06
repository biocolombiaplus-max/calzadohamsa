import type { Metadata } from 'next';
import '../styles/globals.css';

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || 'Hamsa Shoes';

export const metadata: Metadata = {
  title: `${STORE_NAME} — Sandalias y calzado femenino`,
  description:
    'Sandalias elegantes y cómodas para la mujer colombiana. Pago contra entrega, cambio de talla sin costo y 2×1 con envío gratis.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-body">{children}</body>
    </html>
  );
}
