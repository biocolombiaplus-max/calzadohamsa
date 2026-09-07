'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import type { Product, ProductColor, ProductInput } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { createProduct, updateProduct, deleteProduct } from '@/lib/products';
import { uploadProductImage, deleteProductImage } from '@/lib/storage';
import ImageCropModal from './ImageCropModal';

const COMMON_SIZES = ['34', '35', '36', '37', '38', '39', '40', '41', '42'];
const QUICK_COLORS: ProductColor[] = [
  { name: 'Camel', hex: '#C9A06C' },
  { name: 'Terracota', hex: '#A9673A' },
  { name: 'Beige', hex: '#F5E6CE' },
  { name: 'Negro', hex: '#1C1208' },
  { name: 'Blanco', hex: '#FFFFFF' },
  { name: 'Vino', hex: '#7A4A22' },
];
const COMMON_COLLECTIONS = ['sandalias', 'tacones', 'flats', 'botas', 'accesorios'];

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEditing = !!product;

  const [title, setTitle] = useState(product?.title ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(isEditing);
  const [description, setDescription] = useState(product?.description ?? '');
  const [price, setPrice] = useState(product?.price?.toString() ?? '');
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice?.toString() ?? '');
  const [collectionName, setCollectionName] = useState(product?.collection ?? 'sandalias');
  const [stock, setStock] = useState(product?.stock?.toString() ?? '20');
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [active, setActive] = useState(product?.active ?? true);
  const [sizes, setSizes] = useState<string[]>(product?.sizes ?? []);
  const [colors, setColors] = useState<ProductColor[]>(product?.colors ?? []);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [cropQueue, setCropQueue] = useState<File[]>([]);
  const [cropCurrent, setCropCurrent] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [customSize, setCustomSize] = useState('');
  const [customColorName, setCustomColorName] = useState('');
  const [customColorHex, setCustomColorHex] = useState('#A9673A');

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleSize(size: string) {
    setSizes((s) => (s.includes(size) ? s.filter((x) => x !== size) : [...s, size].sort()));
  }

  function addCustomSize() {
    const value = customSize.trim();
    if (!value) return;
    if (!sizes.includes(value)) setSizes((s) => [...s, value]);
    setCustomSize('');
  }

  function toggleQuickColor(color: ProductColor) {
    setColors((c) =>
      c.some((x) => x.name === color.name) ? c.filter((x) => x.name !== color.name) : [...c, color],
    );
  }

  function addCustomColor() {
    const name = customColorName.trim();
    if (!name) return;
    if (colors.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
      setColors((c) => c.map((x) => (x.name.toLowerCase() === name.toLowerCase() ? { ...x, hex: customColorHex } : x)));
    } else {
      setColors((c) => [...c, { name, hex: customColorHex }]);
    }
    setCustomColorName('');
  }

  function removeColor(name: string) {
    setColors((c) => c.filter((x) => x.name !== name));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!slug) {
      setUploadError('Escribe primero el título del producto (lo necesitamos para organizar las fotos).');
      e.target.value = '';
      return;
    }
    setUploadError('');
    const queued = Array.from(files);
    setCropCurrent(queued[0]);
    setCropQueue(queued.slice(1));
    e.target.value = '';
  }

  function advanceCropQueue() {
    setCropCurrent(cropQueue[0] ?? null);
    setCropQueue((q) => q.slice(1));
  }

  async function handleCropConfirm(blob: Blob) {
    setUploading(true);
    try {
      const croppedFile = new File([blob], `${slug || 'foto'}.jpg`, { type: 'image/jpeg' });
      const url = await uploadProductImage(croppedFile, slug);
      setImages((prev) => [...prev, url]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo subir la foto. Intenta de nuevo.');
    } finally {
      setUploading(false);
      advanceCropQueue();
    }
  }

  function handleCropCancel() {
    advanceCropQueue();
  }

  async function handleRemoveImage(url: string) {
    setImages((prev) => prev.filter((i) => i !== url));
    deleteProductImage(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!title || !slug || !price) {
      setError('Título, slug y precio son obligatorios.');
      return;
    }

    setSaving(true);
    const input: ProductInput = {
      slug,
      title,
      description,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      images,
      sizes,
      colors,
      collection: collectionName,
      stock: Number(stock) || 0,
      featured,
      active,
      soldCount: product?.soldCount ?? 0,
      reviewsCount: product?.reviewsCount ?? 0,
    };

    try {
      if (isEditing) {
        await updateProduct(product.id, input);
      } else {
        await createProduct(input);
      }
      router.push('/admin/productos');
      router.refresh();
    } catch {
      setError('No se pudo guardar el producto. Verifica los datos e intenta de nuevo.');
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) return;
    if (!confirm(`¿Eliminar "${product.title}"? Esta acción no se puede deshacer.`)) return;
    await deleteProduct(product.id);
    router.push('/admin/productos');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Información básica</h2>

          <label className="mb-1 block text-sm font-semibold text-ink">Título *</label>
          <input
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="mb-4 w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
            placeholder="Ej: Sandalia Camel Trenzada"
          />

          <label className="mb-1 block text-sm font-semibold text-ink">URL (slug) *</label>
          <input
            required
            value={slug}
            onChange={(e) => {
              setSlug(slugify(e.target.value));
              setSlugTouched(true);
            }}
            className="mb-4 w-full rounded-lg border border-border px-4 py-2.5 font-mono text-sm focus:border-primary focus:outline-none"
          />

          <label className="mb-1 block text-sm font-semibold text-ink">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
            placeholder="Materiales, detalles, cuidados..."
          />
        </div>

        <div className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Fotos del producto</h2>
          <div className="mb-4 flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg border border-border">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(url)}
                  className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-xs text-white"
                >
                  ✕
                </button>
              </div>
            ))}
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-xs text-muted hover:border-primary">
              {uploading ? 'Subiendo...' : '+ Agregar'}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading || !!cropCurrent}
              />
            </label>
          </div>
          {uploadError && (
            <p className="mb-2 rounded-lg bg-urgent/10 p-3 text-sm text-urgent">{uploadError}</p>
          )}
          <p className="text-xs text-muted">
            Sube varias fotos a la vez. Antes de subirla, podrás ajustar el encuadre de cada una — funciona con
            cualquier tamaño o proporción de imagen. La primera foto será la principal, y cada una se optimiza
            automáticamente para que la tienda cargue rápido.
          </p>
        </div>

        <div className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Tallas y colores</h2>

          <p className="mb-2 text-sm font-semibold text-ink">Tallas disponibles</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {COMMON_SIZES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => toggleSize(s)}
                className={`h-10 w-10 rounded-lg border-2 text-sm font-semibold ${
                  sizes.includes(s) ? 'border-primary bg-primary text-white' : 'border-border bg-white text-ink'
                }`}
              >
                {s}
              </button>
            ))}
            {sizes
              .filter((s) => !COMMON_SIZES.includes(s))
              .map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className="flex h-10 items-center gap-1 rounded-lg border-2 border-primary bg-primary px-3 text-sm font-semibold text-white"
                >
                  {s} <span className="text-xs">✕</span>
                </button>
              ))}
          </div>
          <div className="mb-5 flex gap-2">
            <input
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomSize();
                }
              }}
              placeholder="Talla personalizada (ej: XL, 43, única)"
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <button type="button" onClick={addCustomSize} className="btn-secondary px-4 py-2 text-sm">
              + Agregar
            </button>
          </div>

          <p className="mb-2 text-sm font-semibold text-ink">Colores disponibles</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {QUICK_COLORS.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => toggleQuickColor(c)}
                className={`flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-semibold ${
                  colors.some((x) => x.name === c.name) ? 'border-primary bg-primary-light/20' : 'border-border'
                }`}
              >
                <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                {c.name}
              </button>
            ))}
            {colors
              .filter((c) => !QUICK_COLORS.some((q) => q.name === c.name))
              .map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => removeColor(c.name)}
                  className="flex items-center gap-2 rounded-full border-2 border-primary bg-primary-light/20 px-3 py-1.5 text-xs font-semibold"
                >
                  <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: c.hex }} />
                  {c.name} <span>✕</span>
                </button>
              ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="color"
              value={customColorHex}
              onChange={(e) => setCustomColorHex(e.target.value)}
              className="h-10 w-12 cursor-pointer rounded-lg border border-border"
            />
            <input
              value={customColorName}
              onChange={(e) => setCustomColorName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addCustomColor();
                }
              }}
              placeholder="Nombre del color (ej: Rosa palo)"
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
            <button type="button" onClick={addCustomColor} className="btn-secondary px-4 py-2 text-sm">
              + Agregar
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Precio e inventario</h2>

          <label className="mb-1 block text-sm font-semibold text-ink">Precio (COP) *</label>
          <input
            required
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mb-4 w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
            placeholder="99900"
          />

          <label className="mb-1 block text-sm font-semibold text-ink">Precio comparación (opcional)</label>
          <input
            type="number"
            min="0"
            value={compareAtPrice}
            onChange={(e) => setCompareAtPrice(e.target.value)}
            className="mb-4 w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
            placeholder="139900"
          />

          <label className="mb-1 block text-sm font-semibold text-ink">Stock disponible</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
          />
        </div>

        <div className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Organización</h2>
          <label className="mb-1 block text-sm font-semibold text-ink">Colección</label>
          <input
            list="collections"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="mb-4 w-full rounded-lg border border-border px-4 py-2.5 focus:border-primary focus:outline-none"
          />
          <datalist id="collections">
            {COMMON_COLLECTIONS.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>

          <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink">
            <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
            Destacado en inicio
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
            Publicado (visible en la tienda)
          </label>
        </div>

        {error && <p className="rounded-lg bg-urgent/10 p-3 text-sm text-urgent">{error}</p>}

        <button type="submit" disabled={saving || uploading} className="btn-primary w-full disabled:opacity-60">
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Publicar producto'}
        </button>

        {isEditing && (
          <button type="button" onClick={handleDelete} className="w-full text-center text-sm font-semibold text-urgent">
            Eliminar producto
          </button>
        )}
      </div>

      {cropCurrent && (
        <ImageCropModal file={cropCurrent} onCancel={handleCropCancel} onConfirm={handleCropConfirm} />
      )}
    </form>
  );
}
