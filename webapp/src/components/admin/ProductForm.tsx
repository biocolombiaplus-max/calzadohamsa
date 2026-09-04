'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState } from 'react';
import type { Product, ProductColor, ProductInput } from '@/lib/types';
import { slugify } from '@/lib/utils';
import { createProduct, updateProduct, deleteProduct } from '@/lib/products';
import { uploadProductImage, deleteProductImage } from '@/lib/storage';

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleSize(size: string) {
    setSizes((s) => (s.includes(size) ? s.filter((x) => x !== size) : [...s, size].sort()));
  }

  function toggleQuickColor(color: ProductColor) {
    setColors((c) =>
      c.some((x) => x.name === color.name) ? c.filter((x) => x.name !== color.name) : [...c, color],
    );
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!slug) {
      setError('Escribe primero el título del producto (necesitamos el slug para guardar las fotos).');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadProductImage(file, slug);
        uploaded.push(url);
      }
      setImages((prev) => [...prev, ...uploaded]);
    } catch {
      setError('Hubo un problema subiendo las imágenes. Intenta de nuevo.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          </div>
          <p className="text-xs text-muted">Sube varias fotos a la vez. La primera será la foto principal.</p>
        </div>

        <div className="rounded-card bg-white p-6 shadow-soft">
          <h2 className="mb-4 font-heading text-lg font-bold text-ink">Tallas y colores</h2>

          <p className="mb-2 text-sm font-semibold text-ink">Tallas disponibles</p>
          <div className="mb-5 flex flex-wrap gap-2">
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
          </div>

          <p className="mb-2 text-sm font-semibold text-ink">Colores disponibles</p>
          <div className="flex flex-wrap gap-2">
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
    </form>
  );
}
