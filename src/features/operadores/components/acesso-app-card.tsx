import { Icon } from "@iconify/react";
import { CardSecao } from "@/features/operadores/components/card-secao";
import type { ShowcaseAcessoApp } from "@/features/operadores/operador-showcase-data";

export function AcessoAppCard({ acesso }: { acesso: ShowcaseAcessoApp }) {
  return (
    <CardSecao titulo="Acesso ao app" icone="lucide:smartphone" bodyClassName="p-4">
      <div className="mb-3.5 flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/10 px-3.5 py-3">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/20 text-primary">
          <Icon icon="lucide:check" className="h-4 w-4" />
        </span>
        <div>
          <div className="text-[13.5px] font-semibold text-foreground">
            {acesso.liberado ? "App liberado" : "App bloqueado"}
          </div>
          <div className="text-[11.5px] text-muted-foreground">Login ativo no dispositivo</div>
        </div>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <AppInfo rotulo="Último acesso" valor={acesso.ultimoAcesso} />
        <AppInfo rotulo="Dispositivo" valor={acesso.dispositivo} />
        <AppInfo rotulo="Versão" valor={acesso.versao} mono />
        <AppInfo rotulo="Aponta via" valor={acesso.apontaVia} />
      </dl>
    </CardSecao>
  );
}

function AppInfo({ rotulo, valor, mono }: { rotulo: string; valor: string; mono?: boolean }) {
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
        {valor}
      </dd>
    </div>
  );
}
