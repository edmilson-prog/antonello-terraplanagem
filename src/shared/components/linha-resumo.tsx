interface LinhaResumoProps {
  rotulo: string;
  valor: string;
  vazio?: boolean;
}

// Uma linha "rótulo: valor" dos cards de resumo ao vivo (Cliente, Equipamento,
// Custo, Pagamento, Operador, OS). `vazio` esmaece o valor quando o campo
// ainda não foi preenchido (mesmo padrão visual do mock: "a definir").
export function Linha({ rotulo, valor, vazio }: LinhaResumoProps) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 text-sm">
      <span className="text-muted-foreground">{rotulo}</span>
      <span className={vazio ? "text-foreground-faint" : "font-medium text-foreground"}>
        {valor}
      </span>
    </div>
  );
}
