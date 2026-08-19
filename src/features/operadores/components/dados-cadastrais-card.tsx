import { formatData, formatTelefone } from "@/shared/lib/format";
import { CardSecao } from "@/shared/components/card-secao";
import { DataRow } from "@/shared/components/data-row";
import type { CadastraisOperador } from "@/features/operadores/derivacoes";

/*
 * Campo em branco vira "—", não um valor plausível. O cadastro do operador
 * tem quase tudo opcional (CLAUDE.md, minimização de dado pessoal), então
 * ausência é o caso comum — e o card tem que dizer isso.
 */
export function DadosCadastraisCard({
  cadastrais,
  telefone,
}: {
  cadastrais: CadastraisOperador;
  telefone: string | null;
}) {
  return (
    <CardSecao titulo="Dados cadastrais" icone="lucide:contact" bodyClassName="px-4 py-1.5">
      <DataRow icone="lucide:id-card" rotulo="CNH">
        {cadastrais.cnhCategoria ? (
          <>
            Categoria {cadastrais.cnhCategoria}
            {cadastrais.cnhValidade ? (
              <>
                {" · "}
                <small
                  className={
                    cadastrais.cnhVencida
                      ? "font-semibold text-destructive"
                      : "text-muted-foreground"
                  }
                >
                  {cadastrais.cnhVencida ? "vencida em " : "válida até "}
                  {formatData(cadastrais.cnhValidade)}
                </small>
              </>
            ) : null}
          </>
        ) : (
          <Vazio />
        )}
      </DataRow>
      <DataRow icone="lucide:cake" rotulo="Nascimento">
        {cadastrais.nascimento ? (
          <>
            <span className="font-mono">{formatData(cadastrais.nascimento)}</span> ·{" "}
            <small className="text-muted-foreground">{cadastrais.idade}</small>
          </>
        ) : (
          <Vazio />
        )}
      </DataRow>
      <DataRow icone="lucide:briefcase" rotulo="Vínculo">
        {cadastrais.vinculo ? (
          <>
            {cadastrais.vinculo}
            {cadastrais.admissao ? (
              <>
                {" · "}
                <small className="text-muted-foreground">admissão {cadastrais.admissao}</small>
              </>
            ) : null}
          </>
        ) : (
          <Vazio />
        )}
      </DataRow>
      <DataRow icone="lucide:phone" rotulo="Telefone">
        {telefone ? <span className="font-mono">{formatTelefone(telefone)}</span> : <Vazio />}
      </DataRow>
      <DataRow icone="lucide:map-pin" rotulo="Base">
        {cadastrais.base ?? <Vazio />}
      </DataRow>
    </CardSecao>
  );
}

function Vazio() {
  return <span className="text-muted-foreground">—</span>;
}
