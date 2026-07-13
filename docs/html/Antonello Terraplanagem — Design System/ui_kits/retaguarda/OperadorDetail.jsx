/* Retaguarda — Operador detail (recreation of mock-detalhe-operador). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Avatar, Badge, Button, KpiCard, Card, StatusChip, DataRow, Chip, Note, Pill, Icon } = NS;

const OP_APONT = [
  { data: '09/07', eq: 'Escavadeira CAT 320', eqIcon: 'truck', h0: '4.210', h1: '4.218', hrs: '8,0 h', os: 'OS-021' },
  { data: '08/07', eq: 'Escavadeira CAT 320', eqIcon: 'truck', h0: '4.203', h1: '4.210', hrs: '7,5 h', os: 'OS-021' },
  { data: '07/07', eq: 'Retroescavadeira JCB 3CX', eqIcon: 'tractor', h0: '1.882', h1: '1.888', hrs: '6,0 h', os: 'OS-019' },
  { data: '05/07', eq: 'Pá Carregadeira XCMG', eqIcon: 'forklift', h0: '990', h1: '998', hrs: '8,0 h', os: 'OS-024' },
  { data: '04/07', eq: 'Escavadeira CAT 320', eqIcon: 'truck', h0: '4.195', h1: '4.203', hrs: '8,0 h', os: 'OS-021' },
];
const OP_OS = [
  { n: 'OS-021', t: 'Terraplenagem — lote industrial', cli: 'Essavado Ltda.', h: '62 h', d: 'desde 01/07', tone: 'amber', st: 'Em andamento', led: true },
  { n: 'OS-019', t: 'Abertura de acesso e drenagem', cli: 'Construtora Sul', h: '28 h', d: 'desde 24/06', tone: 'amber', st: 'Em andamento', led: true },
  { n: 'OS-024', t: 'Nivelamento de pátio', cli: 'Agro Vale Verde', h: '8 h', d: 'desde 05/07', tone: 'info', st: 'Aberta', led: true },
  { n: 'OS-015', t: 'Fundação de galpão — estacas', cli: 'Metalúrgica Boa Vista', h: '44 h', d: '06–20/06', tone: 'success', st: 'Concluída', led: true },
];
const OP_BARS = [['S1', 62], ['S2', 71], ['S3', 56], ['S4', 80], ['S5', 68], ['S6', 76], ['S7', 64], ['S8', 92]];
const OP_EQUIP = [['truck', 'Escavadeira CAT 320'], ['tractor', 'Retro JCB 3CX'], ['forklift', 'Pá XCMG'], ['truck', 'Basculante']];

function OperadorDetail({ operador, onBack }) {
  const o = operador || window.RTG.operadores[0];
  return (
    <>
      <button className="rtg-back" onClick={onBack}><Icon name="arrow-left" size={16} /> Operadores</button>

      {/* HERO */}
      <section className="rtg-hero">
        <Avatar initials={o.iniciais} size={78} shape="square" tone="brand" />
        <div className="rtg-hero-main">
          <h1>{o.nome}</h1>
          <div className="rtg-hero-sub">
            {o.ativo ? <Badge tone="active" led>Ativo</Badge> : <Badge tone="neutral" led>Inativo</Badge>}
            <Badge tone="neutral" icon="briefcase">Operador · {o.vinculo}</Badge>
            {o.app
              ? <Badge tone="info" icon="smartphone">Acesso ao app</Badge>
              : <Badge tone="neutral" icon="smartphone">Sem acesso ao app</Badge>}
          </div>
          <div className="rtg-qf">
            <div className="qf"><span className="k">CPF</span><span className="v mono">{o.doc}</span></div>
            <div className="qf"><span className="k">Telefone</span><span className="v mono">{o.telefone}</span></div>
            <div className="qf"><span className="k">Operador desde</span><span className="v">{o.desde || 'mar/2021 · 4 anos'}</span></div>
            <div className="qf"><span className="k">Última atividade</span><span className="v">{o.ultimaAtividade || 'Hoje, 07:42'}</span></div>
          </div>
        </div>
        <div className="rtg-hero-actions">
          <Button variant="ghost" icon="pencil">Editar</Button>
          <Button variant="wa" icon="message-circle">WhatsApp</Button>
          <Button variant="danger" icon="ban">Inativar</Button>
        </div>
      </section>

      {/* KPIs */}
      <section className="rtg-kpis">
        <KpiCard label="Horas apontadas" value={o.horas || '182'} unit="h" icon="clock"
          trend={{ dir: 'up', value: '12%' }} foot="vs. junho" spark={[20, 17, 19, 12, 14, 8, 10, 4]} />
        <KpiCard label="OS ativas" value={String(o.osAtivas ?? 3)} icon="clipboard-list"
          foot="2 em andamento · 1 aberta" spark={[14, 15, 10, 12, 9, 11, 7, 8]} />
        <KpiCard label="OS concluídas" value={String(o.osConcluidas ?? 17)} icon="circle-check-big"
          trend={{ dir: 'up', value: '3' }} foot="no mês" spark={[22, 18, 16, 17, 11, 13, 7, 5]} />
        <KpiCard label="Equipamentos" value={String(o.equipamentos ?? 4)} icon="truck"
          foot="operados no período" spark={[16, 16, 13, 13, 10, 10, 8, 8]} />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Apontamentos recentes" icon="gauge"
            headerRight={<span className="rtg-link">Ver todos <Icon name="chevron-right" size={14} /></span>}>
            <table className="rtg-table">
              <thead>
                <tr><th>Data</th><th>Equipamento</th><th>Horímetro</th><th className="r">Horas</th><th className="r">OS</th></tr>
              </thead>
              <tbody>
                {OP_APONT.map((a, i) => (
                  <tr key={i}>
                    <td className="mono">{a.data}</td>
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

          <Card title="Ordens de Serviço" icon="clipboard-list" headerRight={<Pill>4 vinculadas</Pill>}>
            <div className="rtg-oslist">
              {OP_OS.map((s) => (
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
                  <div className="rtg-osend"><StatusChip tone={s.tone} led={s.led}>{s.st}</StatusChip></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="rtg-stack">
          <Card title="Dados cadastrais" icon="contact" padded>
            <DataRow icon="id-card" label="CNH">{o.cnh || 'Categoria E · válida até 03/2028'}</DataRow>
            <DataRow icon="cake" label="Nascimento"><span className="mono">{o.nascimento || '14/09/1985 · 39 anos'}</span></DataRow>
            <DataRow icon="briefcase" label="Vínculo">{o.vinculo} · <small>admissão mar/2021</small></DataRow>
            <DataRow icon="phone" label="Telefone"><span className="mono">{o.telefone}</span></DataRow>
            <DataRow icon="map-pin" label="Base">{o.base}</DataRow>
          </Card>

          <Card title="Horas por semana" icon="bar-chart">
            <div className="rtg-bars-wrap">
              <div className="rtg-bars">
                {OP_BARS.map(([lbl, h], i) => (
                  <div className="rtg-barcol" key={lbl}>
                    <div className={i === OP_BARS.length - 1 ? 'rtg-bar hi' : 'rtg-bar'} style={{ height: h + '%' }} />
                    <span className="rtg-barlbl">{lbl}</span>
                  </div>
                ))}
              </div>
              <div className="rtg-bars-meta"><span>Média <b>42 h</b>/semana</span><span>Pico <b>46 h</b> (S8)</span></div>
            </div>
          </Card>

          <Card title="Equipamentos habilitados" icon="wrench">
            <div className="rtg-chips">
              {OP_EQUIP.map(([ic, nm], i) => (<Chip key={i} icon={ic}>{nm}</Chip>))}
            </div>
          </Card>

          <Card title="Acesso ao app" icon="smartphone">
            <div className="rtg-appcard">
              <div className="rtg-appstatus">
                <div className="ico"><Icon name="check" size={18} /></div>
                <div><div className="tt">App liberado</div><div className="ss">Login ativo no dispositivo</div></div>
              </div>
              <div className="rtg-appgrid">
                <div><div className="k">Último acesso</div><div className="v">Hoje, 07:42</div></div>
                <div><div className="k">Dispositivo</div><div className="v">Android · Moto G</div></div>
                <div><div className="k">Versão</div><div className="v mono">v0.1 · fundação</div></div>
                <div><div className="k">Aponta via</div><div className="v">App de campo</div></div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div style={{ marginTop: 22 }}>
        <Note icon="lock" tone="steel">Perfil operacional — sem dados financeiros. Custo-hora e valores ficam restritos às telas de <b>Custo da Hora</b>, <b>Financeiro</b> e <b>Rentabilidade</b>, conforme o particionamento de acesso.</Note>
      </div>
    </>
  );
}
window.OperadorDetail = OperadorDetail;
