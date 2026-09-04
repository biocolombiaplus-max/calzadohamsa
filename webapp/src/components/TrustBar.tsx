const ITEMS = [
  { icon: '🚚', title: 'Envío GRATIS', sub: 'A toda Colombia' },
  { icon: '💵', title: 'Contra entrega', sub: 'Paga al recibir' },
  { icon: '↩️', title: 'Cambio gratis', sub: 'Sin complicaciones' },
  { icon: '🔒', title: 'Compra segura', sub: '100% protegida' },
  { icon: '⭐', title: '+2.400 clientas', sub: 'Nos recomiendan' },
];

export default function TrustBar() {
  return (
    <div className="border-y border-border bg-white">
      <div className="container-page grid grid-cols-2 gap-4 py-5 sm:grid-cols-5">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex flex-col items-center gap-1 text-center sm:flex-row sm:text-left">
            <span className="text-2xl">{item.icon}</span>
            <span>
              <span className="block text-xs font-bold text-ink sm:text-sm">{item.title}</span>
              <span className="block text-[11px] text-muted">{item.sub}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
