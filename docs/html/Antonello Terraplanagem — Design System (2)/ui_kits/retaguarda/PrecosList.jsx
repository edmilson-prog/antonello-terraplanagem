/* Retaguarda — Preços (tabela de preços por equipamento/serviço). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, Pill, Icon, Note } = NS;

const PRC_ROWS = [
  { item: 'Escavadeira CAT 320', ic: 'truck', un: 'hora', preco: 'R$ 400', custo: 'R$ 232', margem: '42%', dir: 'up', atual: '01/07' },
  { item: 'Retroescavadeira JCB 3CX', ic: 'tractor', un: 'hora', preco: 'R$ 320', custo: 'R$ 178', margem: '44%', dir: 'up', atual: '01/07' },
  { item: 'Pá Carregadeira XCMG', ic: 'forklift', un: 'hora', preco: 'R$ 300', custo: 'R$ 195', margem: '35%', dir: 'up', atual: '01/07' },
  { item: 'Rolo compactador CA25', ic: 'tractor', un: 'hora', preco: 'R$ 260', custo: 'R$ 168', margem: '35%', dir: 'up', atual: '01/06' },
  { item: 'Caminhão basculante', ic: 'truck', un: 'hora', preco: 'R$ 220', custo: 'R$ 174', margem: '21%', dir: 'down', atual: '01/06' },
  { item: 'Mobilização — prancha', ic: 'truck', un: 'km', preco: 'R$ 8,50', custo: 'R$ 6,10', margem: '28%', dir: 'down', atual: '01/05' },
];

function PrecosList() {
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Preços</h1>
        <Pill>tabela vigente · jul/2025</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="history">Tabelas anteriores</Button>
        <Button variant="primary" icon="pencil">Editar preços</Button>
      </div>

      <Card title="Tabela de preços" icon="tag" headerRight={<Pill>{PRC_ROWS.length} itens</Pill>}>
        <div className="rtg-tablewrap">
        <table className="rtg-table">
          <thead>
            <tr><th>Item</th><th>Unidade</th><th className="r">Preço</th><th className="r">Custo ref.</th><th className="r">Margem</th><th>Atualizado</th></tr>
          </thead>
          <tbody>
            {PRC_ROWS.map((r) => (
              <tr key={r.item}>
                <td>
                  <div className="rtg-eqcell">
                    <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={r.ic} size={15} /></span>
                    <span className="nm">{r.item}</span>
                  </div>
                </td>
                <td>{r.un}</td>
                <td className="r rtg-val">{r.preco}<span style={{ color: 'var(--muted-2)', fontWeight: 500 }}>/{r.un === 'km' ? 'km' : 'h'}</span></td>
                <td className="r rtg-val">{r.custo}</td>
                <td className="r">
                  <span className={`atp-trend atp-trend--${r.dir}`} style={{ fontSize: 13 }}>
                    <Icon name="arrow-up-right" size={13} style={r.dir === 'down' ? { transform: 'rotate(90deg)' } : undefined} />
                    {r.margem}
                  </span>
                </td>
                <td className="mono">{r.atual}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      <div style={{ marginTop: 16 }}>
        <Note icon="info">Os preços alimentam os <b>orçamentos</b>; a margem é calculada contra o <b>Custo da Hora</b> vigente. Itens abaixo da margem mínima (30%, definida em Parâmetros) aparecem em laranja.</Note>
      </div>
    </>
  );
}
window.PrecosList = PrecosList;
