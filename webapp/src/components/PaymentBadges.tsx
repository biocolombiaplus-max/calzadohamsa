import { classNames } from '@/lib/utils';

// Insignias de métodos de pago aceptados — refuerzan confianza justo antes
// de que la clienta decida pagar (checkout) o en cualquier parte del sitio
// donde se quiera mostrar que la compra es segura y variada en formas de pago.
export default function PaymentBadges({ className }: { className?: string }) {
  return (
    <div className={classNames('flex flex-wrap items-center gap-2', className)}>
      <span className="rounded bg-[#1A1F71] px-2.5 py-1 text-[11px] font-extrabold italic tracking-wide text-white">
        VISA
      </span>
      <span className="flex h-6 items-center gap-0 rounded bg-white px-1.5 shadow-sm ring-1 ring-border">
        <span className="h-4 w-4 rounded-full bg-[#EB001B]" />
        <span className="-ml-1.5 h-4 w-4 rounded-full bg-[#F79E1B] mix-blend-multiply" />
      </span>
      <span className="rounded bg-[#3D2A71] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white">PSE</span>
      <span className="rounded bg-[#FF3562] px-2.5 py-1 text-[11px] font-extrabold tracking-wide text-white">
        Nequi
      </span>
      <span className="rounded border border-border bg-white px-2.5 py-1 text-[11px] font-bold text-ink">
        💵 Contraentrega
      </span>
    </div>
  );
}
