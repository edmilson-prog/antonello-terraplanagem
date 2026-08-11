import type { ReactNode } from "react";
import { Icon } from "@iconify/react";

/*
 * Tela de confirmação do App de Campo (`screen === 'ok'` no CampoApp.jsx).
 * É o mesmo painel para todo registro feito em campo: título, resumo do que
 * foi salvo e o lembrete de que o dado já está no aparelho.
 */

export interface LinhaConfirmacao {
  rotulo: string;
  valor: ReactNode;
}

export function ConfirmacaoCampo({
  titulo,
  linhas,
  acoes,
}: {
  titulo: string;
  linhas: LinhaConfirmacao[];
  acoes: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3.5 px-[30px] py-8 text-center">
      <div
        aria-hidden
        className="grid h-[74px] w-[74px] place-items-center rounded-[22px] border border-success/35 bg-success/15 text-success-foreground"
      >
        <Icon icon="lucide:circle-check-big" className="h-9 w-9" />
      </div>
      <h2 className="font-display text-xl font-extrabold uppercase leading-[1.15] text-foreground">
        {titulo}
      </h2>
      <dl className="font-mono text-[13px] font-semibold leading-[1.7] text-muted-foreground">
        {linhas.map((linha) => (
          <div key={linha.rotulo}>
            <dt className="inline">{linha.rotulo} · </dt>
            <dd className="inline font-semibold text-foreground">{linha.valor}</dd>
          </div>
        ))}
      </dl>
      <span className="inline-flex items-center gap-2 text-[11.5px] text-foreground-faint">
        <Icon icon="lucide:smartphone" className="h-3.5 w-3.5" />
        Salvo no aparelho — sincroniza ao conectar
      </span>
      <div className="mt-2.5 flex w-full flex-col gap-2.5">{acoes}</div>
    </div>
  );
}
