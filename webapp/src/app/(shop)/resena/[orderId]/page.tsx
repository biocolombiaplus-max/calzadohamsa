'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getReviewRequest, submitReview } from '@/lib/reviews';
import { uploadProductImage } from '@/lib/storage';
import { resizeForUpload } from '@/lib/imageCrop';
import { classNames } from '@/lib/utils';
import type { ReviewRequest } from '@/lib/types';

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex justify-center gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} estrellas`}
          className={classNames('text-4xl transition-transform active:scale-90', n <= value ? 'text-amber-400' : 'text-border')}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function daysLeft(expiresAt: number): number {
  return Math.max(1, Math.ceil((expiresAt - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default function ReviewPage() {
  const params = useParams<{ orderId: string }>();
  const [req, setReq] = useState<ReviewRequest | null | undefined>(undefined);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [bonus, setBonus] = useState<{ code: string; percent: number; expiresAt: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getReviewRequest(params.orderId)
      .then((r) => !cancelled && setReq(r))
      .catch(() => !cancelled && setReq(null));
    return () => {
      cancelled = true;
    };
  }, [params.orderId]);

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError('');
    const queued = Array.from(files).slice(0, 4 - photos.length);
    e.target.value = '';

    setUploading(true);
    try {
      for (const original of queued) {
        try {
          const resized = await resizeForUpload(original);
          const uploadFile = new File([resized], original.name || 'resena.jpg', { type: 'image/jpeg' });
          const url = await uploadProductImage(uploadFile, 'resena');
          setPhotos((prev) => [...prev, url]);
        } catch (err) {
          setUploadError(err instanceof Error ? err.message : 'No se pudo subir la foto. Intenta de nuevo.');
        }
      }
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit() {
    if (!text.trim()) {
      setSubmitError('Cuéntanos brevemente qué te pareció.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      const result = await submitReview(params.orderId, { rating, text: text.trim(), photos });
      setBonus({ code: result.couponCode, percent: result.couponPercent, expiresAt: result.couponExpiresAt });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'No pudimos guardar tu reseña. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  }

  function copyCode(code: string) {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (req === undefined) {
    return <div className="container-page py-24 text-center text-muted">Cargando...</div>;
  }

  if (req === null) {
    return (
      <div className="container-page py-24 text-center">
        <p className="font-heading text-2xl font-bold text-ink">No encontramos este link</p>
        <p className="mt-2 text-sm text-muted">Puede que ya haya vencido. Escríbenos si necesitas ayuda.</p>
        <Link href="/" className="btn-primary mt-6 inline-flex">
          Volver al inicio
        </Link>
      </div>
    );
  }

  // Ya dejó su reseña antes (o la acaba de dejar ahora) — siempre que
  // vuelva a abrir este mismo link, ve su bono de nuevo, para que le sirva
  // también como "mi cupón" guardado.
  const alreadySubmitted = !!req.reviewSubmittedAt;
  const activeBonus =
    bonus ?? (alreadySubmitted && req.couponExpiresAt ? { code: req.couponCode, percent: req.couponPercent, expiresAt: req.couponExpiresAt } : null);

  if (activeBonus) {
    const expired = activeBonus.expiresAt < Date.now();
    return (
      <div className="container-page py-14">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl text-white">
            🎉
          </div>
          <h1 className="font-heading text-2xl font-bold text-ink">¡Gracias por tu reseña!</h1>
          <p className="mt-2 text-sm text-muted">Como agradecimiento, tienes este bono solo para ti:</p>

          <div className="mt-6 overflow-hidden rounded-card border-2 border-primary bg-gradient-to-br from-primary-light/20 to-primary/10 p-6 shadow-soft">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Bono de agradecimiento</p>
            <p className="mt-1 font-heading text-5xl font-extrabold text-primary">{activeBonus.percent}% OFF</p>
            <button
              type="button"
              onClick={() => copyCode(activeBonus.code)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-primary bg-white px-4 py-2.5 font-mono text-lg font-bold tracking-wide text-ink"
            >
              {activeBonus.code}
              <span className="text-xs font-sans font-semibold text-primary">{copied ? '✓ copiado' : '📋 copiar'}</span>
            </button>
            <p className={classNames('mt-3 text-xs font-semibold', expired ? 'text-urgent' : 'text-ink')}>
              {expired ? 'Este bono ya venció.' : `Válido por ${daysLeft(activeBonus.expiresAt)} días más — úsalo antes de que se acabe.`}
            </p>
          </div>

          {!expired && (
            <Link href={`/catalogo?cupon=${activeBonus.code}`} className="btn-primary mt-6 w-full">
              Comprar con mi bono →
            </Link>
          )}
          <Link href="/" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-md">
        <div className="text-center">
          <h1 className="font-heading text-2xl font-bold text-ink">¿Qué te pareció tu compra?</h1>
          <p className="mt-2 text-sm text-muted">
            Hola {req.customerName.split(' ')[0]}, cuéntanos cómo te fue — al dejar tu reseña te regalamos un bono del 10% para tu próxima compra.
          </p>
        </div>

        <div className="mt-6 rounded-card bg-white p-5 shadow-soft">
          <p className="mb-1 text-xs font-bold uppercase text-muted">Tu pedido</p>
          <ul className="mb-4 space-y-1 text-sm text-ink">
            {req.items.map((item, i) => (
              <li key={i}>
                {item.title} <span className="text-muted">(talla {item.size}, {item.color})</span>
              </li>
            ))}
          </ul>

          <div className="border-t border-border pt-4">
            <p className="mb-2 text-center text-sm font-semibold text-ink">¿Cuántas estrellas le das?</p>
            <StarPicker value={rating} onChange={setRating} />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-ink">Tu comentario</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              placeholder="Ej: Me encantó la calidad, llegó rápido y la talla quedó perfecta..."
              className="w-full rounded-lg border border-border px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-semibold text-ink">Agrega una foto (opcional)</label>
            <div className="flex flex-wrap gap-2">
              {photos.map((url) => (
                <div key={url} className="relative h-16 w-16 overflow-hidden rounded-lg border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="Foto de la reseña" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((p) => p !== url))}
                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-bl bg-ink/70 text-xs text-white"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {photos.length < 4 && (
                <label className="flex h-16 w-16 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border text-xs text-muted hover:border-primary">
                  {uploading ? '...' : '+ Foto'}
                  <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={handlePhotoUpload} />
                </label>
              )}
            </div>
            {uploadError && <p className="mt-1 text-xs text-urgent">{uploadError}</p>}
          </div>

          {submitError && <p className="mt-3 text-xs text-urgent">{submitError}</p>}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="btn-primary mt-5 w-full disabled:opacity-60"
          >
            {submitting ? 'Enviando...' : 'Enviar reseña y recibir mi bono 🎁'}
          </button>
        </div>
      </div>
    </div>
  );
}
