/* Retaguarda — Ordens de Serviço list (filter by status via the chips). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, StatusChip, Button, Pill, IconTile, Icon } = NS;

const OS_ROWS = [
  { n: 'OS-024', t: 'Nivelamento de pátio', cli: 'Agro Vale Verde', op: 'Adelar Machado', eq: 'Pá Carregadeira XCMG', eqIcon: 'forklift', h: '8 h', per: 'desde 05/07', v: 'R$ 9.600', st: 'Aberta', tone: 'info' },
  { n: 'OS-021', t: 'Terraplenagem — lote industrial', cli: 'Construtora Vale Verde', op: 'Adelar Machado', eq: 'Escavadeira CAT 320', eqIcon: 'truck', h: '62 h', per: 'desde 01/07', v: 'R$ 24.800', st: 'Em andamento', tone: 'amber' },
  { n: 'OS-019', t: 'Abertura de acesso e drenagem', cli: 'Construtora Sul', op: 'Vilson Prediger', eq: 'Retroescavadeira JCB 3CX', eqIcon: 'tractor', h: '28 h', per: 'desde 24/06', v: 'R$ 11.200', st: 'Em andamento', tone: 'amber' },
  { n: 'OS-018', t: 'Abertura de acesso e drenagem', cli: 'Essavado Ltda.', op: 'Nelson Kunz', eq: 'Escavadeira CAT 320', eqIcon: 'truck', h: '40 h', per: 'desde 20/06', v: 'R$ 16.200', st: 'Em andamento', tone: 'amber' },
  { n: 'OS-015', t: 'Fundação de galpão — estacas', cli: 'Metalúrgica Boa Vista', op: 'Adelar Machado', eq: 'Escavadeira CAT 320', eqIcon: 'truck', h: '44 h', per: '06–20/06', v: 'R$ 19.800', st: 'Concluída', tone: 'success' },
  { n: 'OS-012', t: 'Fundação de galpão — estacas', cli: 'Construtora Vale Verde', op: 'Vilson Prediger', eq: 'Retroescavadeira JCB 3CX', eqIcon: 'tractor', h: '88 h', per: '02–24/05', v: 'R$ 41.000', st: 'Concluída', tone: 'success' },
  { n: 'OS-007', t: 'Nivelamento de pátio', cli: 'Construtora Vale Verde', op: 'Nelson Kunz', eq: 'Pá Carregadeira XCMG', eqIcon: 'forklift', h: '30 h', per: '08–19/04', v: 'R$ 12.500', st: 'Concluída', tone: 'success' },
];

const OS_FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'Aberta', label: 'Abertas', tone: 'info' },
  { id: 'Em andamento', label: 'Em andamento', tone: 'amber' },
  { id: 'Concluída', label: 'Concluídas', tone: 'success' },
];

function OSList() {
  const [filter, setFilter] = React.useState('todas');
  const rows = filter === 'todas' ? OS_ROWS : OS_ROWS.filter((r) => r.st === filter);
  const count = (id) => (id === 'todas' ? OS_ROWS.length : OS_ROWS.filter((r) => r.st === id).length);
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Ordens de Serviço</h1>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="file-plus">Nova OS</Button>
      </div>

      <div className="rtg-filters">
        {OS_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={filter === f.id ? 'rtg-filter is-active' : 'rtg-filter'}
            onClick={() => setFilter(f.id)}
          >
            {f.tone && <span className="led" style={{ color: `var(--${f.tone === 'amber' ? 'amarelo' : f.tone === 'info' ? 'info-fg' : 'success-fg'})` }} />}
            {f.label}
            <span className="ct">{count(f.id)}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="rtg-tablewrap rtg-tablewrap--wide">
        <table className="rtg-table">
          <thead>
            <tr>
              <th>OS</th><th>Serviço</th><th>Cliente</th><th>Equipamento</th><th>Operador</th>
              <th className="r">Horas</th><th>Período</th><th className="r">Valor</th><th className="r">Situação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.n}>
                <td><span className="rtg-ostag">{r.n}</span></td>
                <td style={{ fontWeight: 600 }}>{r.t}</td>
                <td>{r.cli}</td>
                <td>
                  <div className="rtg-eqcell">
                    <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={r.eqIcon} size={15} /></span>
                    <span className="nm">{r.eq}</span>
                  </div>
                </td>
                <td>{r.op}</td>
                <td className="r rtg-val">{r.h}</td>
                <td className="mono">{r.per}</td>
                <td className="r rtg-val">{r.v}</td>
                <td className="r"><StatusChip tone={r.tone} led>{r.st}</StatusChip></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </>
  );
}
window.OSList = OSList;
