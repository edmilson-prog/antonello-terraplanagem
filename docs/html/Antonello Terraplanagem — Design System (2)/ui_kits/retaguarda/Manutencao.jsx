/* Retaguarda — Manutenção (ordens de manutenção + planos por horímetro). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { KpiCard, Card, StatusChip, Badge, Button, Pill, IconTile, Icon, Note } = NS;

const MNT_ORDENS = [
  { data: '08/07', eq: 'Pá Carregadeira XCMG', ic: 'forklift', tipo: 'Corretiva', t: 'Vazamento no comando hidráulico', custo: 'R$ 3.400', st: 'Em andamento', tone: 'amber' },
  { data: '07/07', eq: 'Escavadeira Volvo EC140', ic: 'truck', tipo: 'Preventiva', t: 'Plano 7.500 h — filtros e óleos', custo: 'R$ 2.750', st: 'Em andamento', tone: 'amber' },
  { data: '15/07', eq: 'Retroescavadeira JCB 3CX', ic: 'tractor', tipo: 'Preventiva', t: 'Plano 2.000 h — revisão geral', custo: '—', st: 'Agendada', tone: 'info' },
  { data: '02/07', eq: 'Escavadeira CAT 320', ic: 'truck', tipo: 'Preventiva', t: 'Plano 4.200 h — filtros e graxa', custo: 'R$ 1.850', st: 'Concluída', tone: 'success' },
  { data: '26/06', eq: 'Caminhão basculante 01', ic: 'truck', tipo: 'Corretiva', t: 'Troca de embreagem', custo: 'R$ 3.850', st: 'Concluída', tone: 'success' },
];
const MNT_PLANOS = [
  { eq: 'Pá Carregadeira XCMG', ic: 'forklift', m: 'plano 1.000 h', v: 'vencida', late: true },
  { eq: 'Escavadeira Volvo EC140', ic: 'truck', m: 'plano 7.500 h', v: 'em 12 h', late: false },
  { eq: 'Escavadeira CAT 320', ic: 'truck', m: 'plano 4.300 h', v: 'em 82 h', late: false },
  { eq: 'Retroescavadeira JCB 3CX', ic: 'tractor', m: 'plano 2.000 h', v: 'em 105 h', late: false },
  { eq: 'Rolo compactador CA25', ic: 'tractor', m: 'plano 3.000 h', v: 'em 130 h', late: false },
];

function Manutencao({ onNew }) {
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Manutenção</h1>
        <Pill>julho/2025</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="wrench" onClick={onNew}>Nova manutenção</Button>
      </div>

      {/* KPIs */}
      <section className="rtg-kpis" style={{ marginTop: 0 }}>
        <KpiCard label="Manutenções no mês" value="6" icon="wrench"
          foot="4 preventivas · 2 corretivas" spark={[12, 13, 11, 14, 12, 13, 12, 14]} />
        <KpiCard label="Custo de manutenção" value="R$ 11.850" mono warn icon="calculator"
          foot={<>vs. junho <b style={{ color: 'var(--down)', fontWeight: 600 }}>+14%</b></>} />
        <KpiCard label="Em manutenção" value="2" icon="truck"
          foot="XCMG · Volvo EC140" />
        <KpiCard label="Planos a vencer" value="2" icon="gauge"
          foot={<>próximas 50 h · <b style={{ color: 'var(--danger-fg)', fontWeight: 600 }}>1 vencido</b></>} />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Ordens de manutenção" icon="wrench" headerRight={<Pill>6 no mês</Pill>}>
            <div className="rtg-tablewrap rtg-tablewrap--wide">
            <table className="rtg-table">
              <thead>
                <tr><th>Data</th><th>Equipamento</th><th>Tipo</th><th>Descrição</th><th className="r">Custo</th><th className="r">Situação</th></tr>
              </thead>
              <tbody>
                {MNT_ORDENS.map((r, i) => (
                  <tr key={i}>
                    <td className="mono">{r.data}</td>
                    <td>
                      <div className="rtg-eqcell">
                        <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={r.ic} size={15} /></span>
                        <span className="nm">{r.eq}</span>
                      </div>
                    </td>
                    <td><Badge tone={r.tipo === 'Corretiva' ? 'gold' : 'neutral'}>{r.tipo}</Badge></td>
                    <td>{r.t}</td>
                    <td className="r rtg-val">{r.custo}</td>
                    <td className="r"><StatusChip tone={r.tone} led>{r.st}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>

          <Note icon="info">Manutenções alimentam o <b>Custo da Hora</b> do equipamento; o alerta antecipado de <b>50 h</b> é definido em <b>Parâmetros</b>.</Note>
        </div>

        <div className="rtg-stack">
          <Card title="Planos por horímetro" icon="gauge" headerRight={<Pill>5 planos</Pill>}>
            <div className="rtg-clist">
              {MNT_PLANOS.map((p) => (
                <div className="rtg-crow" key={p.eq}>
                  <IconTile icon={p.ic} tone="amber" size="md" />
                  <div className="cb"><div className="ct">{p.eq}</div><div className="cm">{p.m}</div></div>
                  {p.late
                    ? <StatusChip tone="danger" icon="circle-alert">Vencida</StatusChip>
                    : <span className="rtg-val" style={{ fontSize: 12.5 }}>{p.v}</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
window.Manutencao = Manutencao;
