import { Icon } from "@iconify/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CardSecao } from "@/shared/components/card-secao";
import type { EquipamentoLeitura } from "@/features/equipamentos/equipamento-showcase-data";

export function LeiturasHorimetroCard({ leituras }: { leituras: EquipamentoLeitura[] }) {
  return (
    <CardSecao titulo="Leituras de horímetro" icone="lucide:gauge">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Operador</TableHead>
            <TableHead>OS</TableHead>
            <TableHead>Horímetro</TableHead>
            <TableHead className="text-right">Horas</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leituras.map((l) => (
            <TableRow key={l.id}>
              <TableCell className="font-mono text-xs text-muted-foreground">{l.data}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface text-primary">
                    <Icon icon="lucide:user" className="h-3.5 w-3.5" />
                  </span>
                  <span className="truncate text-foreground">{l.operadorNome}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="rounded-md border border-primary/25 bg-primary/10 px-1.5 py-0.5 font-mono text-xs font-semibold text-primary">
                  {l.osNumero}
                </span>
              </TableCell>
              <TableCell className="font-mono text-xs text-muted-foreground">
                <b className="text-foreground">{l.horimetroInicial}</b> →{" "}
                <b className="text-foreground">{l.horimetroFinal}</b>
              </TableCell>
              <TableCell className="text-right font-semibold">{l.horas}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardSecao>
  );
}
