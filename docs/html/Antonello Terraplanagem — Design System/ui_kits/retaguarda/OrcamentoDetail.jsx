/* Retaguarda — Orçamento detail (hero, itens, resumo, histórico, vínculos). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Badge, Button, KpiCard, Card, StatusChip, DataRow, Pill, IconTile, Note, Icon } = NS;

/* Itens por orçamento (fallback para os que não têm detalhamento). */
const ORC_ITENS = {
  'ORC-055': [
    { ic: 'truck', nm: 'Escavadeira CAT 320', qt: '90 h', un: 'R$ 400/h', sub: 'R$ 36.000' },
    { ic: 'tractor', nm: 'Retroescavadeira JCB 3CX', qt: '40 h', un: 'R$ 320/h', sub: 'R$ 12.800' },
    { ic: 'truck', nm: 'Caminhão basculante', qt: '30 h', un: 'R$ 220/h', sub: 'R$ 6.600' },
    { ic: 'truck', nm: 'Mobilização — prancha', qt: '65 km', un: 'R$ 8,50/km', sub: 'R$ 2.600' },
  ],
};
const ORC_ITENS_FALLBACK = [
  { ic: 'truck', nm: 'Escavadeira CAT 320', qt: '40 h', un: 'R$ 400/h', sub: 'R$ 16.000' },
  { ic: 'tractor', nm: 'Retroescavadeira JCB 3CX', qt: '20 h', un: 'R$ 320/h', sub: 'R$ 6.400' },
];
const ORC_HIST = {
  'Aberto': [['file-text', 'Orçamento emitido', 'enviado ao cliente'], ['mail', 'Proposta enviada por e-mail', 'aguardando retorno']],
  'Aprovado': [['badge-check', 'Orçamento aprovado', 'pelo cliente'], ['clipboard-list', 'OS gerada', 'a partir da proposta'], ['file-text', 'Orçamento emitido', 'enviado ao cliente']],
  'Perdido': [['ban', 'Orçamento perdido', 'cliente optou por outro fornecedor'], ['file-text', 'Orçamento emitido', 'enviado ao cliente']],
};

function OrcamentoDetail({ orc, onBack }) {
  const o = orc || {};
  const itens = ORC_ITENS[o.n] || ORC_ITENS_FALLBACK;
  const hist = ORC_HIST[o.st] || ORC_HIST['Aberto'];
  const isAberto = o.st === 'Aberto';
  const isAprovado = o.st === 'Aprovado';

  return (
    <>
      <button className="rtg-back" onClick={onBack}><Icon name="arrow-left" size={16} /> Orçamentos</button>

      {/* HERO */}
      <section className="rtg-hero">
        <IconTile icon="file-text" size="lg" tone="brand" style={{ width: 78, height: 78, borderRadius: 18 }} />
        <div className="rtg-hero-main">
          <div style={{ font: '700 13px/1 var(--font-mono)', color: 'var(--amarelo)', letterSpacing: '.02em' }}>{o.n}</div>
          <h1 style={{ marginTop: 8 }}>{o.t}</h1>
          <div className="rtg-hero-sub">
            <StatusChip tone={o.tone} led={o.tone !== 'neutral'}>{o.st}</StatusChip>
            <Badge tone="info" icon="building-2">{o.cli}</Badge>
            <Badge tone="gold" icon="tag">{o.v}</Badge>
          </div>
          <div className="rtg-qf">
            <div className="qf"><span className="k">Emissão</span><span className="v mono">{o.data}</span></div>
            <div className="qf"><span className="k">Validade</span><span className="v mono">{o.val}</span></div>
            <div className="qf"><span className="k">Itens</span><span className="v">{itens.length}</span></div>
            <div className="qf"><span className="k">Vendedor</span><span className="v">Admin AILA</span></div>
          </div>
        </div>
        <div className="rtg-hero-actions">
          <Button variant="ghost" icon="pencil">Editar</Button>
          <Button variant="wa" icon="message-circle">Enviar</Button>
          {isAberto && <Button variant="primary" icon="clipboard-list">Aprovar → OS</Button>}
          {isAprovado && <Button variant="ghost" icon="clipboard-list">Ver OS</Button>}
        </div>
      </section>

      {/* KPIs */}
      <section className="rtg-kpis">
        <KpiCard label="Valor total" value={o.v} mono icon="tag" foot={`${itens.length} itens`} />
        <KpiCard label="Custo estimado" value="R$ 34.200" mono warn icon="calculator" foot="Custo da Hora vigente" />
        <KpiCard label="Margem" value="41%" icon="trending-up" trend={{ dir: 'up', value: '3 p.p.' }} foot="acima da mínima (30%)" />
        <KpiCard label="Validade" value={isAberto ? '18 dias' : '—'} icon="clock" foot={isAberto ? 'para expirar' : o.st} />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Itens do orçamento" icon="tag" headerRight={<Pill>{o.v}</Pill>}>
            <div className="rtg-tablewrap">
              <table className="rtg-table">
                <thead>
                  <tr><th>Item</th><th className="r">Qtd</th><th className="r">Unitário</th><th className="r">Subtotal</th></tr>
                </thead>
                <tbody>
                  {itens.map((it, i) => (
                    <tr key={i}>
                      <td>
                        <div className="rtg-eqcell">
                          <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={it.ic} size={15} /></span>
                          <span className="nm">{it.nm}</span>
                        </div>
                      </td>
                      <td className="r rtg-val">{it.qt}</td>
                      <td className="r rtg-val">{it.un}</td>
                      <td className="r rtg-val">{it.sub}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="Histórico" icon="history">
            <div className="rtg-clist">
              {hist.map(([ic, t, m], i) => (
                <div className="rtg-crow" key={i} style={{ cursor: 'default' }}>
                  <IconTile icon={ic} tone="muted" size="md" />
                  <div className="cb"><div className="ct">{t}</div><div className="cm">{m}</div></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="rtg-stack">
          <Card title="Dados do orçamento" icon="file-text" padded>
            <DataRow icon="building-2" label="Cliente">{o.cli}</DataRow>
            <DataRow icon="briefcase" label="Serviço">{o.t}</DataRow>
            <DataRow icon="calendar" label="Emissão"><span className="mono">{o.data}</span></DataRow>
            <DataRow icon="clock" label="Validade"><span className="mono">{o.val}</span></DataRow>
            <DataRow icon="tag" label="Valor"><span className="mono">{o.v}</span></DataRow>
          </Card>

          {isAberto && <Note icon="info">Orçamento <b>aberto</b> — ao aprovar, vira uma <b>OS</b> com os mesmos itens e o cliente já vinculado. A margem é conferida contra o <b>Custo da Hora</b> vigente.</Note>}
          {isAprovado && <Note icon="badge-check">Orçamento <b>aprovado</b> e convertido em OS. O acompanhamento passa para <b>Ordens de Serviço</b>.</Note>}
          {o.st === 'Perdido' && <Note icon="ban" tone="steel">Orçamento <b>perdido</b>. Mantido no histórico para análise da <b>taxa de conversão</b> no Painel Gerencial.</Note>}
        </div>
      </div>
    </>
  );
}
window.OrcamentoDetail = OrcamentoDetail;
