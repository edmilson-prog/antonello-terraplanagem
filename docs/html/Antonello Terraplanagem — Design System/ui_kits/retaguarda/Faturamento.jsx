/* Retaguarda — Faturamento (NFs emitidas, OS a faturar, evolução mensal). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { KpiCard, Card, StatusChip, Button, Pill, Icon } = NS;

const FAT_NFS = [
  { nf: 'NF 1042', cli: 'Construtora Vale Verde', os: 'OS-021', em: '05/07', v: 'R$ 12.400', tone: 'amber', led: true, st: 'A vencer' },
  { nf: 'NF 1041', cli: 'Agro Vale Verde', os: 'OS-024', em: '03/07', v: 'R$ 9.600', tone: 'amber', led: true, st: 'A vencer' },
  { nf: 'NF 1038', cli: 'Construtora Vale Verde', os: 'OS-018', em: '28/06', v: 'R$ 8.900', tone: 'amber', led: true, st: 'A vencer' },
  { nf: 'NF 1035', cli: 'Essavado Ltda.', os: 'OS-016', em: '20/06', v: 'R$ 11.100', tone: 'danger', icon: 'circle-alert', st: 'Vencida' },
  { nf: 'NF 1029', cli: 'Construtora Vale Verde', os: 'OS-012', em: '05/06', v: 'R$ 9.500', tone: 'success', icon: 'check', st: 'Paga' },
  { nf: 'NF 1021', cli: 'Construtora Vale Verde', os: 'OS-007', em: '20/05', v: 'R$ 15.200', tone: 'success', icon: 'check', st: 'Paga' },
];
const FAT_PENDENTES = [
  { os: 'OS-015', t: 'Fundação de galpão — estacas', cli: 'Metalúrgica Boa Vista', v: 'R$ 19.800' },
  { os: 'OS-011', t: 'Limpeza de terreno', cli: 'Construtora Sul', v: 'R$ 6.400' },
];
const FAT_MESES = [['fev', 52], ['mar', 61], ['abr', 58], ['mai', 74], ['jun', 78], ['jul', 88]];

function Faturamento({ onNew }) {
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Faturamento</h1>
        <Pill>julho/2025</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="file-check" onClick={onNew}>Emitir NF</Button>
      </div>

      {/* KPIs */}
      <section className="rtg-kpis" style={{ marginTop: 0 }}>
        <KpiCard label="Faturado no mês" value="R$ 86.200" mono icon="credit-card"
          trend={{ dir: 'up', value: '11%' }} foot="vs. junho" spark={[18, 16, 17, 12, 13, 9, 10, 5]} />
        <KpiCard label="NFs emitidas" value="12" icon="file-check"
          foot="no mês" spark={[15, 14, 15, 12, 13, 10, 11, 8]} />
        <KpiCard label="A faturar" value="R$ 26.200" mono warn icon="clipboard-list"
          foot="2 OS concluídas sem NF" />
        <KpiCard label="Ticket médio" value="R$ 7.183" mono icon="dollar-sign"
          foot="por NF no mês" />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Notas fiscais emitidas" icon="file-check" headerRight={<Pill>12 no mês</Pill>}>
            <div className="rtg-tablewrap">
            <table className="rtg-table">
              <thead>
                <tr><th>NF</th><th>Cliente</th><th>OS</th><th>Emissão</th><th className="r">Valor</th><th className="r">Situação</th></tr>
              </thead>
              <tbody>
                {FAT_NFS.map((n) => (
                  <tr key={n.nf}>
                    <td><span className="rtg-doc">{n.nf}</span></td>
                    <td>{n.cli}</td>
                    <td><span className="rtg-ostag">{n.os}</span></td>
                    <td className="mono">{n.em}</td>
                    <td className="r rtg-val">{n.v}</td>
                    <td className="r"><StatusChip tone={n.tone} led={n.led} icon={n.icon}>{n.st}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>
        </div>

        <div className="rtg-stack">
          <Card title="A faturar" icon="clipboard-list" headerRight={<Pill>R$ 26.200</Pill>}>
            <div className="rtg-clist">
              {FAT_PENDENTES.map((p) => (
                <div className="rtg-crow" key={p.os}>
                  <span className="rtg-ostag">{p.os}</span>
                  <div className="cb"><div className="ct">{p.t}</div><div className="cm">{p.cli}</div></div>
                  <div className="cv">{p.v}</div>
                  <Button size="sm" variant="ghost" icon="file-check">Emitir</Button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Faturamento por mês" icon="bar-chart">
            <div className="rtg-bars-wrap">
              <div className="rtg-bars">
                {FAT_MESES.map(([lbl, h], i) => (
                  <div className="rtg-barcol" key={lbl}>
                    <div className={i === FAT_MESES.length - 1 ? 'rtg-bar hi' : 'rtg-bar'} style={{ height: h + '%' }} />
                    <span className="rtg-barlbl">{lbl}</span>
                  </div>
                ))}
              </div>
              <div className="rtg-bars-meta"><span>Média <b>R$ 71.400</b>/mês</span><span>Pico <b>R$ 86.200</b> (jul)</span></div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
window.Faturamento = Faturamento;
