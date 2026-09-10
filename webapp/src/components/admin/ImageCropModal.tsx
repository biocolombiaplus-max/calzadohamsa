'use client';

import { useEffect, useState } from 'react';
import { getZoomedContainBlob } from '@/lib/imageCrop';

const MAX_ZOOM = 3;

export default function ImageCropModal({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (blob: Blob) => void;
}) {
  const [imageSrc, setImageSrc] = useState('');
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleConfirm() {
    setProcessing(true);
    try {
      const blob = await getZoomedContainBlob(imageSrc, zoom);
      onConfirm(blob);
    } catch {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4">
      <div className="w-full max-w-lg rounded-card bg-white p-5 shadow-lift">
        <h3 className="mb-1 font-heading text-lg font-bold text-ink">Ajusta el tamaño de la foto</h3>
        <p className="mb-4 text-xs text-muted">
          Empieza mostrando el producto completo, sin recortar nada. Usa la barra para acercar si quieres un
          encuadre más ajustado. Funciona con cualquier tamaño o proporción de foto.
        </p>

        <div className="relative flex h-80 w-full items-center justify-center overflow-hidden rounded-lg bg-white ring-1 ring-border">
          {imageSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageSrc}
              alt="Vista previa de la foto"
              className="h-full w-full object-contain"
              style={{ transform: `scale(${zoom})` }}
            />
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-muted">🔍</span>
          <input
            type="range"
            min={1}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>

        <div className="mt-5 flex gap-3">
          <button type="button" onClick={onCancel} className="btn-secondary flex-1" disabled={processing}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="btn-primary flex-1 disabled:opacity-60"
            disabled={processing}
          >
            {processing ? 'Procesando...' : 'Usar esta foto'}
          </button>
        </div>
      </div>
    </div>
  );
}
