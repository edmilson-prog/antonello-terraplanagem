/* Retaguarda — Diesel (abastecimentos, consumo por equipamento, tanque interno). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { KpiCard, Card, Button, Pill, IconTile, Icon, Note } = NS;

const DSL_ABAST = [
  { data: '09/07', eq: 'Escavadeira CAT 320', ic: 'truck', orig: 'Tanque interno', hor: '4.218', l: '110 L', rl: 'R$ 5,84', v: 'R$ 642' },
  { data: '08/07', eq: 'Caminhão basculante 01', ic: 'truck', orig: 'Posto Missões', hor: '2.138', l: '180 L', rl: 'R$ 6,04', v: 'R$ 1.087' },
  { data: '07/07', eq: 'Retroescavadeira JCB 3CX', ic: 'tractor', orig: 'Tanque interno', hor: '1.895', l: '85 L', rl: 'R$ 5,84', v: 'R$ 496' },
  { data: '05/07', eq: 'Pá Carregadeira XCMG', ic: 'forklift', orig: 'Tanque interno', hor: '1.004', l: '95 L', rl: 'R$ 5,84', v: 'R$ 555' },
  { data: '04/07', eq: 'Escavadeira CAT 320', ic: 'truck', orig: 'Posto Missões', hor: '4.203', l: '120 L', rl: 'R$ 6,04', v: 'R$ 725' },
  { data: '03/07', eq: 'Rolo compactador CA25', ic: 'tractor', orig: 'Tanque interno', hor: '2.880', l: '60 L', rl: 'R$ 5,84', v: 'R$ 350' },
];
const DSL_CONSUMO = [
  { eq: 'Basculante 01', ic: 'truck', v: '18,4 L/h', pct: 100 },
  { eq: 'CAT 320', ic: 'truck', v: '14,2 L/h', pct: 77 },
  { eq: 'Pá XCMG', ic: 'forklift', v: '11,5 L/h', pct: 63 },
  { eq: 'Retro JCB 3CX', ic: 'tractor', v: '9,8 L/h', pct: 53 },
  { eq: 'Rolo CA25', ic: 'tractor', v: '8,6 L/h', pct: 47 },
];

function Diesel({ onNew }) {
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Diesel</h1>
        <Pill>julho/2025</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="fuel" onClick={onNew}>Novo abastecimento</Button>
      </div>

      {/* KPIs */}
      <section className="rtg-kpis" style={{ marginTop: 0 }}>
        <KpiCard label="Diesel no mês" value="R$ 28.400" mono warn icon="fuel"
          foot={<>vs. junho <b style={{ color: 'var(--down)', fontWeight: 600 }}>+9%</b></>} />
        <KpiCard label="Litros no mês" value="9.400" unit="L" mono icon="gauge"
          foot="42 abastecimentos" spark={[14, 15, 13, 16, 14, 17, 15, 18]} />
        <KpiCard label="Preço médio do litro" value="R$ 5,92" mono icon="dollar-sign"
          foot="tanque R$ 5,84 · posto R$ 6,04" />
        <KpiCard label="Consumo médio" value="13,8" unit="L/h" mono icon="truck"
          foot="frota em operação" spark={[15, 14, 15, 13, 14, 13, 14, 12]} />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Abastecimentos" icon="fuel" headerRight={<Pill>42 no mês</Pill>}>
            <div className="rtg-tablewrap rtg-tablewrap--wide">
            <table className="rtg-table">
              <thead>
                <tr><th>Data</th><th>Equipamento</th><th>Origem</th><th className="r">Horímetro</th><th className="r">Litros</th><th className="r">R$/L</th><th className="r">Valor</th></tr>
              </thead>
              <tbody>
                {DSL_ABAST.map((a, i) => (
                  <tr key={i}>
                    <td className="mono">{a.data}</td>
                    <td>
                      <div className="rtg-eqcell">
                        <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={a.ic} size={15} /></span>
                        <span className="nm">{a.eq}</span>
                      </div>
                    </td>
                    <td>{a.orig}</td>
                    <td className="r rtg-val">{a.hor}</td>
                    <td className="r rtg-val">{a.l}</td>
                    <td className="r rtg-val">{a.rl}</td>
                    <td className="r rtg-val">{a.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>

          <Note icon="info">Cada abastecimento entra no cálculo do <b>Custo da Hora</b> pelo horímetro do equipamento. Compras de diesel aparecem em <b>Financeiro › Contas a pagar</b>.</Note>
        </div>

        <div className="rtg-stack">
          <Card title="Consumo por equipamento" icon="gauge" headerRight={<Pill>L/h no mês</Pill>}>
            <div style={{ padding: '10px 18px 16px' }}>
              {DSL_CONSUMO.map((c) => (
                <div key={c.eq} style={{ padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <IconTile icon={c.ic} tone="amber" size="sm" />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{c.eq}</span>
                    <span className="rtg-val" style={{ fontSize: 12.5 }}>{c.v}</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)', marginTop: 8 }}>
                    <div style={{ height: '100%', width: c.pct + '%', borderRadius: 3, background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Tanque interno" icon="database" padded>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ font: '600 23px/1 var(--font-mono)' }}>1.230 L</span>
              <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>de 2.000 L · 62%</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--surface-2)', margin: '12px 0 10px' }}>
              <div style={{ height: '100%', width: '62%', borderRadius: 4, background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))' }}></div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted-2)' }}>Última compra <b style={{ color: 'var(--fg)', fontFamily: 'var(--font-mono)' }}>02/07</b> · 4.000 L · Posto Missões</div>
          </Card>
        </div>
      </div>
    </>
  );
}
window.Diesel = Diesel;
