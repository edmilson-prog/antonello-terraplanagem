import { formatTelefone } from "@/shared/lib/format";
import { CardSecao } from "@/shared/components/card-secao";
import { DataRow } from "@/shared/components/data-row";
import type { Cliente } from "@/shared/types";

/*
 * Tudo aqui vem da linha do cliente. Antes, nome fantasia, segmento, endereço
 * e contato eram sorteados de pools — e o e-mail era "contato@exemplo.com.br"
 * para toda a base, sem nada na tela indicando que era exemplo.
 */
export function DadosCadastraisClienteCard({ cliente }: { cliente: Cliente }) {
  return (
    <CardSecao titulo="Dados cadastrais" icone="lucide:contact" bodyClassName="px-4 py-1.5">
      <DataRow icone="lucide:building" rotulo="Razão social">
        {cliente.nome}
      </DataRow>
      <DataRow icone="lucide:badge" rotulo="Nome fantasia">
        {cliente.nome_fantasia ?? <Vazio />}
      </DataRow>
      <DataRow icone="lucide:layers" rotulo="Segmento">
        {cliente.segmento ?? <Vazio />}
      </DataRow>
      <DataRow icone="lucide:mail" rotulo="E-mail">
        {cliente.email ? (
          <a href={`mailto:${cliente.email}`} className="hover:text-primary hover:underline">
            {cliente.email}
          </a>
        ) : (
          <Vazio />
        )}
      </DataRow>
      <DataRow icone="lucide:phone" rotulo="Telefone">
        {cliente.telefone ? (
          <span className="font-mono">{formatTelefone(cliente.telefone)}</span>
        ) : (
          <Vazio />
        )}
      </DataRow>
      <DataRow icone="lucide:map-pin" rotulo="Endereço">
        {cliente.endereco || cliente.cidade ? (
          [cliente.endereco, cliente.cidade].filter(Boolean).join(" · ")
        ) : (
          <Vazio />
        )}
      </DataRow>
      <DataRow icone="lucide:user" rotulo="Contato">
        {cliente.contato_nome ? (
          <>
            {cliente.contato_nome}
            {cliente.contato_papel ? (
              <>
                {" · "}
                <small className="text-muted-foreground">{cliente.contato_papel}</small>
              </>
            ) : null}
          </>
        ) : (
          <Vazio />
        )}
      </DataRow>
    </CardSecao>
  );
}

function Vazio() {
  return <span className="text-muted-foreground">—</span>;
}
