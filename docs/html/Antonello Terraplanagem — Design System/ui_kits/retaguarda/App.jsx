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
    crumbs.push({ label: 'Ordens de Serviço', here: true });
    screen = <window.OSList />;
  } else if (module === 'orcamentos') {
    crumbs.push({ label: 'Orçamentos', here: true });
    screen = <window.OrcamentosList />;
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
    crumbs.push({ label: 'Manutenção', here: true });
    screen = <window.Manutencao />;
  } else if (module === 'painel') {
    crumbs.push({ label: 'Painel Gerencial', here: true });
    screen = <window.PainelGerencial />;
  } else if (module === 'financeiro') {
    crumbs.push({ label: 'Financeiro', here: true });
    screen = <window.Financeiro />;
  } else if (module === 'custohora') {
    crumbs.push({ label: 'Custo da Hora', here: true });
    screen = <window.CustoHora />;
  } else if (module === 'equipamentos') {
    crumbs.push({ label: 'Equipamentos', here: true });
    screen = <window.EquipamentosList />;
  } else if (module === 'diesel') {
    crumbs.push({ label: 'Diesel', here: true });
    screen = <window.Diesel />;
  } else if (module === 'faturamento') {
    crumbs.push({ label: 'Faturamento', here: true });
    screen = <window.Faturamento />;
  } else if (module === 'parametros') {
    crumbs.push({ label: 'Parâmetros', here: true });
    screen = <window.Parametros />;
  } else if (module === 'sobre') {
    crumbs.push({ label: 'Sobre', here: true });
    screen = <window.Sobre />;
  } else if (module === 'clientes') {
    if (selected) {
      crumbs.push({ label: 'Clientes' }, { label: selected.nome, here: true });
      screen = <window.ClienteDetail cliente={selected} onBack={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Clientes', here: true });
      screen = <window.ClientesList onOpen={setSelected} />;
    }
  } else if (module === 'operadores') {
    if (selected) {
      crumbs.push({ label: 'Operadores' }, { label: selected.nome, here: true });
      screen = <window.OperadorDetail operador={selected} onBack={() => setSelected(null)} />;
    } else {
      crumbs.push({ label: 'Operadores', here: true });
      screen = <window.OperadoresList onOpen={setSelected} />;
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
