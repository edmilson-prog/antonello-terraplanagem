/* Retaguarda — Comprovantes (recibos de pagamento; filtro por forma). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, Pill, Icon } = NS;

const CMP_ROWS = [
  { data: '05/07', forma: 'PIX', ic: 'credit-card', t: 'PIX recebido — NF 1041', cli: 'Agro Vale Verde', nf: 'NF 1041', v: 'R$ 9.600' },
  { data: '03/07', forma: 'TED', ic: 'landmark', t: 'TED recebida — NF 1033', cli: 'Construtora Sul', nf: 'NF 1033', v: 'R$ 7.800' },
  { data: '20/06', forma: 'PIX', ic: 'credit-card', t: 'PIX recebido — NF 1029', cli: 'Construtora Vale Verde', nf: 'NF 1029', v: 'R$ 9.500' },
  { data: '04/06', forma: 'TED', ic: 'landmark', t: 'TED recebida — NF 1021', cli: 'Construtora Vale Verde', nf: 'NF 1021', v: 'R$ 15.200' },
  { data: '22/05', forma: 'Boleto', ic: 'link', t: 'Boleto pago — NF 1015', cli: 'Essavado Ltda.', nf: 'NF 1015', v: 'R$ 7.300' },
  { data: '12/05', forma: 'PIX', ic: 'credit-card', t: 'PIX recebido — NF 1012', cli: 'Metalúrgica Boa Vista', nf: 'NF 1012', v: 'R$ 6.400' },
];

const CMP_FILTERS = ['Todos', 'PIX', 'TED', 'Boleto'];

function ComprovantesList() {
  const [filter, setFilter] = React.useState('Todos');
  const rows = filter === 'Todos' ? CMP_ROWS : CMP_ROWS.filter((r) => r.forma === filter);
  const count = (id) => (id === 'Todos' ? CMP_ROWS.length : CMP_ROWS.filter((r) => r.forma === id).length);
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Comprovantes</h1>
        <Pill>R$ 55.800 no período</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="file-plus">Anexar comprovante</Button>
      </div>

      <div className="rtg-filters">
        {CMP_FILTERS.map((f) => (
          <button key={f} type="button" className={filter === f ? 'rtg-filter is-active' : 'rtg-filter'} onClick={() => setFilter(f)}>
            {f}
            <span className="ct">{count(f)}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="rtg-tablewrap">
        <table className="rtg-table">
          <thead>
            <tr><th>Data</th><th>Comprovante</th><th>Cliente</th><th>NF</th><th className="r">Valor</th></tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="mono">{r.data}</td>
                <td>
                  <div className="rtg-eqcell">
                    <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={r.ic} size={15} /></span>
                    <span className="nm">{r.t}</span>
                  </div>
                </td>
                <td>{r.cli}</td>
                <td><span className="rtg-doc">{r.nf}</span></td>
                <td className="r rtg-val">{r.v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </>
  );
}
window.ComprovantesList = ComprovantesList;
