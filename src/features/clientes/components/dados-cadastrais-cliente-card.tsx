import { formatTelefone } from "@/shared/lib/format";
import { CardSecao } from "@/shared/components/card-secao";
import { DataRow } from "@/shared/components/data-row";
import type { Cliente } from "@/shared/types";
import type { ClienteCadastrais } from "@/features/clientes/cliente-showcase-data";

export function DadosCadastraisClienteCard({
  cliente,
  cadastrais,
}: {
  cliente: Cliente;
  cadastrais: ClienteCadastrais;
}) {
  return (
    <CardSecao titulo="Dados cadastrais" icone="lucide:contact" bodyClassName="px-4 py-1.5">
      <DataRow icone="lucide:building" rotulo="Razão social">
        {cliente.nome}
      </DataRow>
      <DataRow icone="lucide:badge" rotulo="Nome fantasia">
        {cadastrais.fantasia}
      </DataRow>
      <DataRow icone="lucide:layers" rotulo="Segmento">
        {cadastrais.segmento}
      </DataRow>
      <DataRow icone="lucide:mail" rotulo="E-mail">
        {cadastrais.email}
      </DataRow>
      <DataRow icone="lucide:phone" rotulo="Telefone">
        <span className="font-mono">{formatTelefone(cliente.telefone)}</span>
      </DataRow>
      <DataRow icone="lucide:map-pin" rotulo="Endereço">
        {cadastrais.endereco}
      </DataRow>
      <DataRow icone="lucide:user" rotulo="Contato">
        {cadastrais.contatoNome} ·{" "}
        <small className="text-muted-foreground">{cadastrais.contatoPapel}</small>
      </DataRow>
    </CardSecao>
  );
}
