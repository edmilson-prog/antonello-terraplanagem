/* Retaguarda — demo data (fictional). Assigned to window.RTG. */
window.RTG = {
  clientes: [
    {
      id: 'valeverde', nome: 'Construtora Vale Verde', fantasia: 'Vale Verde',
      tipo: 'PJ', recorrente: true, ativo: true, segmento: 'Construção civil',
      doc: '12.345.678/0001-90', telefone: '(55) 3312-8800',
      email: 'financeiro@valeverde.com.br', endereco: 'Rua das Indústrias, 480 — Santo Ângelo/RS',
      contato: 'Marcos Feltrin', contatoArea: 'Compras',
      desde: 'mar/2022 · 3 anos', ultimaOS: '08/07/2025',
      faturado: 'R$ 148.500', saldo: 'R$ 32.400', osAtivas: 2, orcAbertos: 3,
    },
    { id: 'essavado', nome: 'Essavado Ltda.', tipo: 'PJ', ativo: true, segmento: 'Terraplenagem', doc: '08.221.114/0001-52', telefone: '(55) 3321-7744', cidade: 'Guarani das Missões/RS', osAtivas: 1, saldo: 'R$ 12.800' },
    { id: 'sul', nome: 'Construtora Sul', tipo: 'PJ', ativo: true, segmento: 'Construção civil', doc: '19.552.803/0001-10', telefone: '(55) 3025-1180', cidade: 'Santa Rosa/RS', osAtivas: 1, saldo: 'R$ 0' },
    { id: 'agrovv', nome: 'Agro Vale Verde', tipo: 'PJ', ativo: true, segmento: 'Agronegócio', doc: '27.104.559/0001-73', telefone: '(55) 99640-2210', cidade: 'Giruá/RS', osAtivas: 1, saldo: 'R$ 4.100' },
    { id: 'boavista', nome: 'Metalúrgica Boa Vista', tipo: 'PJ', ativo: true, segmento: 'Indústria', doc: '11.870.442/0001-06', telefone: '(55) 3512-9090', cidade: 'Santo Ângelo/RS', osAtivas: 0, saldo: 'R$ 0' },
    { id: 'beletti', nome: 'João Beletti', tipo: 'PF', ativo: false, segmento: 'Particular', doc: '702.114.330-55', telefone: '(55) 99988-1201', cidade: 'Ubiretama/RS', osAtivas: 0, saldo: 'R$ 0' },
  ],

  operadores: [
    {
      id: 'adelar', nome: 'Adelar Machado', iniciais: 'AM', ativo: true, app: true, vinculo: 'CLT',
      doc: '044.428.710-86', telefone: '(55) 99912-3040', desde: 'mar/2021 · 4 anos',
      ultimaAtividade: 'Hoje, 07:42', nascimento: '14/09/1985 · 39 anos', cnh: 'Categoria E · válida até 03/2028',
      base: 'Santo Ângelo — RS', horas: '182', osAtivas: 3, osConcluidas: 17, equipamentos: 4,
    },
    { id: 'vilson', nome: 'Vilson Prediger', iniciais: 'VP', ativo: true, app: true, vinculo: 'CLT', doc: '551.209.880-44', telefone: '(55) 99671-8890', base: 'Santo Ângelo — RS', horas: '164', osAtivas: 2 },
    { id: 'nelson', nome: 'Nelson Kunz', iniciais: 'NK', ativo: true, app: true, vinculo: 'CLT', doc: '318.774.560-19', telefone: '(55) 99815-4402', base: 'Giruá — RS', horas: '151', osAtivas: 2 },
    { id: 'ivo', nome: 'Ivo Scherer', iniciais: 'IS', ativo: true, app: false, vinculo: 'PJ', doc: '22.905.118/0001-30', telefone: '(55) 99404-7781', base: 'Santa Rosa — RS', horas: '96', osAtivas: 1 },
    { id: 'darci', nome: 'Darci Bregalda', iniciais: 'DB', ativo: false, app: false, vinculo: 'CLT', doc: '609.330.221-70', telefone: '(55) 99120-6655', base: 'Santo Ângelo — RS', horas: '0', osAtivas: 0 },
  ],

  /* Modules without a built screen yet (shown as a labelled placeholder). */
  placeholders: {
    dashboard: { icon: 'dashboard', label: 'Dashboard' },
    os: { icon: 'clipboard-list', label: 'Ordens de Serviço' },
    comprovantes: { icon: 'receipt', label: 'Comprovantes' },
    equipamentos: { icon: 'truck', label: 'Equipamentos' },
    precos: { icon: 'tag', label: 'Preços' },
    orcamentos: { icon: 'file-text', label: 'Orçamentos' },
    faturamento: { icon: 'file-check', label: 'Faturamento' },
    financeiro: { icon: 'wallet', label: 'Financeiro' },
    custohora: { icon: 'calculator', label: 'Custo da Hora' },
    rentabilidade: { icon: 'trending-up', label: 'Rentabilidade' },
    painel: { icon: 'line-chart', label: 'Painel Gerencial' },
    manutencao: { icon: 'wrench', label: 'Manutenção' },
    diesel: { icon: 'fuel', label: 'Diesel' },
  },
};
