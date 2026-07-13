/* Retaguarda — Sobre (o sistema, os produtos e a migração do legado). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, DataRow, Badge, Chip, Note, Icon } = NS;

const SOBRE_MODULOS = [
  ['dashboard', 'Dashboard'], ['clipboard-list', 'Ordens de Serviço'], ['receipt', 'Comprovantes'],
  ['truck', 'Equipamentos'], ['hard-hat', 'Operadores'], ['users', 'Clientes'],
  ['tag', 'Preços'], ['file-text', 'Orçamentos'], ['file-check', 'Faturamento'],
  ['wallet', 'Financeiro'], ['calculator', 'Custo da Hora'], ['trending-up', 'Rentabilidade'],
  ['wrench', 'Manutenção'], ['fuel', 'Diesel'],
];

function Sobre() {
  return (
    <>
      {/* HERO */}
      <section className="rtg-hero">
        <div style={{ width: 78, height: 78, borderRadius: 18, background: 'var(--amarelo)', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: 'var(--shadow-amarelo)' }}>
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#16140f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 20h18" /><path d="M6 20v-4h4v4" /><path d="m10 16 3-7 5 4v3" />
          </svg>
        </div>
        <div className="rtg-hero-main">
          <h1>Antonello Terraplanagem</h1>
          <div className="rtg-hero-sub">
            <Badge tone="gold" led>v0.1 · fundação</Badge>
            <Badge tone="neutral" icon="dashboard">Retaguarda</Badge>
            <Badge tone="info" icon="smartphone">App de campo</Badge>
          </div>
          <div className="rtg-qf">
            <div className="qf"><span className="k">Desenvolvido por</span><span className="v">AILA — Inteligência Aplicada</span></div>
            <div className="qf"><span className="k">Última atualização</span><span className="v mono">08/07/2025</span></div>
            <div className="qf"><span className="k">Ambiente</span><span className="v">Produção</span></div>
          </div>
        </div>
      </section>

      {/* BODY */}
      <div className="rtg-grid">
        <div className="rtg-stack">
          <Card title="O sistema" icon="info" padded>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--muted)' }}>
              Sistema de gestão da operação de terraplenagem: ordens de serviço, apontamentos por
              horímetro, frota, diesel, faturamento e custo da hora — do orçamento ao recebimento.
              A <b style={{ color: 'var(--fg)' }}>Retaguarda</b> concentra a gestão no escritório; o{' '}
              <b style={{ color: 'var(--fg)' }}>App de campo</b> (Android) registra os apontamentos
              dos operadores direto da máquina.
            </p>
          </Card>

          <Card title="Módulos" icon="dashboard">
            <div className="rtg-chips">
              {SOBRE_MODULOS.map(([ic, nome]) => (<Chip key={nome} icon={ic}>{nome}</Chip>))}
            </div>
          </Card>
        </div>

        <div className="rtg-stack">
          <Card title="Instalação" icon="contact" padded>
            <DataRow icon="badge-check" label="Licenciado para">Antonello Terraplanagem Ltda.</DataRow>
            <DataRow icon="calendar" label="Em operação desde"><span className="mono">jun/2024</span></DataRow>
            <DataRow icon="hard-hat" label="Usuários">6 na retaguarda · <small>38 no app de campo</small></DataRow>
            <DataRow icon="mail" label="Suporte"><span className="mono">suporte@ailainteligente.com</span></DataRow>
          </Card>

          <Card title="Legado" icon="database" padded>
            <DataRow icon="database" label="ERP anterior">Farolti · <small>até jun/2024</small></DataRow>
            <DataRow icon="archive" label="Snapshot">Importado · congelado</DataRow>
          </Card>

          <Note icon="info" tone="steel">O histórico do <b>ERP Farolti</b> foi importado como snapshot no cadastro de cada cliente e não é recalculado ao vivo — a atividade desde jun/2024 é calculada pelo sistema.</Note>
        </div>
      </div>
    </>
  );
}
window.Sobre = Sobre;
