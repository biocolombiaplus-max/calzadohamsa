const BENEFITS = [
  { icon: '⭐', title: 'Calidad garantizada', text: 'Materiales premium, cambio fácil si algo no queda perfecto.' },
  { icon: '🛡️', title: 'Pago 100% seguro', text: 'Transferencia o paga al recibir tu pedido.' },
  { icon: '💵', title: 'Contra entrega', text: 'Paga cuando el paquete llega a tu puerta. Sin riesgo.' },
  { icon: '🚚', title: 'Envío gratis Colombia', text: 'A toda Colombia sin costo adicional. Llegamos a tu ciudad.' },
];

export default function Benefits() {
  return (
    <section className="bg-cream py-14">
      <div className="container-page">
        <h2 className="mb-8 text-center font-heading text-2xl font-bold text-ink sm:text-3xl">
          ¿Por qué +2.400 mujeres eligen Hamsa?
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {BENEFITS.map((b) => (
            <div key={b.title} className="rounded-card bg-white p-6 text-center shadow-soft">
              <div className="mb-3 text-3xl">{b.icon}</div>
              <h3 className="mb-1 text-sm font-bold text-ink">{b.title}</h3>
              <p className="text-xs leading-relaxed text-muted">{b.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
