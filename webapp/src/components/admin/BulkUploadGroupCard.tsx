'use client';

import Image from 'next/image';
import type { ProductColor } from '@/lib/types';
import { COMMON_SIZES, QUICK_COLORS, COMMON_COLLECTIONS } from '@/lib/productConstants';
import { cloudinaryFill, cloudinaryOriginal } from '@/lib/utils';

export interface DraftGroup {
  id: string;
  images: string[];
  noCropImages: string[];
  imageScale: Record<string, number>;
  title: string;
  slug: string;
  slugTouched: boolean;
  price: string;
  compareAtPrice: string;
  sizes: string[];
  colors: ProductColor[];
  collection: string;
  stock: string;
  status: 'draft' | 'error';
  error?: string;
}

export default function BulkUploadGroupCard({
  group,
  index,
  onUpdate,
  onToggleSize,
  onToggleColor,
  onRemoveImage,
  onToggleNoCrop,
  onAdjustScale,
  onAddFiles,
  onRemove,
}: {
  group: DraftGroup;
  index: number;
  onUpdate: (patch: Partial<DraftGroup>) => void;
  onToggleSize: (size: string) => void;
  onToggleColor: (color: ProductColor) => void;
  onRemoveImage: (url: string) => void;
  onToggleNoCrop: (url: string) => void;
  onAdjustScale: (url: string, delta: number) => void;
  onAddFiles: (files: FileList | null) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-card bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wide text-muted">Producto #{index + 1}</p>
        <button type="button" onClick={onRemove} className="text-xs font-bold text-urgent">
          ✕ Quitar
        </button>
      </div>

      {group.error && <p className="mb-3 rounded-lg bg-urgent/10 p-2.5 text-xs text-urgent">{group.error}</p>}

      <div className="mb-3 flex flex-wrap gap-2">
        {group.images.map((url) => {
          const isFull = group.noCropImages.includes(url);
          const scale = group.imageScale[url] ?? 100;
          return (
            <div key={url} className="w-20">
              <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-border bg-white">
                <Image
                  src={isFull ? cloudinaryOriginal(url) : cloudinaryFill(url, 160)}
                  alt=""
                  fill
                  unoptimized
                  className={isFull ? 'object-contain' : 'object-cover'}
                  style={isFull ? { transform: `scale(${scale / 100})` } : undefined}
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(url)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-xs text-white"
                >
                  ✕
                </button>
              </div>
              <button
                type="button"
                onClick={() => onToggleNoCrop(url)}
                className={`mt-1 w-full rounded-md px-1 py-0.5 text-[9px] font-bold leading-tight ${
                  isFull ? 'bg-primary-light/20 text-primary' : 'bg-cream-alt text-muted'
                }`}
              >
                {isFull ? '🖼️ Completa' : '🔲 Recortada'}
              </button>
              {isFull && (
                <div className="mt-0.5 flex items-center justify-between gap-1 rounded-md bg-cream-alt px-1 py-0.5">
                  <button
                    type="button"
                    onClick={() => onAdjustScale(url, -10)}
                    disabled={scale <= 40}
                    className="flex h-4 w-4 items-center justify-center rounded bg-white text-[10px] font-bold text-ink shadow-sm disabled:opacity-30"
                  >
                    −
                  </button>
                  <span className="text-[9px] font-bold text-muted">{scale}%</span>
                  <button
                    type="button"
                    onClick={() => onAdjustScale(url, 10)}
                    disabled={scale >= 100}
                    className="flex h-4 w-4 items-center justify-center rounded bg-white text-[10px] font-bold text-ink shadow-sm disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-[10px] text-muted hover:border-primary">
          + Fotos
          <input type="file" accept="image/*" multiple onChange={(e) => onAddFiles(e.target.files)} className="hidden" />
        </label>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <input
            value={group.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Título (ej: Sandalia Camel Trenzada) *"
            className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <input
          value={group.slug}
          onChange={(e) => onUpdate({ slug: e.target.value, slugTouched: true })}
          placeholder="URL (slug) *"
          className="w-full rounded-lg border border-border px-3 py-2 font-mono text-xs focus:border-primary focus:outline-none"
        />
        <input
          list="carga-rapida-collections"
          value={group.collection}
          onChange={(e) => onUpdate({ collection: e.target.value })}
          placeholder="Colección"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="number"
          min="0"
          value={group.price}
          onChange={(e) => onUpdate({ price: e.target.value })}
          placeholder="Precio (COP) *"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="number"
          min="0"
          value={group.compareAtPrice}
          onChange={(e) => onUpdate({ compareAtPrice: e.target.value })}
          placeholder="Precio comparación (opcional)"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="number"
          min="0"
          value={group.stock}
          onChange={(e) => onUpdate({ stock: e.target.value })}
          placeholder="Stock"
          className="w-full rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <datalist id="carga-rapida-collections">
        {COMMON_COLLECTIONS.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {COMMON_SIZES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onToggleSize(s)}
            className={`h-8 w-8 rounded-lg border-2 text-xs font-semibold ${
              group.sizes.includes(s) ? 'border-primary bg-primary text-white' : 'border-border bg-white text-ink'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {QUICK_COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            onClick={() => onToggleColor(c)}
            className={`flex items-center gap-1.5 rounded-full border-2 px-2.5 py-1 text-[11px] font-semibold ${
              group.colors.some((x) => x.name === c.name) ? 'border-primary bg-primary-light/20' : 'border-border'
            }`}
          >
            <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
