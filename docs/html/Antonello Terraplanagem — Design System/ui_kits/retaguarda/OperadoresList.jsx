/* Retaguarda — Operadores list (click a row to open the detail). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, StatusChip, Badge, Avatar, Button } = NS;

function OperadoresList({ onOpen, onNew }) {
  const rows = window.RTG.operadores;
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Operadores</h1>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="arrow-up-right">Exportar</Button>
        <Button variant="primary" icon="file-plus" onClick={onNew}>Novo operador</Button>
      </div>
      <Card>
        <table className="rtg-table rtg-clickable">
          <thead>
            <tr>
              <th>Operador</th><th>Vínculo</th><th>Base</th>
              <th className="r">Horas (mês)</th><th className="r">App</th><th className="r">Situação</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id} onClick={() => onOpen(o)}>
                <td>
                  <div className="rtg-namecell">
                    <Avatar initials={o.iniciais} size={34} />
                    <div><div className="nm">{o.nome}</div><div className="sub">{o.osAtivas} OS ativas</div></div>
                  </div>
                </td>
                <td><Badge tone="neutral">{o.vinculo}</Badge></td>
                <td>{o.base}</td>
                <td className="r rtg-val">{o.horas} h</td>
                <td className="r">
                  {o.app
                    ? <StatusChip tone="info" led>Liberado</StatusChip>
                    : <StatusChip tone="neutral">Sem acesso</StatusChip>}
                </td>
                <td className="r">
                  {o.ativo
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
window.OperadoresList = OperadoresList;
