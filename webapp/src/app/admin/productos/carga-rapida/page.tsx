'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ProductColor, ProductInput } from '@/lib/types';
import { cloudinaryFill, classNames, slugify } from '@/lib/utils';
import { createProduct } from '@/lib/products';
import { uploadProductImage } from '@/lib/storage';
import { resizeForUpload } from '@/lib/imageCrop';
import BulkUploadGroupCard, { type DraftGroup } from '@/components/admin/BulkUploadGroupCard';

const UPLOAD_CONCURRENCY = 4;

function makeGroup(seed: Partial<DraftGroup> = {}): DraftGroup {
  return {
    id: crypto.randomUUID(),
    images: [],
    noCropImages: [],
    imageScale: {},
    title: '',
    slug: '',
    slugTouched: false,
    price: seed.price ?? '',
    compareAtPrice: seed.compareAtPrice ?? '',
    sizes: seed.sizes ?? [],
    colors: seed.colors ?? [],
    collection: seed.collection ?? 'sandalias',
    stock: seed.stock ?? '20',
    status: 'draft',
  };
}

export default function CargaRapidaPage() {
  const router = useRouter();
  const [pool, setPool] = useState<string[]>([]);
  const [selectedPool, setSelectedPool] = useState<Set<string>>(new Set());
  const [groups, setGroups] = useState<DraftGroup[]>([]);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);
  const [createProgress, setCreateProgress] = useState<{ done: number; total: number } | null>(null);
  const [globalError, setGlobalError] = useState('');

  // Sube muchas fotos a la vez con varias subidas en paralelo (en vez de
  // una por una) para que cargar 20-30 fotos sea cuestión de segundos, no
  // minutos — cada foto aparece en la pantalla apenas termina de subir, sin
  // esperar a que terminen las demás.
  async function handleFiles(fileList: FileList | null, targetGroupId?: string) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setBatchProgress({ done: 0, total: files.length });
    setUploadErrors([]);
    let index = 0;
    let done = 0;

    async function worker() {
      while (index < files.length) {
        const file = files[index++];
        try {
          const resized = await resizeForUpload(file);
          const uploadFile = new File([resized], file.name || 'foto.jpg', { type: 'image/jpeg' });
          const url = await uploadProductImage(uploadFile, '');
          if (targetGroupId) {
            setGroups((gs) => gs.map((g) => (g.id === targetGroupId ? { ...g, images: [...g.images, url] } : g)));
          } else {
            setPool((prev) => [...prev, url]);
          }
        } catch (err) {
          setUploadErrors((prev) => [...prev, err instanceof Error ? err.message : 'No se pudo subir una foto.']);
        } finally {
          done++;
          setBatchProgress({ done, total: files.length });
        }
      }
    }

    await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, files.length) }, worker));
    setBatchProgress(null);
  }

  function togglePoolSelect(url: string) {
    setSelectedPool((prev) => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url);
      else next.add(url);
      return next;
    });
  }

  function removeFromPool(url: string) {
    setPool((prev) => prev.filter((u) => u !== url));
    setSelectedPool((prev) => {
      const next = new Set(prev);
      next.delete(url);
      return next;
    });
  }

  // Agrupa las fotos marcadas en un producto nuevo — copia el precio,
  // tallas, colores, colección y stock del último producto agregado, para
  // no tener que volver a escribirlos si son varios modelos parecidos.
  function createGroupFromSelection() {
    if (selectedPool.size === 0) return;
    const images = pool.filter((u) => selectedPool.has(u));
    const last = groups[groups.length - 1];
    const group = makeGroup({
      price: last?.price,
      compareAtPrice: last?.compareAtPrice,
      sizes: last?.sizes,
      colors: last?.colors,
      collection: last?.collection,
      stock: last?.stock,
    });
    group.images = images;
    setGroups((g) => [...g, group]);
    setPool((prev) => prev.filter((u) => !selectedPool.has(u)));
    setSelectedPool(new Set());
  }

  function updateGroup(id: string, patch: Partial<DraftGroup>) {
    setGroups((gs) => gs.map((g) => (g.id === id ? { ...g, ...patch } : g)));
  }

  function handleTitleChange(id: string, value: string) {
    setGroups((gs) =>
      gs.map((g) => (g.id === id ? { ...g, title: value, slug: g.slugTouched ? g.slug : slugify(value) } : g)),
    );
  }

  function toggleGroupSize(id: string, size: string) {
    setGroups((gs) =>
      gs.map((g) =>
        g.id === id
          ? { ...g, sizes: g.sizes.includes(size) ? g.sizes.filter((s) => s !== size) : [...g.sizes, size].sort() }
          : g,
      ),
    );
  }

  function toggleGroupColor(id: string, color: ProductColor) {
    setGroups((gs) =>
      gs.map((g) =>
        g.id === id
          ? {
              ...g,
              colors: g.colors.some((c) => c.name === color.name)
                ? g.colors.filter((c) => c.name !== color.name)
                : [...g.colors, color],
            }
          : g,
      ),
    );
  }

  function removeImageFromGroup(groupId: string, url: string) {
    setGroups((gs) =>
      gs.map((g) =>
        g.id === groupId
          ? { ...g, images: g.images.filter((i) => i !== url), noCropImages: g.noCropImages.filter((i) => i !== url) }
          : g,
      ),
    );
    setPool((prev) => [...prev, url]);
  }

  function toggleGroupNoCrop(groupId: string, url: string) {
    setGroups((gs) =>
      gs.map((g) =>
        g.id === groupId
          ? {
              ...g,
              noCropImages: g.noCropImages.includes(url)
                ? g.noCropImages.filter((i) => i !== url)
                : [...g.noCropImages, url],
            }
          : g,
      ),
    );
  }

  function adjustGroupScale(groupId: string, url: string, delta: number) {
    setGroups((gs) =>
      gs.map((g) => {
        if (g.id !== groupId) return g;
        const current = g.imageScale[url] ?? 100;
        const next = Math.min(100, Math.max(40, current + delta));
        return { ...g, imageScale: { ...g.imageScale, [url]: next } };
      }),
    );
  }

  function removeGroup(id: string) {
    const group = groups.find((g) => g.id === id);
    if (group) setPool((prev) => [...prev, ...group.images]);
    setGroups((gs) => gs.filter((g) => g.id !== id));
  }

  function validateGroups(): string | null {
    const slugs = new Set<string>();
    for (const g of groups) {
      const label = g.title.trim() || 'un producto sin título';
      if (!g.title.trim()) return `Falta el título de ${label}.`;
      if (!g.slug.trim()) return `Falta la URL de "${g.title}".`;
      if (slugs.has(g.slug)) return `Dos productos tienen la misma URL "${g.slug}" — cambia una antes de crear.`;
      slugs.add(g.slug);
      if (!g.price || Number(g.price) <= 0) return `Falta el precio de "${g.title}".`;
      if (g.images.length === 0) return `"${g.title}" no tiene fotos.`;
    }
    return null;
  }

  async function handleCreateAll() {
    if (groups.length === 0) return;
    const validationError = validateGroups();
    if (validationError) {
      setGlobalError(validationError);
      return;
    }
    setGlobalError('');
    setCreating(true);
    setCreateProgress({ done: 0, total: groups.length });
    let done = 0;

    const results = await Promise.allSettled(
      groups.map((g) => {
        const input: ProductInput = {
          slug: g.slug,
          title: g.title.trim(),
          description: '',
          price: Number(g.price),
          compareAtPrice: g.compareAtPrice ? Number(g.compareAtPrice) : null,
          images: g.images,
          noCropImages: g.noCropImages,
          imageScale: g.imageScale,
          sizes: g.sizes,
          colors: g.colors,
          collection: g.collection,
          stock: Number(g.stock) || 0,
          featured: false,
          active: true,
          soldCount: 0,
          reviewsCount: 0,
          reviews: [],
        };
        return createProduct(input).finally(() => {
          done++;
          setCreateProgress({ done, total: groups.length });
        });
      }),
    );

    const remaining: DraftGroup[] = [];
    let anyCreated = false;
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        anyCreated = true;
      } else {
        remaining.push({ ...groups[i], status: 'error', error: r.reason instanceof Error ? r.reason.message : 'No se pudo crear.' });
      }
    });

    setGroups(remaining);
    setCreating(false);
    setCreateProgress(null);

    if (remaining.length === 0 && anyCreated) {
      router.push('/admin/productos');
      router.refresh();
    } else if (remaining.length > 0) {
      setGlobalError(`${remaining.length} producto(s) no se pudieron crear — revisa el error debajo de cada uno.`);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-2">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink">⚡ Carga rápida</h1>
          <p className="text-sm text-muted">
            Sube muchas fotos a la vez, agrúpalas en productos y completa los datos de cada uno — ideal cuando
            tienes varios modelos nuevos para publicar de un tirón.
          </p>
        </div>
        <Link href="/admin/productos" className="shrink-0 text-sm font-semibold text-primary hover:underline">
          ← Volver a productos
        </Link>
      </div>

      <div className="rounded-card bg-white p-4 shadow-soft">
        <h2 className="mb-1 font-heading text-base font-bold text-ink">1. Sube todas las fotos</h2>
        <p className="mb-3 text-xs text-muted">
          De cualquier tamaño o proporción, de todos los modelos mezclados — las agrupas en el paso 2.
        </p>

        <label className="mb-3 flex h-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-sm text-muted hover:border-primary">
          {batchProgress ? `Subiendo ${batchProgress.done}/${batchProgress.total}...` : '+ Seleccionar fotos (puedes elegir varias a la vez)'}
          <input type="file" accept="image/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
        </label>

        {uploadErrors.length > 0 && (
          <div className="mb-3 space-y-1">
            {uploadErrors.map((err, i) => (
              <p key={i} className="rounded-lg bg-urgent/10 p-2 text-xs text-urgent">
                {err}
              </p>
            ))}
          </div>
        )}

        {pool.length > 0 && (
          <>
            <div className="mb-3 flex flex-wrap gap-2">
              {pool.map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => togglePoolSelect(url)}
                  className={classNames(
                    'relative h-20 w-20 overflow-hidden rounded-lg border-2',
                    selectedPool.has(url) ? 'border-primary' : 'border-border',
                  )}
                >
                  <Image src={cloudinaryFill(url, 160)} alt="" fill className="object-cover" />
                  {selectedPool.has(url) && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary/40 text-lg font-bold text-white">
                      ✓
                    </span>
                  )}
                  <span
                    role="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromPool(url);
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-xs text-white"
                  >
                    ✕
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={createGroupFromSelection}
              disabled={selectedPool.size === 0}
              className="btn-primary px-4 py-2 text-sm disabled:opacity-40"
            >
              📦 Agrupar {selectedPool.size > 0 ? `(${selectedPool.size})` : ''} en un producto nuevo
            </button>
            <p className="mt-2 text-xs text-muted">Toca las fotos de un mismo modelo para seleccionarlas, luego agrúpalas.</p>
          </>
        )}
      </div>

      {groups.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-3 font-heading text-base font-bold text-ink">
            2. Completa los datos de cada producto ({groups.length})
          </h2>
          <div className="space-y-4">
            {groups.map((g, i) => (
              <BulkUploadGroupCard
                key={g.id}
                group={g}
                index={i}
                onUpdate={(patch) => (patch.title !== undefined ? handleTitleChange(g.id, patch.title) : updateGroup(g.id, patch))}
                onToggleSize={(size) => toggleGroupSize(g.id, size)}
                onToggleColor={(color) => toggleGroupColor(g.id, color)}
                onRemoveImage={(url) => removeImageFromGroup(g.id, url)}
                onToggleNoCrop={(url) => toggleGroupNoCrop(g.id, url)}
                onAdjustScale={(url, delta) => adjustGroupScale(g.id, url, delta)}
                onAddFiles={(files) => handleFiles(files, g.id)}
                onRemove={() => removeGroup(g.id)}
              />
            ))}
          </div>

          {globalError && <p className="mt-4 rounded-lg bg-urgent/10 p-3 text-sm text-urgent">{globalError}</p>}

          <button
            type="button"
            onClick={handleCreateAll}
            disabled={creating}
            className="btn-primary mt-4 w-full py-3 text-sm disabled:opacity-60"
          >
            {creating
              ? `Creando ${createProgress?.done ?? 0}/${createProgress?.total ?? groups.length}...`
              : `✓ Crear ${groups.length} producto${groups.length === 1 ? '' : 's'}`}
          </button>
        </div>
      )}
    </div>
  );
}
