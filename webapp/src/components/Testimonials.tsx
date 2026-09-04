const REVIEWS = [
  {
    name: 'Valentina M.',
    city: 'Medellín',
    review:
      'Me llegaron rapidísimo y son exactamente como las fotos. Las usé en una boda y recibí mil piropos. ¡Ya pedí otro par!',
  },
  {
    name: 'Daniela R.',
    city: 'Bogotá',
    review:
      'Súper cómodas y de muy buena calidad. El pago contra entrega me dio mucha confianza para comprar. 100% recomendadas.',
  },
  {
    name: 'Alejandra C.',
    city: 'Cali',
    review: 'Dudé al principio pero me arriesgué y quedé encantada. La talla me quedó perfecta y llegaron en 3 días.',
  },
  {
    name: 'Isabella T.',
    city: 'Barranquilla',
    review: 'Hermosas y muy cómodas para caminar todo el día. El servicio de WhatsApp es muy rápido.',
  },
];

export default function Testimonials() {
  return (
    <section className="bg-white py-14">
      <div className="container-page">
        <h2 className="mb-2 text-center font-heading text-2xl font-bold text-ink sm:text-3xl">
          Ellas ya lo tienen — y no paran de recomendarnos
        </h2>
        <p className="mb-8 text-center text-sm text-muted">Reseñas reales de clientas en toda Colombia</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((r) => (
            <div key={r.name} className="rounded-card border border-border bg-cream p-5">
              <p className="mb-3 text-primary">★★★★★</p>
              <p className="mb-4 text-sm leading-relaxed text-ink">&ldquo;{r.review}&rdquo;</p>
              <p className="text-xs font-bold text-ink">{r.name}</p>
              <p className="text-xs text-muted">✅ Compra verificada · {r.city}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
