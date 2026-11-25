import type { BillingReminder } from '@/lib/billingReminder';

const SUPPORT_NUMBER = '573505457420';
const SUPPORT_MESSAGE =
  'Hola, soy Diany de Hamsa Shoes 👋. Vi el aviso de pago pendiente de mi plan de mantenimiento web — quiero confirmar el pago para que todo quede al día. ¿Me ayudan con el proceso?';

function daysOverdue(dueDateIso: string) {
  const due = new Date(dueDateIso + 'T00:00:00');
  const now = new Date();
  const diff = Math.floor((now.getTime() - due.getTime()) / 86400000);
  return Math.max(0, diff);
}

function formatDueDate(dueDateIso: string) {
  const due = new Date(dueDateIso + 'T00:00:00');
  return due.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Aviso honesto de pago pendiente del plan de mantenimiento con BioMarketing
// — identificado siempre como tal, nunca como una suspensión de un tercero
// (Firebase, Vercel, etc.). Sin forma de cerrarlo: mientras esté activo,
// cubre todo el panel y bloquea el trabajo hasta pagar o hasta que la
// agencia lo desactive desde /admin/agencia.
export default function PaymentReminderModal({ reminder }: { reminder: BillingReminder }) {
  if (!reminder.active) return null;

  const waLink = `https://wa.me/${SUPPORT_NUMBER}?text=${encodeURIComponent(SUPPORT_MESSAGE)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-5 backdrop-blur-sm">
      <div className="relative w-full max-w-[420px] rounded-card border border-urgent/30 bg-white p-7 shadow-lift">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-urgent/30 bg-urgent/10 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-widest text-urgent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-urgent" />
          Pago pendiente
        </span>

        <h2 className="mb-2.5 font-heading text-xl font-bold leading-tight text-ink">
          Tu plan de mantenimiento está vencido
        </h2>
        <p className="mb-5 text-sm leading-relaxed text-muted">
          El soporte y las actualizaciones de tu tienda dependen de tener el
          plan al día con BioMarketing. Regulariza el pago para seguir
          contando con mantenimiento continuo.
        </p>

        <div className="mb-3 flex items-center justify-between rounded-lg border border-border bg-cream-alt px-4.5 py-4">
          <span className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Valor a pagar
          </span>
          <span className="font-heading text-2xl font-bold text-ink">
            US$ {reminder.amountUsd}
          </span>
        </div>

        <div className="mb-5 flex items-center justify-between rounded-lg border border-urgent/25 bg-urgent/[0.06] px-4.5 py-3.5">
          <span className="text-[11px] font-bold uppercase tracking-wide text-urgent">
            Días en mora
          </span>
          <span className="font-heading text-lg font-bold text-urgent">
            {daysOverdue(reminder.dueDate)} días
          </span>
        </div>

        <p className="mb-5 text-xs text-muted">
          Vencimiento: <b className="text-ink">{formatDueDate(reminder.dueDate)}</b>
        </p>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-2.5 flex w-full items-center justify-center gap-2 rounded-lg bg-whatsapp py-3.5 text-sm font-extrabold text-white transition-transform hover:scale-[1.02]"
        >
          Ya pagué / Hablar con soporte
        </a>
        <p className="text-center text-[11px] text-muted">
          El panel queda bloqueado hasta regularizar el pago.
        </p>
      </div>
    </div>
  );
}
