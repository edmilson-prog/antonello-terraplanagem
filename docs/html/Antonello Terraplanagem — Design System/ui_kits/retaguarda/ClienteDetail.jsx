/* Retaguarda — Cliente detail (recreation of mock-detalhe-cliente). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Avatar, Badge, Button, KpiCard, Card, StatusChip, DataRow, IconTile, Note, Pill, Icon } = NS;

/* Example detail data (Vale Verde) used for the rich sections. */
const CLI_OS = [
  { n: 'OS-021', t: 'Terraplenagem — lote industrial', h: '62 h', d: 'desde 01/07', v: 'R$ 24.800', tone: 'amber', st: 'Em andamento', led: true },
  { n: 'OS-018', t: 'Abertura de acesso e drenagem', h: '40 h', d: 'desde 20/06', v: 'R$ 16.200', tone: 'amber', st: 'Em andamento', led: true },
  { n: 'OS-012', t: 'Fundação de galpão — estacas', h: '88 h', d: '02–24/05', v: 'R$ 41.000', tone: 'success', st: 'Concluída', led: true },
  { n: 'OS-007', t: 'Nivelamento de pátio', h: '30 h', d: '08–19/04', v: 'R$ 12.500', tone: 'success', st: 'Concluída', led: true },
];
const CLI_NF = [
  { doc: 'NF 1042', em: '05/07', vc: '20/07', v: 'R$ 12.400', tone: 'amber', led: true, st: 'A vencer' },
  { doc: 'NF 1038', em: '28/06', vc: '12/07', v: 'R$ 8.900', tone: 'amber', led: true, st: 'A vencer' },
  { doc: 'NF 1035', em: '20/06', vc: '05/07', v: 'R$ 11.100', tone: 'danger', icon: 'circle-alert', st: 'Vencido' },
  { doc: 'NF 1029', em: '05/06', vc: '20/06', v: 'R$ 9.500', tone: 'success', icon: 'check', st: 'Pago' },
  { doc: 'NF 1021', em: '20/05', vc: '04/06', v: 'R$ 15.200', tone: 'success', icon: 'check', st: 'Pago' },
];
const CLI_ORC = [
  { t: 'Terraplenagem — fase 2', m: 'ORC-055 · 02/07', v: 'R$ 58.000', tone: 'info', st: 'Aberto' },
  { t: 'Drenagem de acesso', m: 'ORC-051 · 24/06', v: 'R$ 22.400', tone: 'info', st: 'Aberto' },
  { t: 'Pátio de manobra', m: 'ORC-047 · 12/06', v: 'R$ 18.900', tone: 'info', st: 'Aberto' },
  { t: 'Fundação do anexo', m: 'ORC-039 · 20/04', v: 'R$ 41.000', tone: 'success', st: 'Aprovado' },
  { t: 'Limpeza de terreno', m: 'ORC-030 · 08/03', v: 'R$ 9.800', tone: 'neutral', st: 'Perdido' },
];
const CLI_COMP = [
  { icon: 'credit-card', t: 'PIX recebido — NF 1029', m: '20/06 · 14:22', v: 'R$ 9.500' },
  { icon: 'landmark', t: 'TED recebida — NF 1021', m: '04/06 · 09:10', v: 'R$ 15.200' },
  { icon: 'link', t: 'Boleto pago — NF 1015', m: '22/05 · 16:40', v: 'R$ 7.300' },
];
const CLI_FAROLTI = [
  { k: 'Faturado (LTV)', ic: 'wallet', v: 'R$ 512.300', mono: true },
  { k: 'Ticket médio', ic: 'dollar-sign', v: 'R$ 8.740', mono: true },
  { k: 'OS realizadas', ic: 'file-text', v: '59' },
  { k: 'Curva ABC', ic: 'trending-up', v: 'A', s: 'alto valor histórico', abc: true },
  { k: 'Primeira OS', ic: 'calendar', v: '03/2019', mono: true },
  { k: 'Última OS', ic: 'calendar', v: '02/2022', mono: true },
  { k: 'Recência', ic: 'history', v: '38 meses', s: 'desde a última OS no legado' },
  { k: 'Origem', ic: 'database', v: 'ERP Farolti', s: 'Migração jun/2024' },
];

function ClienteDetail({ cliente, onBack }) {
  const c = cliente || window.RTG.clientes[0];
  return (
    <>
      <button className="rtg-back" onClick={onBack}><Icon name="arrow-left" size={16} /> Clientes</button>

      {/* HERO */}
      <section className="rtg-hero">
        <Avatar icon={c.tipo === 'PJ' ? 'building-2' : 'user'} size={78} shape="square" tone="brand" />
        <div className="rtg-hero-main">
          <h1>{c.nome}</h1>
          <div className="rtg-hero-sub">
            {c.ativo
              ? <Badge tone="active" led>Ativo</Badge>
              : <Badge tone="neutral" led>Inativo</Badge>}
            <Badge tone="info" icon="building-2">{c.tipo === 'PJ' ? 'Pessoa Jurídica' : 'Pessoa Física'}</Badge>
            {c.recorrente && <Badge tone="gold" icon="badge-check">Cliente recorrente</Badge>}
          </div>
          <div className="rtg-qf">
            <div className="qf"><span className="k">{c.tipo === 'PJ' ? 'CNPJ' : 'CPF'}</span><span className="v mono">{c.doc}</span></div>
            <div className="qf"><span className="k">Telefone</span><span className="v mono">{c.telefone}</span></div>
            <div className="qf"><span className="k">Cliente desde</span><span className="v">{c.desde || 'mar/2022 · 3 anos'}</span></div>
            <div className="qf"><span className="k">Última OS</span><span className="v">{c.ultimaOS || '08/07/2025'}</span></div>
          </div>
        </div>
        <div className="rtg-hero-actions">
          <Button variant="ghost" icon="pencil">Editar</Button>
          <Button variant="wa" icon="message-circle">WhatsApp</Button>
          <Button variant="primary" icon="file-plus">Novo orçamento</Button>
          <Button variant="danger" icon="ban">Inativar</Button>
        </div>
      </section>

      {/* KPIs */}
      <section className="rtg-kpis">
        <KpiCard label="Faturado em 2025" value={c.faturado || 'R$ 148.500'} mono icon="credit-card"
          trend={{ dir: 'up', value: '18%' }} foot="vs. 2024" spark={[19, 17, 18, 12, 13, 8, 9, 4]} />
        <KpiCard label="Saldo a receber" value={c.saldo || 'R$ 32.400'} mono warn icon="hand-coins"
          foot={<>3 títulos · <b style={{ color: 'var(--danger-fg)', fontWeight: 600 }}>1 vencido</b></>} />
        <KpiCard label="OS ativas" value={String(c.osAtivas ?? 2)} icon="clipboard-list"
          foot="em andamento no período" spark={[13, 14, 10, 11, 9, 10, 7, 8]} />
        <KpiCard label="Orçamentos abertos" value={String(c.orcAbertos ?? 3)} icon="file-text"
          foot="R$ 99.300 em propostas" />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Ordens de Serviço" icon="clipboard-list" headerRight={<Pill>4 vinculadas</Pill>}>
            <div className="rtg-oslist">
              {CLI_OS.map((o) => (
                <div className="rtg-osrow" key={o.n}>
                  <span className="rtg-osnum">{o.n}</span>
                  <div className="rtg-osbody">
                    <div className="t">{o.t}</div>
                    <div className="m">
                      <span><Icon name="clock" size={12} /> {o.h}</span>
                      <span><Icon name="calendar" size={12} /> {o.d}</span>
                    </div>
                  </div>
                  <div className="rtg-osend">
                    <span className="rtg-osval">{o.v}</span>
                    <StatusChip tone={o.tone} led={o.led}>{o.st}</StatusChip>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Contas a receber" icon="wallet" headerRight={<Pill>R$ 32.400 em aberto</Pill>}>
            <table className="rtg-table">
              <thead>
                <tr><th>Documento</th><th>Emissão</th><th>Vencimento</th><th className="r">Valor</th><th className="r">Situação</th></tr>
              </thead>
              <tbody>
                {CLI_NF.map((n) => (
                  <tr key={n.doc}>
                    <td><span className="rtg-doc">{n.doc}</span></td>
                    <td className="mono">{n.em}</td>
                    <td className="mono">{n.vc}</td>
                    <td className="r rtg-val">{n.v}</td>
                    <td className="r"><StatusChip tone={n.tone} led={n.led} icon={n.icon}>{n.st}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        <div className="rtg-stack">
          <Card title="Dados cadastrais" icon="contact" padded>
            <DataRow icon="building-2" label="Razão / Fantasia">{c.nome} · <small>{c.fantasia || c.nome}</small></DataRow>
            <DataRow icon="briefcase" label="Segmento">{c.segmento} · <small>{c.tipo}</small></DataRow>
            <DataRow icon="mail" label="E-mail"><span className="mono">{c.email || 'contato@cliente.com.br'}</span></DataRow>
            <DataRow icon="phone" label="Telefone"><span className="mono">{c.telefone}</span></DataRow>
            <DataRow icon="map-pin" label="Endereço">{c.endereco || c.cidade || 'Santo Ângelo/RS'}</DataRow>
            <DataRow icon="user" label="Contato">{c.contato || 'Setor de compras'} · <small>{c.contatoArea || 'Compras'}</small></DataRow>
          </Card>

          <Card title="Orçamentos" icon="file-text" headerRight={<Pill>5 no total</Pill>}>
            <div className="rtg-clist">
              {CLI_ORC.map((o) => (
                <div className="rtg-crow" key={o.m}>
                  <IconTile icon="file-text" tone="amber" size="md" />
                  <div className="cb"><div className="ct">{o.t}</div><div className="cm">{o.m}</div></div>
                  <div className="cv">{o.v}<StatusChip tone={o.tone} style={{ padding: '2px 7px' }}>{o.st}</StatusChip></div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Comprovantes recentes" icon="receipt">
            <div className="rtg-clist">
              {CLI_COMP.map((o) => (
                <div className="rtg-crow" key={o.t}>
                  <IconTile icon={o.icon} tone="amber" size="md" />
                  <div className="cb"><div className="ct">{o.t}</div><div className="cm">{o.m}</div></div>
                  <div className="cv">{o.v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* FAROLTI SNAPSHOT */}
      <section className="rtg-farolti">
        <div className="rtg-farolti-h">
          <span className="fi"><Icon name="database" size={18} /></span>
          <div className="ft">
            <h3>Histórico no ERP legado (Farolti)</h3>
            <p>Snapshot importado no cadastro (código 781) — não é recalculado ao vivo pelo sistema.</p>
          </div>
          <span className="rtg-farolti-badge"><Icon name="archive" size={12} /> Importado · congelado</span>
        </div>
        <div className="rtg-farolti-grid">
          {CLI_FAROLTI.map((f) => (
            <div className={f.abc ? 'rtg-fstat abc' : 'rtg-fstat'} key={f.k}>
              <div className="rtg-fstat-top">
                <span className="k">{f.k}</span>
                <span className="fic"><Icon name={f.ic} size={15} /></span>
              </div>
              <div className={f.mono ? 'v mono' : 'v'}>{f.v}</div>
              {f.s && <div className="s">{f.s}</div>}
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 22 }}>
        <Note icon="info">Os números do <b>snapshot Farolti</b> refletem o histórico anterior à migração e permanecem congelados. A atividade a partir de jun/2024 é calculada em tempo real pelo sistema (blocos acima).</Note>
      </div>
    </>
  );
}
window.ClienteDetail = ClienteDetail;
