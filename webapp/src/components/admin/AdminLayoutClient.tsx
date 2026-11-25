'use client';

import { usePathname } from 'next/navigation';
import AdminAuthGuard from './AdminAuthGuard';
import AdminSidebar from './AdminSidebar';
import OrderAlertListener from './OrderAlertListener';
import PaymentReminderModal from './PaymentReminderModal';
import type { BillingReminder } from '@/lib/billingReminder';

export default function AdminLayoutClient({
  children,
  billingReminder,
}: {
  children: React.ReactNode;
  billingReminder: BillingReminder;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';
  // /admin/agencia controla el aviso de pago desde afuera: si quedara
  // detrás del mismo aviso que bloquea, nadie podría entrar a desactivarlo.
  const isAgenciaPage = pathname === '/admin/agencia';

  if (isLoginPage || isAgenciaPage) return <>{children}</>;

  return (
    <AdminAuthGuard>
      <PaymentReminderModal reminder={billingReminder} />
      <div className="flex min-h-screen flex-col bg-cream sm:flex-row">
        <AdminSidebar />
        <div className="flex-1 p-4 sm:p-8">{children}</div>
        <OrderAlertListener />
      </div>
    </AdminAuthGuard>
  );
}
