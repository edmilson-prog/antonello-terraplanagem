/* Retaguarda — Custo da Hora (custo horário por equipamento; clique numa linha
   para ver a composição). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { KpiCard, Card, Button, Pill, IconTile, Icon, Note, StatusChip } = NS;

const CH_ROWS = [
  { id: 'cat', eq: 'Escavadeira CAT 320', ic: 'truck', horas: '148 h', custo: 'R$ 232', preco: 'R$ 400', margem: '42%', dir: 'up',
    comp: [['fuel', 'Diesel', 'R$ 98/h', 42], ['wrench', 'Manutenção', 'R$ 41/h', 18], ['hard-hat', 'Operador', 'R$ 62/h', 27], ['history', 'Depreciação', 'R$ 31/h', 13]] },
  { id: 'jcb', eq: 'Retroescavadeira JCB 3CX', ic: 'tractor', horas: '96 h', custo: 'R$ 178', preco: 'R$ 320', margem: '44%', dir: 'up',
    comp: [['fuel', 'Diesel', 'R$ 72/h', 40], ['wrench', 'Manutenção', 'R$ 30/h', 17], ['hard-hat', 'Operador', 'R$ 55/h', 31], ['history', 'Depreciação', 'R$ 21/h', 12]] },
  { id: 'xcmg', eq: 'Pá Carregadeira XCMG', ic: 'forklift', horas: '74 h', custo: 'R$ 195', preco: 'R$ 300', margem: '35%', dir: 'up',
    comp: [['fuel', 'Diesel', 'R$ 84/h', 43], ['wrench', 'Manutenção', 'R$ 38/h', 20], ['hard-hat', 'Operador', 'R$ 52/h', 27], ['history', 'Depreciação', 'R$ 21/h', 10]] },
  { id: 'basc', eq: 'Caminhão basculante 01', ic: 'truck', horas: '58 h', custo: 'R$ 174', preco: 'R$ 220', margem: '21%', dir: 'down',
    comp: [['fuel', 'Diesel', 'R$ 81/h', 47], ['wrench', 'Manutenção', 'R$ 44/h', 25], ['hard-hat', 'Operador', 'R$ 35/h', 20], ['history', 'Depreciação', 'R$ 14/h', 8]] },
];

function CustoHora() {
  const [sel, setSel] = React.useState(CH_ROWS[0]);
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Custo da Hora</h1>
        <Pill>julho/2025</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="calculator">Recalcular custos</Button>
      </div>

      {/* KPIs */}
      <section className="rtg-kpis" style={{ marginTop: 0 }}>
        <KpiCard label="Custo médio da hora" value="R$ 198" mono icon="calculator"
          foot="ponderado pelas horas" spark={[15, 16, 14, 15, 13, 14, 12, 13]} />
        <KpiCard label="Horas faturadas" value="376" unit="h" icon="clock"
          trend={{ dir: 'up', value: '6%' }} foot="vs. junho" spark={[19, 17, 18, 13, 14, 9, 11, 6]} />
        <KpiCard label="Diesel no mês" value="R$ 28.400" mono warn icon="fuel"
          foot="9.400 L consumidos" />
        <KpiCard label="Margem média" value="38%" icon="trending-up"
          trend={{ dir: 'up', value: '3 p.p.' }} foot="vs. junho" spark={[14, 13, 14, 12, 11, 10, 9, 7]} />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Custo por equipamento" icon="calculator" headerRight={<Pill>{CH_ROWS.length} equipamentos</Pill>}>
            <div className="rtg-tablewrap">
            <table className="rtg-table rtg-clickable">
              <thead>
                <tr><th>Equipamento</th><th className="r">Horas (mês)</th><th className="r">Custo/h</th><th className="r">Preço/h</th><th className="r">Margem</th></tr>
              </thead>
              <tbody>
                {CH_ROWS.map((r) => (
                  <tr key={r.id} className={sel.id === r.id ? 'is-selected' : ''} onClick={() => setSel(r)}>
                    <td>
                      <div className="rtg-eqcell">
                        <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={r.ic} size={15} /></span>
                        <span className="nm">{r.eq}</span>
                      </div>
                    </td>
                    <td className="r rtg-val">{r.horas}</td>
                    <td className="r rtg-val">{r.custo}</td>
                    <td className="r rtg-val">{r.preco}</td>
                    <td className="r">
                      <span className={`atp-trend atp-trend--${r.dir}`} style={{ fontSize: 13 }}>
                        <Icon name="arrow-up-right" size={13} style={r.dir === 'down' ? { transform: 'rotate(90deg)' } : undefined} />
                        {r.margem}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>

          <Note icon="info">O custo da hora soma <b>diesel</b>, <b>manutenção</b>, <b>operador</b> e <b>depreciação</b> por horímetro. Valores ficam restritos a este módulo, <b>Financeiro</b> e <b>Rentabilidade</b>, conforme o particionamento de acesso.</Note>
        </div>

        <div className="rtg-stack">
          <Card title={`Composição — ${sel.eq}`} icon={sel.ic} headerRight={<Pill>{sel.custo}/h</Pill>}>
            <div className="rtg-clist" style={{ padding: '10px 18px 16px' }}>
              {sel.comp.map(([ic, t, v, pct]) => (
                <div key={t} style={{ padding: '10px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <IconTile icon={ic} tone="amber" size="sm" />
                    <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600 }}>{t}</span>
                    <span className="rtg-val" style={{ fontSize: 12.5 }}>{v}</span>
                    <span style={{ font: '600 11px/1 var(--font-mono)', color: 'var(--muted-2)', width: 34, textAlign: 'right' }}>{pct}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--surface-2)', marginTop: 8 }}>
                    <div style={{ height: '100%', width: pct + '%', borderRadius: 3, background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Preço de tabela" icon="tag" padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ font: '600 10px/1 var(--font-display)', letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted-2)' }}>{sel.eq}</div>
                <div style={{ font: '600 23px/1 var(--font-mono)', marginTop: 8 }}>{sel.preco}<span style={{ fontSize: 13, color: 'var(--muted)' }}>/h</span></div>
              </div>
              {sel.dir === 'up'
                ? <StatusChip tone="success" led>Margem saudável</StatusChip>
                : <StatusChip tone="danger" icon="circle-alert">Margem apertada</StatusChip>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
window.CustoHora = CustoHora;
