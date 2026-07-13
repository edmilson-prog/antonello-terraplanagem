/* Retaguarda — app shell + simple screen routing.
   Defines window.App; each HTML entry mounts it (optionally with `initial`). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Hazard } = NS;

function App({ initial }) {
  const [module, setModule] = React.useState((initial && initial.module) || 'clientes');
  const [selected, setSelected] = React.useState((initial && initial.entity) || null);

  const navigate = (id) => { setModule(id); setSelected(null); };
  const P = window.RTG.placeholders;

  const crumbs = [{ label: 'Retaguarda' }];
  let screen;

  if (module === 'dashboard') {
    crumbs.push({ label: 'Dashboard', here: true });
    screen = <window.Dashboard onNavigate={navigate} />;
  } else if (module === 'os') {
    if (selected && selected.__new) {
      crumbs.push({ label: 'Ordens de Serviço' }, { label: 'Nova OS', here: true });
      screen = <window.NovaOS onCancel={() => setSelected(null)} onCreate={() => setSelected(null)} />;
    } else if (selected) {
      crumbs.push({ label: 'Ordens de Serviço' }, { label: selected.n, here: true });
      screen = <window.OSDetail os={selected} onBack={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Ordens de Serviço', here: true });
      screen = <window.OSList onOpen={setSelected} onNew={() => setSelected({ __new: true })} />;
    }
  } else if (module === 'orcamentos') {
    if (selected && selected.__new) {
      crumbs.push({ label: 'Orçamentos' }, { label: 'Novo orçamento', here: true });
      screen = <window.NovoOrcamento onCancel={() => setSelected(null)} onCreate={() => setSelected(null)} />;
    } else if (selected) {
      crumbs.push({ label: 'Orçamentos' }, { label: selected.n, here: true });
      screen = <window.OrcamentoDetail orc={selected} onBack={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Orçamentos', here: true });
      screen = <window.OrcamentosList onNew={() => setSelected({ __new: true })} onOpen={setSelected} />;
    }
  } else if (module === 'precos') {
    crumbs.push({ label: 'Preços', here: true });
    screen = <window.PrecosList />;
  } else if (module === 'rentabilidade') {
    crumbs.push({ label: 'Rentabilidade', here: true });
    screen = <window.Rentabilidade />;
  } else if (module === 'comprovantes') {
    crumbs.push({ label: 'Comprovantes', here: true });
    screen = <window.ComprovantesList />;
  } else if (module === 'manutencao') {
    if (selected && selected.__new) {
      crumbs.push({ label: 'Manutenção' }, { label: 'Nova manutenção', here: true });
      screen = <window.NovaManutencao onCancel={() => setSelected(null)} onCreate={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Manutenção', here: true });
      screen = <window.Manutencao onNew={() => setSelected({ __new: true })} />;
    }
  } else if (module === 'painel') {
    crumbs.push({ label: 'Painel Gerencial', here: true });
    screen = <window.PainelGerencial />;
  } else if (module === 'financeiro') {
    if (selected && selected.__new) {
      crumbs.push({ label: 'Financeiro' }, { label: 'Novo pagamento', here: true });
      screen = <window.NovoPagamento onCancel={() => setSelected(null)} onCreate={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Financeiro', here: true });
      screen = <window.Financeiro onNew={() => setSelected({ __new: true })} />;
    }
  } else if (module === 'custohora') {
    if (selected && selected.__new) {
      crumbs.push({ label: 'Custo da Hora' }, { label: 'Novo lançamento', here: true });
      screen = <window.NovoCusto onCancel={() => setSelected(null)} onCreate={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Custo da Hora', here: true });
      screen = <window.CustoHora onNew={() => setSelected({ __new: true })} />;
    }
  } else if (module === 'equipamentos') {
    if (selected && selected.__new) {
      crumbs.push({ label: 'Equipamentos' }, { label: 'Novo equipamento', here: true });
      screen = <window.NovoEquipamento onCancel={() => setSelected(null)} onCreate={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Equipamentos', here: true });
      screen = <window.EquipamentosList onNew={() => setSelected({ __new: true })} />;
    }
  } else if (module === 'diesel') {
    if (selected && selected.__new) {
      crumbs.push({ label: 'Diesel' }, { label: 'Novo abastecimento', here: true });
      screen = <window.NovoAbastecimento onCancel={() => setSelected(null)} onCreate={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Diesel', here: true });
      screen = <window.Diesel onNew={() => setSelected({ __new: true })} />;
    }
  } else if (module === 'faturamento') {
    if (selected && selected.__new) {
      crumbs.push({ label: 'Faturamento' }, { label: 'Nova NF', here: true });
      screen = <window.NovaNF onCancel={() => setSelected(null)} onCreate={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Faturamento', here: true });
      screen = <window.Faturamento onNew={() => setSelected({ __new: true })} />;
    }
  } else if (module === 'parametros') {
    crumbs.push({ label: 'Parâmetros', here: true });
    screen = <window.Parametros />;
  } else if (module === 'sobre') {
    crumbs.push({ label: 'Sobre', here: true });
    screen = <window.Sobre />;
  } else if (module === 'clientes') {
    if (selected && selected.__new) {
      crumbs.push({ label: 'Clientes' }, { label: 'Novo cliente', here: true });
      screen = <window.NovoCliente onCancel={() => setSelected(null)} onCreate={() => setSelected(null)} />;
    } else if (selected) {
      crumbs.push({ label: 'Clientes' }, { label: selected.nome, here: true });
      screen = <window.ClienteDetail cliente={selected} onBack={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Clientes', here: true });
      screen = <window.ClientesList onOpen={setSelected} onNew={() => setSelected({ __new: true })} />;
    }
  } else if (module === 'operadores') {
    if (selected && selected.__new) {
      crumbs.push({ label: 'Operadores' }, { label: 'Novo operador', here: true });
      screen = <window.NovoOperador onCancel={() => setSelected(null)} onCreate={() => setSelected(null)} />;
    } else if (selected) {
      crumbs.push({ label: 'Operadores' }, { label: selected.nome, here: true });
      screen = <window.OperadorDetail operador={selected} onBack={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Operadores', here: true });
      screen = <window.OperadoresList onOpen={setSelected} onNew={() => setSelected({ __new: true })} />;
    }
  } else {
    const p = P[module] || { icon: 'dashboard', label: module };
    crumbs.push({ label: p.label, here: true });
    screen = <window.Placeholder icon={p.icon} label={p.label} />;
  }

  return (
    <div className="rtg-app">
      <window.Sidebar module={module} onNavigate={navigate} />
      <div className="rtg-main">
        <Hazard variant="header" />
        <window.Header crumbs={crumbs} />
        <main className="rtg-content">{screen}</main>
      </div>
    </div>
  );
}
window.App = App;
