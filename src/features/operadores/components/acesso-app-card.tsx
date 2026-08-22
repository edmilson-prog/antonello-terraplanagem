import { Icon } from "@iconify/react";
import { CardSecao } from "@/shared/components/card-secao";
import { formatAcessoRelativo } from "@/shared/lib/format";
import type { AcessoApp } from "@/features/operadores/acesso-app-store";

/*
 * `acesso === undefined` significa "nunca entrou no app". É diferente de
 * acesso revogado, e a tela diz cada coisa pelo nome: antes este card sorteava
 * "App liberado · Hoje, 07:32 · Android · Redmi 12" para qualquer operador,
 * inclusive um cadastrado cinco minutos antes que jamais abriu o app.
 */
export function AcessoAppCard({
  acesso,
  isLoading,
  temApontamentos,
}: {
  acesso: AcessoApp | undefined;
  isLoading: boolean;
  temApontamentos: boolean;
}) {
  return (
    <CardSecao titulo="Acesso ao app" icone="lucide:smartphone" bodyClassName="p-4">
      {isLoading ? (
        <div className="h-[132px] animate-pulse rounded-lg bg-surface" />
      ) : acesso ? (
        <Concedido acesso={acesso} temApontamentos={temApontamentos} />
      ) : (
        <NuncaAcessou temApontamentos={temApontamentos} />
      )}
    </CardSecao>
  );
}

function Concedido({ acesso, temApontamentos }: { acesso: AcessoApp; temApontamentos: boolean }) {
  return (
    <>
      <div
        className={
          acesso.liberado
            ? "mb-3.5 flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/10 px-3.5 py-3"
            : "mb-3.5 flex items-center gap-3 rounded-lg border border-border bg-surface px-3.5 py-3"
        }
      >
        <span
          className={
            acesso.liberado
              ? "grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary"
              : "grid h-8 w-8 place-items-center rounded-lg bg-steel/20 text-muted-foreground"
          }
        >
          <Icon icon={acesso.liberado ? "lucide:check" : "lucide:lock"} className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[13.5px] font-semibold text-foreground">
            {acesso.liberado ? "App liberado" : "Sessão encerrada"}
          </div>
          <div className="text-[11.5px] text-muted-foreground">
            {acesso.liberado ? "Login ativo no dispositivo" : "Precisa entrar de novo com o PIN"}
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <AppInfo rotulo="Último acesso" valor={formatAcessoRelativo(acesso.ultimoAcesso)} />
        <AppInfo rotulo="Dispositivo" valor={acesso.dispositivo} />
        <AppInfo rotulo="Versão" valor={acesso.appVersao} mono />
        <AppInfo
          rotulo="Aponta via"
          valor={temApontamentos ? "App de campo" : "Ainda não apontou"}
        />
      </dl>
    </>
  );
}

function NuncaAcessou({ temApontamentos }: { temApontamentos: boolean }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-dashed px-3.5 py-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-surface text-muted-foreground">
        <Icon icon="lucide:smartphone-nfc" className="h-4 w-4" />
      </span>
      <div>
        <div className="text-[13.5px] font-semibold text-foreground">Nunca entrou no app</div>
        <div className="mt-0.5 text-[11.5px] text-muted-foreground">
          {temApontamentos
            ? "As horas deste operador foram lançadas pela retaguarda. O PIN inicial são os últimos 4 dígitos do CPF."
            : "O PIN inicial de acesso são os últimos 4 dígitos do CPF."}
        </div>
      </div>
    </div>
  );
}

function AppInfo({
  rotulo,
  valor,
  mono,
}: {
  rotulo: string;
  valor: string | null;
  mono?: boolean;
}) {
  return (
    <div>
      <dt className="font-display text-[10px] font-semibold uppercase tracking-widest text-foreground-faint">
        {rotulo}
      </dt>
      <dd
        className={
          mono ? "mt-1 font-mono text-[13px] text-foreground" : "mt-1 text-[13px] text-foreground"
        }
      >
        {valor ?? <span className="text-muted-foreground">não informado</span>}
      </dd>
    </div>
  );
}
