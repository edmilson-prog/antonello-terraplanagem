/* Retaguarda — Clientes list (click a row to open the detail). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, StatusChip, Badge, IconTile, Button } = NS;

function ClientesList({ onOpen }) {
  const rows = window.RTG.clientes;
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Clientes</h1>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="file-plus">Novo cliente</Button>
      </div>
      <Card>
        <table className="rtg-table rtg-clickable">
          <thead>
            <tr>
              <th>Cliente</th><th>Tipo</th><th>Cidade</th>
              <th className="r">OS ativas</th><th className="r">Saldo</th><th className="r">Situação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} onClick={() => onOpen(c)}>
                <td>
                  <div className="rtg-namecell">
                    <IconTile icon={c.tipo === 'PJ' ? 'building-2' : 'user'} tone="amber" size="md" />
                    <div><div className="nm">{c.nome}</div><div className="sub">{c.segmento}</div></div>
                  </div>
                </td>
                <td><Badge tone={c.tipo === 'PJ' ? 'info' : 'neutral'}>{c.tipo}</Badge></td>
                <td>{c.cidade || 'Santo Ângelo/RS'}</td>
                <td className="r rtg-val">{c.osAtivas}</td>
                <td className="r rtg-val">{c.saldo}</td>
                <td className="r">
                  {c.ativo
                    ? <StatusChip tone="success" led>Ativo</StatusChip>
                    : <StatusChip tone="neutral">Inativo</StatusChip>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}
window.ClientesList = ClientesList;
