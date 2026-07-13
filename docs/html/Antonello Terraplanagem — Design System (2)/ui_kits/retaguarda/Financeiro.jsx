/* Retaguarda — Financeiro (contas a receber / a pagar, comprovantes). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { KpiCard, Card, StatusChip, Button, Pill, IconTile, Icon } = NS;

const FIN_RECEBER = [
  { doc: 'NF 1042', cli: 'Construtora Vale Verde', em: '05/07', vc: '20/07', v: 'R$ 12.400', tone: 'amber', led: true, st: 'A vencer' },
  { doc: 'NF 1041', cli: 'Agro Vale Verde', em: '03/07', vc: '18/07', v: 'R$ 9.600', tone: 'amber', led: true, st: 'A vencer' },
  { doc: 'NF 1038', cli: 'Construtora Vale Verde', em: '28/06', vc: '12/07', v: 'R$ 8.900', tone: 'amber', led: true, st: 'A vencer' },
  { doc: 'NF 1035', cli: 'Essavado Ltda.', em: '20/06', vc: '05/07', v: 'R$ 11.100', tone: 'danger', icon: 'circle-alert', st: 'Vencido' },
  { doc: 'NF 1033', cli: 'Construtora Sul', em: '18/06', vc: '02/07', v: 'R$ 7.800', tone: 'danger', icon: 'circle-alert', st: 'Vencido' },
  { doc: 'NF 1029', cli: 'Construtora Vale Verde', em: '05/06', vc: '20/06', v: 'R$ 9.500', tone: 'success', icon: 'check', st: 'Pago' },
];
const FIN_PAGAR = [
  { doc: 'BOL 8821', forn: 'Posto Missões — diesel', ic: 'fuel', vc: '15/07', v: 'R$ 14.300', tone: 'amber', led: true, st: 'A vencer' },
  { doc: 'NF 5540', forn: 'Peças CAT — manutenção', ic: 'wrench', vc: '22/07', v: 'R$ 6.850', tone: 'amber', led: true, st: 'A vencer' },
  { doc: 'FOLHA 07', forn: 'Folha — operadores', ic: 'hard-hat', vc: '30/07', v: 'R$ 31.200', tone: 'amber', led: true, st: 'A vencer' },
  { doc: 'AP 2207', forn: 'Seguro da frota', ic: 'truck', vc: '02/07', v: 'R$ 4.980', tone: 'success', icon: 'check', st: 'Pago' },
];
const FIN_COMP = [
  { icon: 'credit-card', t: 'PIX recebido — NF 1029', m: '20/06 · 14:22', v: 'R$ 9.500' },
  { icon: 'landmark', t: 'TED recebida — NF 1021', m: '04/06 · 09:10', v: 'R$ 15.200' },
  { icon: 'link', t: 'Boleto pago — NF 1015', m: '22/05 · 16:40', v: 'R$ 7.300' },
];
const FIN_FORMAS = [
  { icon: 'credit-card', t: 'PIX', m: '12 recebimentos', v: 'R$ 38.400' },
  { icon: 'landmark', t: 'TED', m: '5 recebimentos', v: 'R$ 29.100' },
  { icon: 'link', t: 'Boleto', m: '7 recebimentos', v: 'R$ 18.700' },
];

function Financeiro({ onNew }) {
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Financeiro</h1>
        <Pill>julho/2025</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="file-plus" onClick={onNew}>Novo lançamento</Button>
      </div>

      {/* KPIs */}
      <section className="rtg-kpis" style={{ marginTop: 0 }}>
        <KpiCard label="A receber" value="R$ 61.900" mono warn icon="hand-coins"
          foot={<>5 títulos · <b style={{ color: 'var(--danger-fg)', fontWeight: 600 }}>2 vencidos</b></>} />
        <KpiCard label="A pagar" value="R$ 52.350" mono icon="wallet"
          foot="3 títulos até 30/07" />
        <KpiCard label="Recebido no mês" value="R$ 86.200" mono icon="credit-card"
          trend={{ dir: 'up', value: '11%' }} foot="vs. junho" spark={[18, 16, 17, 12, 13, 9, 10, 5]} />
        <KpiCard label="Saldo do mês" value="R$ 33.850" mono icon="trending-up"
          foot="recebido − pago" spark={[16, 15, 14, 12, 11, 9, 8, 6]} />
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="Contas a receber" icon="hand-coins" headerRight={<Pill>R$ 61.900 em aberto</Pill>}>
            <div className="rtg-tablewrap rtg-tablewrap--wide">
            <table className="rtg-table">
              <thead>
                <tr><th>Documento</th><th>Cliente</th><th>Emissão</th><th>Vencimento</th><th className="r">Valor</th><th className="r">Situação</th></tr>
              </thead>
              <tbody>
                {FIN_RECEBER.map((n) => (
                  <tr key={n.doc}>
                    <td><span className="rtg-doc">{n.doc}</span></td>
                    <td>{n.cli}</td>
                    <td className="mono">{n.em}</td>
                    <td className="mono">{n.vc}</td>
                    <td className="r rtg-val">{n.v}</td>
                    <td className="r"><StatusChip tone={n.tone} led={n.led} icon={n.icon}>{n.st}</StatusChip></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </Card>

          <Card title="Contas a pagar" icon="wallet" headerRight={<Pill>R$ 52.350 em aberto</Pill>}>
            <div className="rtg-tablewrap rtg-tablewrap--wide">
            <table className="rtg-table">
              <thead>
                <tr><th>Documento</th><th>Fornecedor</th><th>Vencimento</th><th className="r">Valor</th><th className="r">Situação</th></tr>
              </thead>
              <tbody>
                {FIN_PAGAR.map((n) => (
                  <tr key={n.doc}>
                    <td><span className="rtg-doc">{n.doc}</span></td>
                    <td>
                      <div className="rtg-eqcell">
                        <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={n.ic} size={15} /></span>
                        <span className="nm">{n.forn}</span>
                      </div>
                    </td>
                    <td className="mono">{n.vc}</td>
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
          <Card title="Recebimentos por forma" icon="credit-card" headerRight={<Pill>24 no mês</Pill>}>
            <div className="rtg-clist">
              {FIN_FORMAS.map((o) => (
                <div className="rtg-crow" key={o.t}>
                  <IconTile icon={o.icon} tone="amber" size="md" />
                  <div className="cb"><div className="ct">{o.t}</div><div className="cm">{o.m}</div></div>
                  <div className="cv">{o.v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Comprovantes recentes" icon="receipt">
            <div className="rtg-clist">
              {FIN_COMP.map((o) => (
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
    </>
  );
}
window.Financeiro = Financeiro;
