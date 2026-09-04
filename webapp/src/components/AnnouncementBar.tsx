const ITEMS = [
  '🚚 ENVÍO GRATIS a toda Colombia',
  '💵 PAGO CONTRA ENTREGA — paga al recibir',
  '✨ +2.400 mujeres ya las tienen',
  '↩️ CAMBIO DE TALLA sin costo',
  '🔒 COMPRA 100% GARANTIZADA',
  '⚡ DESPACHO en 24-48 horas',
];

export default function AnnouncementBar() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <div className="overflow-hidden bg-primary py-2.5 text-white">
      <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-xs font-bold uppercase tracking-widest">
        {loop.map((item, i) => (
          <span key={i} className="flex items-center gap-10">
            {item}
            <span className="text-primary-light">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
