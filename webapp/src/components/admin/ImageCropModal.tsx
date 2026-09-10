'use client';

import { useEffect, useState, useCallback } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import 'react-easy-crop/react-easy-crop.css';
import { getCroppedImageBlob, getContainedImageBlob } from '@/lib/imageCrop';

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
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setImageSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  async function handleConfirmCrop() {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImageBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch {
      setProcessing(false);
    }
  }

  async function handleUseWholePhoto() {
    setProcessing(true);
    try {
      const blob = await getContainedImageBlob(imageSrc);
      onConfirm(blob);
    } catch {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4">
      <div className="w-full max-w-lg rounded-card bg-white p-5 shadow-lift">
        <h3 className="mb-1 font-heading text-lg font-bold text-ink">Ajusta el encuadre de la foto</h3>
        <p className="mb-4 text-xs text-muted">
          Arrastra para mover y usa la barra para acercar. Funciona con cualquier tamaño o proporción de foto.
        </p>

        <div className="relative h-80 w-full overflow-hidden rounded-lg bg-ink/5">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              minZoom={1}
              maxZoom={3}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          )}
        </div>

        <div className="mt-3 flex items-center gap-3">
          <span className="text-xs text-muted">🔍</span>
          <input
            type="range"
            min={1}
            max={3}
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
            onClick={handleConfirmCrop}
            className="btn-primary flex-1 disabled:opacity-60"
            disabled={processing || !croppedAreaPixels}
          >
            {processing ? 'Procesando...' : 'Usar este recorte'}
          </button>
        </div>

        <div className="mt-4 border-t border-border pt-4 text-center">
          <p className="mb-2 text-xs text-muted">
            ¿El producto no cabe completo en el recorte? Usa la foto entera sin recortar nada — se ajusta con
            fondo blanco a los lados si hace falta.
          </p>
          <button
            type="button"
            onClick={handleUseWholePhoto}
            disabled={processing}
            className="text-sm font-semibold text-primary hover:underline disabled:opacity-60"
          >
            📐 Usar la foto completa, sin recortar
          </button>
        </div>
      </div>
    </div>
  );
}
