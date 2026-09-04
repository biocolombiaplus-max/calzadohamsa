const STEPS = [
  { icon: '👡', title: 'Elige tu modelo', text: 'Explora nuestra colección y elige el modelo y talla perfecta para ti' },
  { icon: '🛒', title: 'Haz tu pedido', text: 'Agrega al carrito o escríbenos por WhatsApp. Sin tarjeta requerida' },
  { icon: '📦', title: 'Recibe en casa', text: 'Enviamos a toda Colombia en 2-5 días. Paga cuando llega a tu puerta' },
  { icon: '💛', title: 'Lúcelas con amor', text: '¡Disfruta tus sandalias! Cambio de talla gratis si necesitas' },
];

export default function HowItWorks() {
  return (
    <section className="bg-cream-alt py-14">
      <div className="container-page">
        <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-primary">
          Tan fácil como 1, 2, 3
        </p>
        <h2 className="mb-8 text-center font-heading text-2xl font-bold text-ink sm:text-3xl">
          Tu pedido en pasos simples
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="relative rounded-card bg-white p-6 text-center shadow-soft">
              <span className="absolute right-3 top-3 text-xs font-bold text-border">{i + 1}</span>
              <div className="mb-3 text-3xl">{s.icon}</div>
              <h3 className="mb-1 text-sm font-bold text-ink">{s.title}</h3>
              <p className="text-xs leading-relaxed text-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
