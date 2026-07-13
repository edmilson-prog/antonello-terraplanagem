/* Retaguarda — Rentabilidade (resultado por OS e por cliente). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { KpiCard, Card, StatusChip, Pill, IconTile, Icon, Note, Button } = NS;

const RENT_OS = [
  { n: 'OS-012', cli: 'Construtora Vale Verde', rec: 'R$ 41.000', cus: 'R$ 24.100', res: 'R$ 16.900', m: '41%', dir: 'up', st: 'Concluída', tone: 'success' },
  { n: 'OS-015', cli: 'Metalúrgica Boa Vista', rec: 'R$ 19.800', cus: 'R$ 12.400', res: 'R$ 7.400', m: '37%', dir: 'up', st: 'Concluída', tone: 'success' },
  { n: 'OS-021', cli: 'Construtora Vale Verde', rec: 'R$ 24.800', cus: 'R$ 15.900', res: 'R$ 8.900', m: '36%', dir: 'up', st: 'Em andamento', tone: 'amber' },
  { n: 'OS-007', cli: 'Construtora Vale Verde', rec: 'R$ 12.500', cus: 'R$ 8.100', res: 'R$ 4.400', m: '35%', dir: 'up', st: 'Concluída', tone: 'success' },
  { n: 'OS-016', cli: 'Essavado Ltda.', rec: 'R$ 11.100', cus: 'R$ 9.300', res: 'R$ 1.800', m: '16%', dir: 'down', st: 'Concluída', tone: 'success' },
];
const RENT_CLI = [
  { cli: 'Construtora Vale Verde', v: '39%', pct: 89 },
  { cli: 'Metalúrgica Boa Vista', v: '37%', pct: 84 },
  { cli: 'Construtora Sul', v: '33%', pct: 75 },
  { cli: 'Agro Vale Verde', v: '31%', pct: 70 },
  { cli: 'Essavado Ltda.', v: '16%', pct: 36 },
];

function Rentabilidade() {
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Rentabilidade</h1>
        <Pill>julho/2025</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
      </div>

      {/* KPIs */}
      <section className="rtg-kpis" style={{ marginTop: 0 }}>
        <KpiCard label="Margem média" value="38%" icon="trending-up"
          trend={{ dir: 'up', value: '3 p.p.' }} foot="vs. junho" spark={[14, 13, 14, 12, 11, 10, 9, 7]} />
        <KpiCard label="Resultado no mês" value="R$ 33.850" mono icon="wallet"
          foot="receita − custo" spark={[16, 15, 14, 12, 11, 9, 8, 6]} />
        <KpiCard label="Receita" value="R$ 86.200" mono icon="credit-card"
          trend={{ dir: 'up', value: '11%' }} foot="vs. junho" />
        <KpiCard label="Custo total" value="R$ 52.350" mono warn icon="calculator"
          foot="diesel + manutenção + folha" />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Rentabilidade por OS" icon="trending-up" headerRight={<Pill>5 no período</Pill>}>
            <div className="rtg-tablewrap rtg-tablewrap--wide">
            <table className="rtg-table">
              <thead>
                <tr><th>OS</th><th>Cliente</th><th className="r">Receita</th><th className="r">Custo</th><th className="r">Resultado</th><th className="r">Margem</th><th className="r">Situação</th></tr>
              </thead>
              <tbody>
                {RENT_OS.map((r) => (
                  <tr key={r.n}>
                    <td><span className="rtg-ostag">{r.n}</span></td>
                    <td>{r.cli}</td>
                    <td className="r rtg-val">{r.rec}</td>
                    <td className="r rtg-val">{r.cus}</td>
                    <td className="r rtg-val">{r.res}</td>
                    <td className="r">
                      <span className={`atp-trend atp-trend--${r.dir}`} style={{ fontSize: 13 }}>
                        <Icon name="arrow-up-right" size={13} style={r.dir === 'down' ? { transform: 'rotate(90deg)' } : undefined} />
                        {r.m}
                      </span>
                    </td>
                    <td className="r"><StatusChip tone={r.tone} led>{r.st}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>

          <Note icon="lock" tone="steel">Valores visíveis apenas para perfis com acesso ao <b>particionamento financeiro</b> — operadores não veem custos nem margens.</Note>
        </div>

        <div className="rtg-stack">
          <Card title="Margem por cliente" icon="users" headerRight={<Pill>período: 2025</Pill>}>
            <div style={{ padding: '10px 18px 16px' }}>
              {RENT_CLI.map((c) => (
                <div key={c.cli} style={{ padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <IconTile icon="building-2" tone="amber" size="sm" />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{c.cli}</span>
                    <span className="rtg-val" style={{ fontSize: 12.5 }}>{c.v}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)', marginTop: 8 }}>
                    <div style={{ height: '100%', width: c.pct + '%', borderRadius: 3, background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
window.Rentabilidade = Rentabilidade;
