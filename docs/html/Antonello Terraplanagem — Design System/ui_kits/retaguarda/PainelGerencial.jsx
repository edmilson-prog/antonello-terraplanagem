/* Retaguarda — Painel Gerencial (visão executiva consolidada do ano). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { KpiCard, Card, Button, Pill, IconTile, Icon, Note } = NS;

const PG_MESES = [['jan', 48], ['fev', 52], ['mar', 61], ['abr', 58], ['mai', 74], ['jun', 78], ['jul', 88]];
const PG_TOP = [
  { cli: 'Construtora Vale Verde', os: 18, rec: 'R$ 148.500', m: '39%', dir: 'up' },
  { cli: 'Metalúrgica Boa Vista', os: 9, rec: 'R$ 84.200', m: '37%', dir: 'up' },
  { cli: 'Construtora Sul', os: 8, rec: 'R$ 71.600', m: '33%', dir: 'up' },
  { cli: 'Agro Vale Verde', os: 7, rec: 'R$ 58.900', m: '31%', dir: 'up' },
  { cli: 'Essavado Ltda.', os: 5, rec: 'R$ 46.300', m: '16%', dir: 'down' },
];
const PG_ABC = [
  { k: 'Curva A', m: '4 clientes · 68% da receita', pct: 68 },
  { k: 'Curva B', m: '7 clientes · 22% da receita', pct: 22 },
  { k: 'Curva C', m: '11 clientes · 10% da receita', pct: 10 },
];
const PG_FROTA = [
  { eq: 'Escavadeira CAT 320', ic: 'truck', pct: 81 },
  { eq: 'Retro JCB 3CX', ic: 'tractor', pct: 72 },
  { eq: 'Pá XCMG', ic: 'forklift', pct: 54 },
  { eq: 'Basculante 01', ic: 'truck', pct: 38 },
];

function PainelGerencial() {
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Painel Gerencial</h1>
        <Pill>2025 · acumulado</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
      </div>

      {/* KPIs */}
      <section className="rtg-kpis" style={{ marginTop: 0 }}>
        <KpiCard label="Receita 2025" value="R$ 512.400" mono icon="credit-card"
          trend={{ dir: 'up', value: '14%' }} foot="vs. 2024" spark={[18, 17, 16, 14, 13, 11, 9, 5]} />
        <KpiCard label="Resultado 2025" value="R$ 189.300" mono icon="wallet"
          foot="receita − custo" spark={[17, 16, 15, 13, 12, 10, 8, 6]} />
        <KpiCard label="Margem média" value="37%" icon="trending-up"
          trend={{ dir: 'up', value: '2 p.p.' }} foot="vs. 2024" />
        <KpiCard label="Horas faturadas" value="2.140" unit="h" mono icon="clock"
          foot="47 OS no ano" spark={[19, 18, 17, 15, 13, 11, 9, 6]} />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Resultado por mês" icon="line-chart" headerRight={<Pill>R$ mil</Pill>}>
            <div className="rtg-bars-wrap">
              <div className="rtg-bars">
                {PG_MESES.map(([lbl, h], i) => (
                  <div className="rtg-barcol" key={lbl}>
                    <div className={i === PG_MESES.length - 1 ? 'rtg-bar hi' : 'rtg-bar'} style={{ height: h + '%' }} />
                    <span className="rtg-barlbl">{lbl}</span>
                  </div>
                ))}
              </div>
              <div className="rtg-bars-meta"><span>Média <b>R$ 27.000</b>/mês</span><span>Pico <b>R$ 33.850</b> (jul)</span></div>
            </div>
          </Card>

          <Card title="Top clientes — 2025" icon="users" headerRight={<Pill>22 ativos</Pill>}>
            <div className="rtg-tablewrap">
            <table className="rtg-table">
              <thead>
                <tr><th>Cliente</th><th className="r">OS</th><th className="r">Receita</th><th className="r">Margem</th></tr>
              </thead>
              <tbody>
                {PG_TOP.map((r) => (
                  <tr key={r.cli}>
                    <td>
                      <div className="rtg-eqcell">
                        <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name="building-2" size={15} /></span>
                        <span className="nm">{r.cli}</span>
                      </div>
                    </td>
                    <td className="r rtg-val">{r.os}</td>
                    <td className="r rtg-val">{r.rec}</td>
                    <td className="r">
                      <span className={`atp-trend atp-trend--${r.dir}`} style={{ fontSize: 13 }}>
                        <Icon name="arrow-up-right" size={13} style={r.dir === 'down' ? { transform: 'rotate(90deg)' } : undefined} />
                        {r.m}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>
        </div>

        <div className="rtg-stack">
          <Card title="Curva ABC de clientes" icon="trending-up">
            <div style={{ padding: '10px 18px 16px' }}>
              {PG_ABC.map((c) => (
                <div key={c.k} style={{ padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span style={{ font: '700 13px/1 var(--font-display)', color: 'var(--amarelo)', width: 60 }}>{c.k}</span>
                    <span style={{ flex: 1, fontSize: 12.5, color: 'var(--muted)' }}>{c.m}</span>
                    <span className="rtg-val" style={{ fontSize: 12.5 }}>{c.pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)', marginTop: 8 }}>
                    <div style={{ height: '100%', width: c.pct + '%', borderRadius: 3, background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Utilização da frota" icon="truck" headerRight={<Pill>horas ÷ disponível</Pill>}>
            <div style={{ padding: '10px 18px 16px' }}>
              {PG_FROTA.map((f) => (
                <div key={f.eq} style={{ padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <IconTile icon={f.ic} tone="amber" size="sm" />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{f.eq}</span>
                    <span className="rtg-val" style={{ fontSize: 12.5 }}>{f.pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)', marginTop: 8 }}>
                    <div style={{ height: '100%', width: f.pct + '%', borderRadius: 3, background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Note icon="lock" tone="steel">Visão restrita à gestão — consolida <b>OS</b>, <b>Faturamento</b>, <b>Financeiro</b> e <b>Custo da Hora</b>. Meses fecham junto com a contabilidade.</Note>
        </div>
      </div>
    </>
  );
}
window.PainelGerencial = PainelGerencial;
