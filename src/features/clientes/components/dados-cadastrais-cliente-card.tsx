import type { ReactNode } from "react";
import { Icon } from "@iconify/react";
import { formatTelefone } from "@/shared/lib/format";
import { CardSecao } from "@/shared/components/card-secao";
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
      <Drow icone="lucide:building" rotulo="Razão social">
        {cliente.nome}
      </Drow>
      <Drow icone="lucide:badge" rotulo="Nome fantasia">
        {cadastrais.fantasia}
      </Drow>
      <Drow icone="lucide:layers" rotulo="Segmento">
        {cadastrais.segmento}
      </Drow>
      <Drow icone="lucide:mail" rotulo="E-mail">
        {cadastrais.email}
      </Drow>
      <Drow icone="lucide:phone" rotulo="Telefone">
        <span className="font-mono">{formatTelefone(cliente.telefone)}</span>
      </Drow>
      <Drow icone="lucide:map-pin" rotulo="Endereço">
        {cadastrais.endereco}
      </Drow>
      <Drow icone="lucide:user" rotulo="Contato">
        {cadastrais.contatoNome} ·{" "}
        <small className="text-muted-foreground">{cadastrais.contatoPapel}</small>
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
