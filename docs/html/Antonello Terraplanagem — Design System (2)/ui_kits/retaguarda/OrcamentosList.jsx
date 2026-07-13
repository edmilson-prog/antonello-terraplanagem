/* Retaguarda — Orçamentos (pipeline comercial; filtro por situação). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, StatusChip, Button, Pill } = NS;

const ORC_ROWS = [
  { n: 'ORC-055', t: 'Terraplenagem — fase 2', cli: 'Construtora Vale Verde', data: '02/07', val: '01/08', v: 'R$ 58.000', st: 'Aberto', tone: 'info' },
  { n: 'ORC-051', t: 'Drenagem de acesso', cli: 'Construtora Vale Verde', data: '24/06', val: '24/07', v: 'R$ 22.400', st: 'Aberto', tone: 'info' },
  { n: 'ORC-047', t: 'Pátio de manobra', cli: 'Construtora Vale Verde', data: '12/06', val: '12/07', v: 'R$ 18.900', st: 'Aberto', tone: 'info' },
  { n: 'ORC-042', t: 'Acesso rural — cascalhamento', cli: 'Agro Vale Verde', data: '28/05', val: '—', v: 'R$ 12.600', st: 'Aprovado', tone: 'success' },
  { n: 'ORC-039', t: 'Fundação do anexo', cli: 'Construtora Vale Verde', data: '20/04', val: '—', v: 'R$ 41.000', st: 'Aprovado', tone: 'success' },
  { n: 'ORC-030', t: 'Limpeza de terreno', cli: 'Construtora Vale Verde', data: '08/03', val: '—', v: 'R$ 9.800', st: 'Perdido', tone: 'neutral' },
];

const ORC_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'Aberto', label: 'Abertos', tone: 'info' },
  { id: 'Aprovado', label: 'Aprovados', tone: 'success' },
  { id: 'Perdido', label: 'Perdidos', tone: 'neutral' },
];

function OrcamentosList({ onNew, onOpen }) {
  const [filter, setFilter] = React.useState('todos');
  const rows = filter === 'todos' ? ORC_ROWS : ORC_ROWS.filter((r) => r.st === filter);
  const count = (id) => (id === 'todos' ? ORC_ROWS.length : ORC_ROWS.filter((r) => r.st === id).length);
  const ledColor = (tone) => tone === 'success' ? 'var(--success-fg)' : tone === 'info' ? 'var(--info-fg)' : 'var(--muted-2)';
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Orçamentos</h1>
        <Pill>R$ 99.300 em aberto</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="file-plus" onClick={onNew}>Novo orçamento</Button>
      </div>

      <div className="rtg-filters">
        {ORC_FILTERS.map((f) => (
          <button key={f.id} type="button" className={filter === f.id ? 'rtg-filter is-active' : 'rtg-filter'} onClick={() => setFilter(f.id)}>
            {f.tone && <span className="led" style={{ color: ledColor(f.tone) }} />}
            {f.label}
            <span className="ct">{count(f.id)}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="rtg-tablewrap">
        <table className="rtg-table rtg-clickable">
          <thead>
            <tr><th>Orçamento</th><th>Serviço</th><th>Cliente</th><th>Emissão</th><th>Validade</th><th className="r">Valor</th><th className="r">Situação</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.n} onClick={() => onOpen && onOpen(r)}>
                <td><span className="rtg-doc">{r.n}</span></td>
                <td style={{ fontWeight: 600 }}>{r.t}</td>
                <td>{r.cli}</td>
                <td className="mono">{r.data}</td>
                <td className="mono">{r.val}</td>
                <td className="r rtg-val">{r.v}</td>
                <td className="r"><StatusChip tone={r.tone} led={r.tone !== 'neutral'}>{r.st}</StatusChip></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </>
  );
}
window.OrcamentosList = OrcamentosList;
