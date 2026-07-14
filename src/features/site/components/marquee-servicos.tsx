const ITENS = [
  "Terraplenagem",
  "Escavação",
  "Drenagem",
  "Fundações",
  "Abertura de acessos",
  "Nivelamento",
  "Limpeza de terreno",
];

// Duas cópias lado a lado + translateX(-50%) = loop sem costura, sem depender
// de clonagem via JS (como o mock original fazia).
export function MarqueeServicos() {
  return (
    <div className="overflow-hidden border-y border-border bg-sidebar py-4" aria-hidden="true">
      <div className="flex w-max animate-[marquee_30s_linear_infinite] motion-reduce:animate-none">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex shrink-0">
            {ITENS.map((item, indice) => (
              <span
                key={`${copia}-${item}`}
                className="whitespace-nowrap px-4 font-display text-sm font-extrabold uppercase tracking-[0.2em] text-muted-foreground"
              >
                {item}
                {indice < ITENS.length - 1 ? <b className="text-primary"> · </b> : null}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
