/* Retaguarda — Parâmetros (configurações operacionais, financeiras e de acesso). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, DataRow, StatusChip, Button, Pill, Note } = NS;

function Parametros() {
  return (
    <>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Parâmetros</h1>
        <Pill>v0.1 · fundação</Pill>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" icon="history">Histórico de alterações</Button>
        <Button variant="primary" icon="pencil">Editar parâmetros</Button>
      </div>

      <div className="rtg-grid" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 0 }}>
        <div className="rtg-stack">
          <Card title="Empresa" icon="building-2" padded>
            <DataRow icon="building-2" label="Razão social">Antonello Terraplanagem Ltda.</DataRow>
            <DataRow icon="id-card" label="CNPJ"><span className="mono">04.887.210/0001-33</span></DataRow>
            <DataRow icon="map-pin" label="Sede">Av. das Máquinas, 1200 — Santo Ângelo/RS</DataRow>
            <DataRow icon="phone" label="Telefone"><span className="mono">(55) 3313-4400</span></DataRow>
          </Card>

          <Card title="Operação" icon="clipboard-list" padded>
            <DataRow icon="clock" label="Jornada padrão"><span className="mono">8,0 h</span> · <small>por dia útil</small></DataRow>
            <DataRow icon="gauge" label="Tolerância de horímetro"><span className="mono">± 0,2 h</span> · <small>por apontamento</small></DataRow>
            <DataRow icon="wrench" label="Alerta de manutenção"><span className="mono">50 h</span> · <small>antes do plano</small></DataRow>
            <DataRow icon="fuel" label="Diesel — tanque interno"><span className="mono">R$ 5,84/L</span> · <small>atualizado 02/07</small></DataRow>
          </Card>

          <Card title="Custo da Hora" icon="calculator" padded>
            <DataRow icon="history" label="Depreciação padrão"><span className="mono">10% a.a.</span> · <small>sobre valor de mercado</small></DataRow>
            <DataRow icon="hard-hat" label="Custo do operador"><span className="mono">R$ 62/h</span> · <small>encargos inclusos</small></DataRow>
            <DataRow icon="trending-up" label="Margem mínima"><span className="mono">30%</span> · <small>alerta abaixo disso</small></DataRow>
          </Card>
        </div>

        <div className="rtg-stack">
          <Card title="Faturamento & financeiro" icon="file-check" padded>
            <DataRow icon="calendar" label="Vencimento padrão"><span className="mono">15 dias</span> · <small>após emissão da NF</small></DataRow>
            <DataRow icon="wallet" label="Juros e multa"><span className="mono">1% a.m. + 2%</span> · <small>títulos vencidos</small></DataRow>
            <DataRow icon="file-text" label="Série de NF"><span className="mono">Série 1</span> · <small>numeração automática</small></DataRow>
            <DataRow icon="credit-card" label="Recebimento padrão">PIX · <small>chave CNPJ</small></DataRow>
          </Card>

          <Card title="App de campo & acesso" icon="smartphone" padded>
            <DataRow icon="smartphone" label="Apontamento via app"><StatusChip tone="success" led>Ativado</StatusChip></DataRow>
            <DataRow icon="check" label="Aprovação de apontamentos">Supervisor · <small>fecha o dia até 20h</small></DataRow>
            <DataRow icon="lock" label="Particionamento financeiro"><StatusChip tone="success" led>Ativado</StatusChip></DataRow>
          </Card>

          <Note icon="info">Alterar parâmetros recalcula o <b>Custo da Hora</b> e a <b>Rentabilidade</b> a partir do mês vigente — meses fechados não são reprocessados.</Note>
        </div>
      </div>
    </>
  );
}
window.Parametros = Parametros;
