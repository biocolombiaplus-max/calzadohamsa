import AdminLayoutClient from '@/components/admin/AdminLayoutClient';
import { getBillingReminder } from '@/lib/billingReminder';

// El panel administrativo depende siempre de datos en vivo de Firestore/Auth,
// así que no tiene sentido pre-renderizarlo de forma estática en el build.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const billingReminder = await getBillingReminder();
  return <AdminLayoutClient billingReminder={billingReminder}>{children}</AdminLayoutClient>;
}
