/* Retaguarda — Dashboard (company-wide operational overview). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { KpiCard, Card, StatusChip, Pill, IconTile, Icon } = NS;

const DASH_OS = [
  { n: 'OS-021', t: 'Terraplenagem — lote industrial', cli: 'Construtora Vale Verde', h: '62 h', d: 'desde 01/07', tone: 'amber', st: 'Em andamento' },
  { n: 'OS-019', t: 'Abertura de acesso e drenagem', cli: 'Construtora Sul', h: '28 h', d: 'desde 24/06', tone: 'amber', st: 'Em andamento' },
  { n: 'OS-018', t: 'Abertura de acesso e drenagem', cli: 'Essavado Ltda.', h: '40 h', d: 'desde 20/06', tone: 'amber', st: 'Em andamento' },
  { n: 'OS-024', t: 'Nivelamento de pátio', cli: 'Agro Vale Verde', h: '8 h', d: 'desde 05/07', tone: 'info', st: 'Aberta' },
];
const DASH_APONT = [
  { op: 'Adelar Machado', eq: 'Escavadeira CAT 320', eqIcon: 'truck', h0: '4.210', h1: '4.218', hrs: '8,0 h', os: 'OS-021' },
  { op: 'Vilson Prediger', eq: 'Retroescavadeira JCB 3CX', eqIcon: 'tractor', h0: '1.888', h1: '1.895', hrs: '7,0 h', os: 'OS-019' },
  { op: 'Nelson Kunz', eq: 'Pá Carregadeira XCMG', eqIcon: 'forklift', h0: '998', h1: '1.004', hrs: '6,0 h', os: 'OS-024' },
  { op: 'Ivo Scherer', eq: 'Caminhão basculante', eqIcon: 'truck', h0: '2.130', h1: '2.138', hrs: '8,0 h', os: 'OS-018' },
];
const DASH_FROTA = [
  { eq: 'Escavadeira CAT 320', ic: 'truck', tone: 'success', st: 'Em operação' },
  { eq: 'Retroescavadeira JCB 3CX', ic: 'tractor', tone: 'success', st: 'Em operação' },
  { eq: 'Pá Carregadeira XCMG', ic: 'forklift', tone: 'amber', st: 'Em manutenção' },
  { eq: 'Caminhão basculante 02', ic: 'truck', tone: 'neutral', st: 'Parado' },
];
const DASH_VENC = [
  { doc: 'NF 1042', cli: 'Construtora Vale Verde', m: 'vence 20/07', v: 'R$ 12.400', tone: 'amber', led: true, st: 'A vencer' },
  { doc: 'NF 1038', cli: 'Construtora Vale Verde', m: 'vence 12/07', v: 'R$ 8.900', tone: 'amber', led: true, st: 'A vencer' },
  { doc: 'NF 1035', cli: 'Essavado Ltda.', m: 'venceu 05/07', v: 'R$ 11.100', tone: 'danger', icon: 'circle-alert', st: 'Vencido' },
];
const DASH_BARS = [['S1', 58], ['S2', 66], ['S3', 61], ['S4', 74], ['S5', 70], ['S6', 79], ['S7', 68], ['S8', 88]];

function Dashboard({ onNavigate }) {
  const [tab, setTab] = React.useState('geral');
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Dashboard</h1>
        <Pill>julho/2025</Pill>
        <div style={{ flex: 1 }} />
      </div>
      <p className="rtg-pagesub">Visão geral da operação — equipamentos, ordens e faturamento.</p>
      <div className="rtg-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === 'geral'} className={tab === 'geral' ? 'rtg-tab is-active' : 'rtg-tab'} onClick={() => setTab('geral')}>Visão geral</button>
        <button type="button" role="tab" aria-selected={tab === 'op'} className={tab === 'op' ? 'rtg-tab is-active' : 'rtg-tab'} onClick={() => setTab('op')}>Operacional</button>
      </div>
      {tab === 'op' ? <window.DashboardOperacional onNavigate={onNavigate} /> : <>

      {/* KPIs */}
      <section className="rtg-kpis" style={{ marginTop: 0 }}>
        <KpiCard label="Faturamento no mês" value="R$ 86.200" mono icon="credit-card"
          trend={{ dir: 'up', value: '11%' }} foot="vs. junho" spark={[18, 16, 17, 12, 13, 9, 10, 5]} />
        <KpiCard label="Horas apontadas" value="640" unit="h" icon="clock"
          trend={{ dir: 'up', value: '6%' }} foot="vs. junho" spark={[19, 17, 18, 13, 14, 9, 11, 6]} />
        <KpiCard label="OS em andamento" value="7" icon="clipboard-list"
          foot="3 abrem esta semana" spark={[14, 15, 11, 12, 9, 11, 8, 9]} />
        <KpiCard label="Saldo a receber" value="R$ 61.900" mono warn icon="hand-coins"
          foot={<>5 títulos · <b style={{ color: 'var(--danger-fg)', fontWeight: 600 }}>2 vencidos</b></>} />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="OS em andamento" icon="clipboard-list"
            headerRight={<span className="rtg-link" onClick={() => onNavigate && onNavigate('os')}>Ver todas <Icon name="chevron-right" size={14} /></span>}>
            <div className="rtg-oslist">
              {DASH_OS.map((s) => (
                <div className="rtg-osrow" key={s.n}>
                  <span className="rtg-osnum">{s.n}</span>
                  <div className="rtg-osbody">
                    <div className="t">{s.t}</div>
                    <div className="m">
                      <span><Icon name="user" size={12} /> {s.cli}</span>
                      <span><Icon name="clock" size={12} /> {s.h}</span>
                      <span><Icon name="calendar" size={12} /> {s.d}</span>
                    </div>
                  </div>
                  <div className="rtg-osend"><StatusChip tone={s.tone} led>{s.st}</StatusChip></div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Apontamentos de hoje" icon="gauge"
            headerRight={<span className="rtg-link" onClick={() => onNavigate && onNavigate('operadores')}>Ver todos <Icon name="chevron-right" size={14} /></span>}>
            <table className="rtg-table">
              <thead>
                <tr><th>Operador</th><th>Equipamento</th><th>Horímetro</th><th className="r">Horas</th><th className="r">OS</th></tr>
              </thead>
              <tbody>
                {DASH_APONT.map((a, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{a.op}</td>
                    <td>
                      <div className="rtg-eqcell">
                        <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={a.eqIcon} size={15} /></span>
                        <span className="nm">{a.eq}</span>
                      </div>
                    </td>
                    <td><span className="rtg-horim"><b>{a.h0}</b> → <b>{a.h1}</b></span></td>
                    <td className="r" style={{ fontWeight: 600 }}>{a.hrs}</td>
                    <td className="r"><span className="rtg-ostag">{a.os}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="rtg-stack">
          <Card title="Frota" icon="truck" headerRight={<Pill>14 equipamentos</Pill>}>
            <div className="rtg-clist">
              {DASH_FROTA.map((f) => (
                <div className="rtg-crow" key={f.eq}>
                  <IconTile icon={f.ic} tone="amber" size="md" />
                  <div className="cb"><div className="ct">{f.eq}</div></div>
                  <StatusChip tone={f.tone} led={f.tone !== 'neutral'}>{f.st}</StatusChip>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Vencimentos próximos" icon="wallet" headerRight={<Pill>R$ 32.400</Pill>}>
            <div className="rtg-clist">
              {DASH_VENC.map((v) => (
                <div className="rtg-crow" key={v.doc}>
                  <IconTile icon="file-check" tone="amber" size="md" />
                  <div className="cb"><div className="ct">{v.doc} — {v.cli}</div><div className="cm">{v.m}</div></div>
                  <div className="cv">{v.v}<StatusChip tone={v.tone} led={v.led} icon={v.icon} style={{ padding: '2px 7px' }}>{v.st}</StatusChip></div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Horas por semana" icon="bar-chart">
            <div className="rtg-bars-wrap">
              <div className="rtg-bars">
                {DASH_BARS.map(([lbl, h], i) => (
                  <div className="rtg-barcol" key={lbl}>
                    <div className={i === DASH_BARS.length - 1 ? 'rtg-bar hi' : 'rtg-bar'} style={{ height: h + '%' }} />
                    <span className="rtg-barlbl">{lbl}</span>
                  </div>
                ))}
              </div>
              <div className="rtg-bars-meta"><span>Média <b>158 h</b>/semana</span><span>Pico <b>176 h</b> (S8)</span></div>
            </div>
          </Card>
        </div>
      </div>
      </>}
    </>
  );
}
window.Dashboard = Dashboard;
