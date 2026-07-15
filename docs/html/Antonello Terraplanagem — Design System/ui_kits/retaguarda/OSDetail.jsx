/* Retaguarda — Ordem de Serviço detail (hero, KPIs, apontamentos, medições, vínculos). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Badge, Button, KpiCard, Card, StatusChip, DataRow, Pill, IconTile, Note, Icon } = NS;

/* Apontamentos por OS (exemplos coerentes com a lista + app de campo). */
const OS_APONT = {
  'OS-021': [
    { data: '09/07', op: 'Adelar Machado', eq: 'Escavadeira CAT 320', eqIc: 'truck', hm: '4.210 → 4.218', h: '8,0 h' },
    { data: '08/07', op: 'Adelar Machado', eq: 'Escavadeira CAT 320', eqIc: 'truck', hm: '4.203 → 4.210', h: '7,5 h' },
    { data: '05/07', op: 'Adelar Machado', eq: 'Escavadeira CAT 320', eqIc: 'truck', hm: '4.195 → 4.203', h: '8,0 h' },
    { data: '04/07', op: 'Vilson Prediger', eq: 'Escavadeira CAT 320', eqIc: 'truck', hm: '4.187 → 4.195', h: '8,0 h' },
    { data: '03/07', op: 'Adelar Machado', eq: 'Escavadeira CAT 320', eqIc: 'truck', hm: '4.180 → 4.187', h: '7,0 h' },
  ],
};
const OS_APONT_FALLBACK = [
  { data: '09/07', op: 'Adelar Machado', eq: 'Escavadeira CAT 320', eqIc: 'truck', hm: '4.210 → 4.218', h: '8,0 h' },
  { data: '08/07', op: 'Nelson Kunz', eq: 'Escavadeira CAT 320', eqIc: 'truck', hm: '4.203 → 4.210', h: '7,5 h' },
  { data: '05/07', op: 'Vilson Prediger', eq: 'Retroescavadeira JCB 3CX', eqIc: 'tractor', hm: '1.882 → 1.888', h: '6,0 h' },
];
const OS_MED = [
  { n: 'Medição #2', per: '01/07 – 11/07', h: '38,5 h', v: 'R$ 15.400', tone: 'amber', led: true, st: 'Em aberto' },
  { n: 'Medição #1', per: '15/06 – 30/06', h: '23,5 h', v: 'R$ 9.400', tone: 'success', icon: 'check', st: 'Faturada' },
];

function OSDetail({ os, onBack }) {
  const o = os || {};
  const apont = OS_APONT[o.n] || OS_APONT_FALLBACK;
  const isAberta = o.st === 'Aberta';
  const isConcluida = o.st === 'Concluída';
  const heroTone = o.tone || 'info';

  return (
    <>
      <button className="rtg-back" onClick={onBack}><Icon name="arrow-left" size={16} /> Ordens de Serviço</button>

      {/* HERO */}
      <section className="rtg-hero">
        <IconTile icon="clipboard-list" size="lg" tone="brand" style={{ width: 78, height: 78, borderRadius: 18 }} />
        <div className="rtg-hero-main">
          <div style={{ font: '700 13px/1 var(--font-mono)', color: 'var(--amarelo)', letterSpacing: '.02em' }}>{o.n}</div>
          <h1 style={{ marginTop: 8 }}>{o.t}</h1>
          <div className="rtg-hero-sub">
            <StatusChip tone={heroTone} led>{o.st}</StatusChip>
            <Badge tone="neutral" icon={o.eqIcon || 'truck'}>{o.eq}</Badge>
            <Badge tone="info" icon="building-2">{o.cli}</Badge>
          </div>
          <div className="rtg-qf">
            <div className="qf"><span className="k">Operador</span><span className="v">{o.op}</span></div>
            <div className="qf"><span className="k">Período</span><span className="v mono">{o.per}</span></div>
            <div className="qf"><span className="k">Local</span><span className="v">Distrito Industrial · Santo Ângelo/RS</span></div>
            <div className="qf"><span className="k">Orçamento</span><span className="v mono">ORC-055</span></div>
          </div>
        </div>
        <div className="rtg-hero-actions">
          <Button variant="ghost" icon="pencil">Editar</Button>
          <Button variant="ghost" icon="file-text">Diário</Button>
          {isConcluida
            ? <Button variant="primary" icon="file-check">Faturar</Button>
            : <Button variant="primary" icon="check">Concluir OS</Button>}
        </div>
      </section>

      {/* KPIs */}
      <section className="rtg-kpis">
        <KpiCard label="Horas apontadas" value={o.h || '62 h'} icon="clock"
          foot={`${apont.length} apontamentos`} spark={[10, 12, 11, 13, 12, 14, 13, 15]} />
        <KpiCard label="Valor previsto" value={o.v || 'R$ 24.800'} mono icon="credit-card"
          foot="conforme orçamento" />
        <KpiCard label="Faturado" value={isConcluida ? (o.v || 'R$ 24.800') : 'R$ 9.400'} mono icon="file-check"
          foot={isConcluida ? 'OS concluída' : '1 de 2 medições'} />
        <KpiCard label="Margem estimada" value="36%" icon="trending-up"
          trend={{ dir: 'up', value: '2 p.p.' }} foot="vs. média do serviço" />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Apontamentos" icon="gauge" headerRight={<Pill>{apont.length} lançamentos</Pill>}>
            <div className="rtg-tablewrap rtg-tablewrap--wide">
              <table className="rtg-table">
                <thead>
                  <tr><th>Data</th><th>Operador</th><th>Equipamento</th><th>Horímetro</th><th className="r">Horas</th></tr>
                </thead>
                <tbody>
                  {apont.map((a, i) => (
                    <tr key={i}>
                      <td className="mono">{a.data}</td>
                      <td>{a.op}</td>
                      <td>
                        <div className="rtg-eqcell">
                          <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={a.eqIc} size={15} /></span>
                          <span className="nm">{a.eq}</span>
                        </div>
                      </td>
                      <td><span className="rtg-horim">{a.hm}</span></td>
                      <td className="r" style={{ fontWeight: 600 }}>{a.h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Medições" icon="file-check" headerRight={<Pill>2 no período</Pill>}>
            <div className="rtg-clist">
              {OS_MED.map((m) => (
                <div className="rtg-crow" key={m.n}>
                  <IconTile icon="receipt" tone="amber" size="md" />
                  <div className="cb"><div className="ct">{m.n} · {m.h}</div><div className="cm">{m.per}</div></div>
                  <div className="cv">{m.v}<StatusChip tone={m.tone} led={m.led} icon={m.icon} style={{ padding: '2px 7px' }}>{m.st}</StatusChip></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="rtg-stack">
          <Card title="Dados da OS" icon="clipboard-list" padded>
            <DataRow icon="building-2" label="Cliente">{o.cli}</DataRow>
            <DataRow icon="hard-hat" label="Operador">{o.op}</DataRow>
            <DataRow icon={o.eqIcon || 'truck'} label="Equipamento">{o.eq}</DataRow>
            <DataRow icon="map-pin" label="Local">Distrito Industrial — Santo Ângelo/RS</DataRow>
            <DataRow icon="calendar" label="Período"><span className="mono">{o.per}</span></DataRow>
            <DataRow icon="file-text" label="Orçamento"><span className="mono">ORC-055</span> · <small>aprovado 30/06</small></DataRow>
          </Card>

          <Card title="Histórico" icon="history">
            <div className="rtg-clist">
              <div className="rtg-crow" style={{ cursor: 'default' }}>
                <IconTile icon="file-check" tone="muted" size="md" />
                <div className="cb"><div className="ct">Medição #1 faturada</div><div className="cm">01/07 · NF 1029</div></div>
              </div>
              <div className="rtg-crow" style={{ cursor: 'default' }}>
                <IconTile icon="clipboard-list" tone="muted" size="md" />
                <div className="cb"><div className="ct">OS iniciada em campo</div><div className="cm">{o.per}</div></div>
              </div>
              <div className="rtg-crow" style={{ cursor: 'default' }}>
                <IconTile icon="file-text" tone="muted" size="md" />
                <div className="cb"><div className="ct">Orçamento ORC-055 aprovado</div><div className="cm">30/06 · {o.cli}</div></div>
              </div>
            </div>
          </Card>

          {isAberta && <Note icon="info">OS <b>aberta</b> — apontamentos chegam do <b>app de campo</b> em tempo real. Conclua a OS para liberar o faturamento total.</Note>}
        </div>
      </div>
    </>
  );
}
window.OSDetail = OSDetail;
