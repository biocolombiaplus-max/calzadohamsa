'use client';

import { useEffect, useState } from 'react';

interface Status {
  publicKeyConfigured: boolean;
  integritySecretConfigured: boolean;
  privateKeyConfigured: boolean;
}

function StatusRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span className={ok ? 'text-green-600' : 'text-urgent'}>{ok ? '✓' : '✕'}</span>
      <span className={ok ? 'text-ink' : 'text-muted'}>{label}</span>
    </li>
  );
}

// Las 3 claves de Wompi están repartidas en 2 lugares distintos del panel
// de Wompi (Llaves y Eventos), así que es fácil copiar solo una y pensar
// que ya quedó todo listo — este estado deja verlo de un vistazo, en vez
// de que una clienta se dé cuenta cuando el pago le falle al final.
export default function WompiStatusCard() {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    fetch('/api/wompi-status')
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => setStatus(null));
  }, []);

  // Nada que avisar: o "Pagar en línea" nunca se activó (sin llave pública,
  // la tienda funciona normal solo con contra entrega), o ya está completo.
  if (!status || !status.publicKeyConfigured) return null;
  if (status.integritySecretConfigured && status.privateKeyConfigured) return null;

  return (
    <div className="rounded-card border border-border bg-white p-4 shadow-soft">
      <h3 className="mb-2 font-heading text-sm font-bold text-ink">Estado de Wompi (pago en línea)</h3>
      <ul className="space-y-1.5">
        <StatusRow ok={status.publicKeyConfigured} label="Llave pública (NEXT_PUBLIC_WOMPI_PUBLIC_KEY)" />
        <StatusRow ok={status.integritySecretConfigured} label="Llave de integridad (WOMPI_INTEGRITY_SECRET)" />
        <StatusRow ok={status.privateKeyConfigured} label="Llave privada, para confirmar pagos (WOMPI_PRIVATE_KEY)" />
      </ul>
      {!status.integritySecretConfigured && (
        <p className="mt-3 rounded-lg bg-urgent/10 p-2.5 text-xs font-semibold text-urgent">
          ⚠️ Falta la llave de integridad — el botón &ldquo;Pagar en línea&rdquo; ya se ve en tu tienda, pero el
          pago le va a fallar a la clienta justo al final. Agrégala en Vercel y vuelve a desplegar (ver README.md →
          &ldquo;Activar el pago en línea con Wompi&rdquo;).
        </p>
      )}
      {status.integritySecretConfigured && !status.privateKeyConfigured && (
        <p className="mt-3 rounded-lg bg-amber-50 p-2.5 text-xs font-semibold text-amber-800">
          Los pagos sí van a funcionar, pero sin la llave privada la página de confirmación no puede verificar el
          pago contra Wompi — agrégala cuando puedas (ver README.md).
        </p>
      )}
    </div>
  );
}
