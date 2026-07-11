import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { formatTelefone } from "@/shared/lib/format";
import { CardSecao } from "@/shared/components/card-secao";
import type { ShowcaseCadastrais } from "@/features/operadores/operador-showcase-data";

export function DadosCadastraisCard({
  cadastrais,
  telefone,
}: {
  cadastrais: ShowcaseCadastrais;
  telefone: string | null;
}) {
  return (
    <CardSecao titulo="Dados cadastrais" icone="lucide:contact" bodyClassName="px-4 py-1.5">
      <Drow icone="lucide:id-card" rotulo="CNH">
        Categoria {cadastrais.cnhCategoria} ·{" "}
        <small className="text-muted-foreground">válida até {cadastrais.cnhValidade}</small>
      </Drow>
      <Drow icone="lucide:cake" rotulo="Nascimento">
        <span className="font-mono">{cadastrais.nascimento}</span> ·{" "}
        <small className="text-muted-foreground">{cadastrais.idade}</small>
      </Drow>
      <Drow icone="lucide:briefcase" rotulo="Vínculo">
        {cadastrais.vinculo} ·{" "}
        <small className="text-muted-foreground">admissão {cadastrais.admissao}</small>
      </Drow>
      <Drow icone="lucide:phone" rotulo="Telefone">
        <span className="font-mono">{formatTelefone(telefone)}</span>
      </Drow>
      <Drow icone="lucide:map-pin" rotulo="Base">
        {cadastrais.base}
      </Drow>
    </CardSecao>
  );
}

function Drow({ icone, rotulo, children }: { icone: string; rotulo: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-3 border-b border-border py-3 last:border-b-0">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-muted-foreground">
        <Icon icon={icone} className="h-4 w-4" />
      </span>
      <div>
        <div className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
          {rotulo}
        </div>
        <div className="mt-0.5 text-[13.5px] font-medium text-foreground">{children}</div>
      </div>
    </div>
  );
}
