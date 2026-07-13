/* Retaguarda — persistent sidebar (brand + grouped nav). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { NavItem, Hazard } = NS;

const RTG_NAV = [
  { group: 'Operação', items: [
    ['dashboard', 'dashboard', 'Dashboard'],
    ['os', 'clipboard-list', 'Ordens de Serviço'],
    ['comprovantes', 'receipt', 'Comprovantes'],
  ]},
  { group: 'Cadastros', items: [
    ['equipamentos', 'truck', 'Equipamentos', 14],
    ['operadores', 'hard-hat', 'Operadores', 38],
    ['clientes', 'users', 'Clientes', 22],
  ]},
  { group: 'Comercial', items: [
    ['precos', 'tag', 'Preços'],
    ['orcamentos', 'file-text', 'Orçamentos'],
  ]},
  { group: 'Financeiro', items: [
    ['faturamento', 'file-check', 'Faturamento'],
    ['financeiro', 'wallet', 'Financeiro'],
    ['custohora', 'calculator', 'Custo da Hora'],
    ['rentabilidade', 'trending-up', 'Rentabilidade'],
    ['painel', 'line-chart', 'Painel Gerencial'],
  ]},
  { group: 'Frota', items: [
    ['manutencao', 'wrench', 'Manutenção'],
    ['diesel', 'fuel', 'Diesel'],
  ]},
  { group: 'Sistema', items: [
    ['parametros', 'sliders', 'Parâmetros'],
    ['sobre', 'info', 'Sobre'],
  ]},
];

function Sidebar({ module, onNavigate }) {
  return (
    <aside className="rtg-sidebar">
      <div className="rtg-brand">
        <div className="rtg-brand-row">
          <div className="rtg-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16140f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 20h18" /><path d="M6 20v-4h4v4" /><path d="m10 16 3-7 5 4v3" />
            </svg>
          </div>
          <div className="rtg-brand-name">ANTONELLO<small>TERRAPLANAGEM</small></div>
        </div>
        <div className="rtg-hazard"><Hazard /></div>
      </div>
      <nav className="rtg-nav">
        {RTG_NAV.map((g) => (
          <div className="rtg-group" key={g.group}>
            <div className="eyebrow">{g.group}</div>
            {g.items.map(([id, icon, label, count]) => (
              <NavItem key={id} icon={icon} count={count} active={module === id} onClick={() => onNavigate(id)}>
                {label}
              </NavItem>
            ))}
          </div>
        ))}
      </nav>
      <div className="rtg-foot">v0.1 · fundação</div>
    </aside>
  );
}
window.Sidebar = Sidebar;
