import { formatTelefone } from "@/shared/lib/format";
import { CardSecao } from "@/shared/components/card-secao";
import { DataRow } from "@/shared/components/data-row";
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
      <DataRow icone="lucide:id-card" rotulo="CNH">
        Categoria {cadastrais.cnhCategoria} ·{" "}
        <small className="text-muted-foreground">válida até {cadastrais.cnhValidade}</small>
      </DataRow>
      <DataRow icone="lucide:cake" rotulo="Nascimento">
        <span className="font-mono">{cadastrais.nascimento}</span> ·{" "}
        <small className="text-muted-foreground">{cadastrais.idade}</small>
      </DataRow>
      <DataRow icone="lucide:briefcase" rotulo="Vínculo">
        {cadastrais.vinculo} ·{" "}
        <small className="text-muted-foreground">admissão {cadastrais.admissao}</small>
      </DataRow>
      <DataRow icone="lucide:phone" rotulo="Telefone">
        <span className="font-mono">{formatTelefone(telefone)}</span>
      </DataRow>
      <DataRow icone="lucide:map-pin" rotulo="Base">
        {cadastrais.base}
      </DataRow>
    </CardSecao>
  );
}
