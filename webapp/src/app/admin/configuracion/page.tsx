'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { DEFAULT_SETTINGS, getSiteSettings, updateSiteSettings } from '@/lib/settings';
import { uploadProductImage } from '@/lib/storage';
import { getDepartamentos, getMunicipios } from '@/lib/colombia';
import type {
  SiteSettings,
  TrustItem,
  BenefitItem,
  TestimonialItem,
  DepartmentRate,
  ShippingException,
} from '@/lib/types';

const DEPARTAMENTOS = getDepartamentos();

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card bg-white p-6 shadow-soft">
      <h2 className="font-heading text-lg font-bold text-ink">{title}</h2>
      {description && <p className="mt-1 text-xs text-muted">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-ink">{label}</label>
      {children}
    </div>
  );
}

const inputClass = 'w-full rounded-lg border border-border px-4 py-2.5 text-sm focus:border-primary focus:outline-none';

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-ink">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded border border-border"
        />
        <input value={value} onChange={(e) => onChange(e.target.value)} className={inputClass} />
      </div>
    </div>
  );
}

function ImageUploadField({
  label,
  value,
  folder,
  onChange,
}: {
  label: string;
  value: string;
  folder: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadProductImage(file, folder);
      onChange(url);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'No se pudo subir la imagen.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        {value && (
          <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-border bg-cream-alt">
            <Image src={value} alt="" fill className="object-cover" />
          </div>
        )}
        <label className="cursor-pointer rounded-lg border border-border px-3 py-2 text-xs font-semibold text-ink hover:border-primary">
          {uploading ? 'Subiendo...' : value ? 'Cambiar imagen' : 'Subir imagen'}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
        {value && (
          <button type="button" onClick={() => onChange('')} className="text-xs text-urgent">
            Quitar
          </button>
        )}
      </div>
    </Field>
  );
}

export default function ConfiguracionPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteSettings()
      .then(setSettings)
      .catch(() => setSettings(DEFAULT_SETTINGS));
  }, []);

  if (!settings) {
    return <p className="text-muted">Cargando configuración...</p>;
  }

  function update<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  }

  function updateNested<K extends 'colors' | 'hero' | 'cta' | 'footer', F extends keyof SiteSettings[K]>(
    key: K,
    field: F,
    value: SiteSettings[K][F],
  ) {
    setSettings((s) => (s ? { ...s, [key]: { ...s[key], [field]: value } } : s));
  }

  function updateShipping<F extends keyof SiteSettings['shipping']>(field: F, value: SiteSettings['shipping'][F]) {
    setSettings((s) => (s ? { ...s, shipping: { ...s.shipping, [field]: value } } : s));
  }

  async function handleSave() {
    if (!settings) return;
    setSaving(true);
    try {
      await updateSiteSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch {
      alert('No se pudo guardar. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 pb-24">
      <div>
        <h1 className="font-heading text-2xl font-bold text-ink">Configuración del sitio</h1>
        <p className="text-sm text-muted">Edita textos, imágenes, colores y contacto sin tocar código</p>
      </div>

      <Section title="General" description="Nombre de la tienda, logo y WhatsApp">
        <Field label="Nombre de la tienda">
          <input
            value={settings.storeName}
            onChange={(e) => update('storeName', e.target.value)}
            className={inputClass}
          />
        </Field>
        <ImageUploadField
          label="Logo (opcional — si no subes uno, se muestra el nombre en texto)"
          value={settings.logoUrl}
          folder="site"
          onChange={(url) => update('logoUrl', url)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Código de país WhatsApp">
            <input
              value={settings.whatsappCountryCode}
              onChange={(e) => update('whatsappCountryCode', e.target.value)}
              className={inputClass}
              placeholder="57"
            />
          </Field>
          <Field label="Número de WhatsApp (sin código de país)">
            <input
              value={settings.whatsappNumber}
              onChange={(e) => update('whatsappNumber', e.target.value)}
              className={inputClass}
              placeholder="3001234567"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Envíos y oferta 2×1"
        description="Costo de envío según departamento/municipio, y el precio del combo 2×1"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Costo de envío por defecto (si el departamento no tiene tarifa propia)">
            <input
              type="number"
              min={0}
              value={settings.shipping.defaultRate}
              onChange={(e) => updateShipping('defaultRate', Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Precio del combo 2×1 (2 pares)">
            <input
              type="number"
              min={0}
              value={settings.bundle2x1.price}
              onChange={(e) => update('bundle2x1', { price: Number(e.target.value) })}
              className={inputClass}
            />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">Tarifas por departamento</p>
          <ListEditor<DepartmentRate>
            items={settings.shipping.rates}
            onChange={(items) => updateShipping('rates', items)}
            empty={{ department: '', rate: settings.shipping.defaultRate }}
            renderRow={(item, onEdit) => (
              <>
                <select
                  value={item.department}
                  onChange={(e) => onEdit({ ...item, department: e.target.value })}
                  className={`${inputClass} bg-white`}
                >
                  <option value="">Departamento...</option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  value={item.rate}
                  onChange={(e) => onEdit({ ...item, rate: Number(e.target.value) })}
                  className={inputClass}
                  placeholder="Costo de envío"
                />
              </>
            )}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink">
            Excepciones por municipio (anulan la tarifa del departamento)
          </p>
          <ListEditor<ShippingException>
            items={settings.shipping.exceptions}
            onChange={(items) => updateShipping('exceptions', items)}
            empty={{ department: '', municipio: '', rate: 0 }}
            renderRow={(item, onEdit) => (
              <>
                <select
                  value={item.department}
                  onChange={(e) => onEdit({ ...item, department: e.target.value, municipio: '' })}
                  className={`${inputClass} bg-white`}
                >
                  <option value="">Departamento...</option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={item.municipio}
                  disabled={!item.department}
                  onChange={(e) => onEdit({ ...item, municipio: e.target.value })}
                  className={`${inputClass} bg-white disabled:opacity-50`}
                >
                  <option value="">{item.department ? 'Municipio...' : 'Elige depto.'}</option>
                  {getMunicipios(item.department).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  value={item.rate}
                  onChange={(e) => onEdit({ ...item, rate: Number(e.target.value) })}
                  className={inputClass}
                  placeholder="Costo de envío"
                />
              </>
            )}
          />
        </div>
      </Section>

      <Section title="Colores de la marca" description="Se aplican en todo el sitio al instante">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ColorField
            label="Primario (botones, CTA)"
            value={settings.colors.primary}
            onChange={(v) => updateNested('colors', 'primary', v)}
          />
          <ColorField
            label="Primario hover"
            value={settings.colors.primaryHover}
            onChange={(v) => updateNested('colors', 'primaryHover', v)}
          />
          <ColorField
            label="Acento claro"
            value={settings.colors.primaryLight}
            onChange={(v) => updateNested('colors', 'primaryLight', v)}
          />
          <ColorField
            label="Fondo principal"
            value={settings.colors.cream}
            onChange={(v) => updateNested('colors', 'cream', v)}
          />
          <ColorField
            label="Fondo alterno"
            value={settings.colors.creamAlt}
            onChange={(v) => updateNested('colors', 'creamAlt', v)}
          />
          <ColorField
            label="Texto principal"
            value={settings.colors.ink}
            onChange={(v) => updateNested('colors', 'ink', v)}
          />
          <ColorField
            label="Texto secundario"
            value={settings.colors.muted}
            onChange={(v) => updateNested('colors', 'muted', v)}
          />
          <ColorField
            label="Bordes"
            value={settings.colors.border}
            onChange={(v) => updateNested('colors', 'border', v)}
          />
        </div>
      </Section>

      <Section title="Barra de anuncios" description="Los mensajes que rotan arriba de todo, uno por línea">
        <textarea
          value={settings.announcementMessages.join('\n')}
          onChange={(e) => update('announcementMessages', e.target.value.split('\n'))}
          rows={6}
          className={inputClass}
        />
      </Section>

      <Section title="Inicio — Hero principal">
        <Field label="Eyebrow (texto pequeño arriba del título)">
          <input
            value={settings.hero.eyebrow}
            onChange={(e) => updateNested('hero', 'eyebrow', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Título principal">
          <input
            value={settings.hero.heading}
            onChange={(e) => updateNested('hero', 'heading', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Subtítulo">
          <textarea
            value={settings.hero.subtext}
            onChange={(e) => updateNested('hero', 'subtext', e.target.value)}
            rows={2}
            className={inputClass}
          />
        </Field>
        <ImageUploadField
          label="Imagen del hero"
          value={settings.hero.image}
          folder="site"
          onChange={(url) => updateNested('hero', 'image', url)}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Badge 1">
            <input
              value={settings.hero.badge1}
              onChange={(e) => updateNested('hero', 'badge1', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Badge 2">
            <input
              value={settings.hero.badge2}
              onChange={(e) => updateNested('hero', 'badge2', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Badge 3">
            <input
              value={settings.hero.badge3}
              onChange={(e) => updateNested('hero', 'badge3', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Botón 1 — texto">
            <input
              value={settings.hero.button1Text}
              onChange={(e) => updateNested('hero', 'button1Text', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Botón 1 — enlace">
            <input
              value={settings.hero.button1Url}
              onChange={(e) => updateNested('hero', 'button1Url', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Botón 2 — texto">
            <input
              value={settings.hero.button2Text}
              onChange={(e) => updateNested('hero', 'button2Text', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Botón 2 — enlace">
            <input
              value={settings.hero.button2Url}
              onChange={(e) => updateNested('hero', 'button2Url', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Barra de confianza" description="Los 5 iconos con texto que aparecen bajo el hero">
        <ListEditor<TrustItem>
          items={settings.trustItems}
          onChange={(items) => update('trustItems', items)}
          empty={{ icon: '⭐', title: '', sub: '' }}
          renderRow={(item, onEdit) => (
            <>
              <input
                value={item.icon}
                onChange={(e) => onEdit({ ...item, icon: e.target.value })}
                className={`${inputClass} w-16 text-center`}
                placeholder="🚚"
              />
              <input
                value={item.title}
                onChange={(e) => onEdit({ ...item, title: e.target.value })}
                className={inputClass}
                placeholder="Título"
              />
              <input
                value={item.sub}
                onChange={(e) => onEdit({ ...item, sub: e.target.value })}
                className={inputClass}
                placeholder="Subtítulo"
              />
            </>
          )}
        />
      </Section>

      <Section title="Sección de beneficios">
        <Field label="Título de la sección">
          <input
            value={settings.benefitsHeading}
            onChange={(e) => update('benefitsHeading', e.target.value)}
            className={inputClass}
          />
        </Field>
        <ListEditor<BenefitItem>
          items={settings.benefits}
          onChange={(items) => update('benefits', items)}
          empty={{ icon: '⭐', title: '', text: '' }}
          renderRow={(item, onEdit) => (
            <>
              <input
                value={item.icon}
                onChange={(e) => onEdit({ ...item, icon: e.target.value })}
                className={`${inputClass} w-16 text-center`}
                placeholder="⭐"
              />
              <input
                value={item.title}
                onChange={(e) => onEdit({ ...item, title: e.target.value })}
                className={inputClass}
                placeholder="Título"
              />
              <input
                value={item.text}
                onChange={(e) => onEdit({ ...item, text: e.target.value })}
                className={inputClass}
                placeholder="Descripción"
              />
            </>
          )}
        />
      </Section>

      <Section title="Testimonios">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Título de la sección">
            <input
              value={settings.testimonialsHeading}
              onChange={(e) => update('testimonialsHeading', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Subtítulo">
            <input
              value={settings.testimonialsSubtext}
              onChange={(e) => update('testimonialsSubtext', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        <ListEditor<TestimonialItem>
          items={settings.testimonials}
          onChange={(items) => update('testimonials', items)}
          empty={{ name: '', city: '', review: '' }}
          renderRow={(item, onEdit) => (
            <>
              <input
                value={item.name}
                onChange={(e) => onEdit({ ...item, name: e.target.value })}
                className={inputClass}
                placeholder="Nombre"
              />
              <input
                value={item.city}
                onChange={(e) => onEdit({ ...item, city: e.target.value })}
                className={inputClass}
                placeholder="Ciudad"
              />
              <input
                value={item.review}
                onChange={(e) => onEdit({ ...item, review: e.target.value })}
                className={inputClass}
                placeholder="Reseña"
              />
            </>
          )}
        />
      </Section>

      <Section title="Llamado a la acción final (antes del footer)">
        <Field label="Eyebrow">
          <input
            value={settings.cta.eyebrow}
            onChange={(e) => updateNested('cta', 'eyebrow', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Título">
          <input
            value={settings.cta.heading}
            onChange={(e) => updateNested('cta', 'heading', e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Texto">
          <textarea
            value={settings.cta.text}
            onChange={(e) => updateNested('cta', 'text', e.target.value)}
            rows={2}
            className={inputClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Botón — texto">
            <input
              value={settings.cta.buttonText}
              onChange={(e) => updateNested('cta', 'buttonText', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Botón — enlace">
            <input
              value={settings.cta.buttonUrl}
              onChange={(e) => updateNested('cta', 'buttonUrl', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      <Section title="Footer">
        <Field label="Descripción de la marca">
          <textarea
            value={settings.footer.brandText}
            onChange={(e) => updateNested('footer', 'brandText', e.target.value)}
            rows={2}
            className={inputClass}
          />
        </Field>
        <Field label="Texto de contacto">
          <input
            value={settings.footer.contactText}
            onChange={(e) => updateNested('footer', 'contactText', e.target.value)}
            className={inputClass}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Instagram (URL, opcional)">
            <input
              value={settings.footer.instagram}
              onChange={(e) => updateNested('footer', 'instagram', e.target.value)}
              className={inputClass}
              placeholder="https://instagram.com/..."
            />
          </Field>
          <Field label="Facebook (URL, opcional)">
            <input
              value={settings.footer.facebook}
              onChange={(e) => updateNested('footer', 'facebook', e.target.value)}
              className={inputClass}
              placeholder="https://facebook.com/..."
            />
          </Field>
          <Field label="TikTok (URL, opcional)">
            <input
              value={settings.footer.tiktok}
              onChange={(e) => updateNested('footer', 'tiktok', e.target.value)}
              className={inputClass}
              placeholder="https://tiktok.com/@..."
            />
          </Field>
        </div>
        <Field label="Texto de derechos de autor (vacío = automático)">
          <input
            value={settings.footer.copyrightText}
            onChange={(e) => updateNested('footer', 'copyrightText', e.target.value)}
            className={inputClass}
            placeholder={`© ${new Date().getFullYear()} ${settings.storeName}. Todos los derechos reservados.`}
          />
        </Field>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-white/95 p-4 backdrop-blur sm:pl-56">
        <div className="mx-auto flex max-w-4xl items-center justify-end gap-4">
          {saved && <span className="text-sm font-semibold text-primary">✓ Guardado</span>}
          <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-60">
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ListEditor<T>({
  items,
  onChange,
  empty,
  renderRow,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  empty: T;
  renderRow: (item: T, onEdit: (item: T) => void) => React.ReactNode;
}) {
  function updateAt(index: number, item: T) {
    onChange(items.map((it, i) => (i === index ? item : it)));
  }

  function removeAt(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {renderRow(item, (updated) => updateAt(i, updated))}
          <button
            type="button"
            onClick={() => removeAt(i)}
            className="shrink-0 text-lg text-urgent"
            aria-label="Eliminar"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, empty])}
        className="text-sm font-semibold text-primary hover:underline"
      >
        + Agregar
      </button>
    </div>
  );
}
