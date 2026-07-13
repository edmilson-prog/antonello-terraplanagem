/* Retaguarda — Equipamentos list (frota; filtro por situação). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, StatusChip, Badge, Button, Pill, Icon } = NS;

const EQ_ROWS = [
  { id: 'cat320', nome: 'Escavadeira CAT 320', sub: 'Caterpillar · 2019', ic: 'truck', tipo: 'Escavadeira', hor: '4.218', mes: '148 h', diesel: '14,2 L/h', prox: 'em 82 h', st: 'Em operação', tone: 'success' },
  { id: 'jcb', nome: 'Retroescavadeira JCB 3CX', sub: 'JCB · 2021', ic: 'tractor', tipo: 'Retroescavadeira', hor: '1.895', mes: '96 h', diesel: '9,8 L/h', prox: 'em 105 h', st: 'Em operação', tone: 'success' },
  { id: 'xcmg', nome: 'Pá Carregadeira XCMG', sub: 'XCMG LW300 · 2020', ic: 'forklift', tipo: 'Pá carregadeira', hor: '1.004', mes: '74 h', diesel: '11,5 L/h', prox: 'vencida', proxLate: true, st: 'Em manutenção', tone: 'amber' },
  { id: 'volvo', nome: 'Escavadeira Volvo EC140', sub: 'Volvo · 2017', ic: 'truck', tipo: 'Escavadeira', hor: '7.612', mes: '0 h', diesel: '15,1 L/h', prox: 'em 12 h', st: 'Em manutenção', tone: 'amber' },
  { id: 'basc01', nome: 'Caminhão basculante 01', sub: 'VW Constellation · 2018', ic: 'truck', tipo: 'Caminhão', hor: '2.138', mes: '58 h', diesel: '18,4 L/h', prox: 'em 60 h', st: 'Em operação', tone: 'success' },
  { id: 'basc02', nome: 'Caminhão basculante 02', sub: 'Mercedes Axor · 2015', ic: 'truck', tipo: 'Caminhão', hor: '3.410', mes: '0 h', diesel: '19,0 L/h', prox: '—', st: 'Parado', tone: 'neutral' },
  { id: 'rolo', nome: 'Rolo compactador CA25', sub: 'Dynapac · 2016', ic: 'tractor', tipo: 'Compactador', hor: '2.880', mes: '22 h', diesel: '8,6 L/h', prox: 'em 130 h', st: 'Em operação', tone: 'success' },
  { id: 'prancha', nome: 'Prancha de transporte', sub: 'Randon · 2019', ic: 'truck', tipo: 'Implemento', hor: '—', mes: '16 h', diesel: '—', prox: 'em 90 dias', st: 'Em operação', tone: 'success' },
];

const EQ_FILTERS = [
  { id: 'todos', label: 'Todos' },
  { id: 'Em operação', label: 'Em operação', tone: 'success' },
  { id: 'Em manutenção', label: 'Em manutenção', tone: 'amber' },
  { id: 'Parado', label: 'Parados', tone: 'neutral' },
];

function EquipamentosList() {
  const [filter, setFilter] = React.useState('todos');
  const rows = filter === 'todos' ? EQ_ROWS : EQ_ROWS.filter((r) => r.st === filter);
  const count = (id) => (id === 'todos' ? EQ_ROWS.length : EQ_ROWS.filter((r) => r.st === id).length);
  const ledColor = (tone) => tone === 'success' ? 'var(--success-fg)' : tone === 'amber' ? 'var(--amarelo)' : 'var(--muted-2)';
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Equipamentos</h1>
        <Pill>14 na frota</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="file-plus">Novo equipamento</Button>
      </div>

      <div className="rtg-filters">
        {EQ_FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={filter === f.id ? 'rtg-filter is-active' : 'rtg-filter'}
            onClick={() => setFilter(f.id)}
          >
            {f.tone && <span className="led" style={{ color: ledColor(f.tone) }} />}
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
              <th>Equipamento</th><th>Tipo</th><th className="r">Horímetro</th><th className="r">Horas (mês)</th>
              <th className="r">Diesel médio</th><th>Próx. manutenção</th><th className="r">Situação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="rtg-namecell">
                    <span className="atp-tile atp-tile--amber" style={{ width: 30, height: 30 }}><Icon name={r.ic} size={16} /></span>
                    <div><div className="nm">{r.nome}</div><div className="sub">{r.sub}</div></div>
                  </div>
                </td>
                <td><Badge tone="neutral">{r.tipo}</Badge></td>
                <td className="r rtg-val">{r.hor}</td>
                <td className="r rtg-val">{r.mes}</td>
                <td className="r rtg-val">{r.diesel}</td>
                <td className="mono" style={r.proxLate ? { color: 'var(--danger-fg)', fontWeight: 600 } : undefined}>{r.prox}</td>
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
window.EquipamentosList = EquipamentosList;
