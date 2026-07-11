import { Icon } from "@iconify/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardSecao } from "@/features/operadores/components/card-secao";
import type { ShowcaseApontamento } from "@/features/operadores/operador-showcase-data";

export function ApontamentosRecentesCard({
  apontamentos,
}: {
  apontamentos: ShowcaseApontamento[];
}) {
  return (
    <CardSecao titulo="Apontamentos recentes" icone="lucide:timer">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Equipamento</TableHead>
            <TableHead>Horímetro</TableHead>
            <TableHead className="text-right">Horas</TableHead>
            <TableHead className="text-right">OS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apontamentos.map((ap) => (
            <TableRow key={ap.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">{ap.data}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface text-primary">
                    <Icon icon={ap.equipamentoIcone} className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate text-foreground">{ap.equipamentoNome}</span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                <b className="text-foreground">{ap.horimetroInicial}</b> →{" "}
                <b className="text-foreground">{ap.horimetroFinal}</b>
              </TableCell>
              <TableCell className="text-right font-semibold">{ap.horas}</TableCell>
              <TableCell className="text-right">
                <span className="rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">
                  {ap.osNumero}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardSecao>
  );
}
