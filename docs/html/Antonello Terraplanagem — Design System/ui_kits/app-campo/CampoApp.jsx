/* App de Campo — protótipo (PIN → Hoje → Apontamento → Confirmação; abas OS/Abastecer/Perfil). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Icon, StatusChip } = NS;

const AC_OS = [
  { n: 'OS-021', t: 'Terraplenagem — lote industrial', cli: 'Essavado Ltda.', eq: 'Escavadeira CAT 320', eqIc: 'truck', h0: 4218.0, local: 'Distrito Industrial — Santo Ângelo/RS', ini: '01/07', prevH: 80, doneH: 62, escopo: 'Corte e aterro do platô (2.400 m²), conformação de taludes e compactação. Bota-fora no depósito da obra.' },
  { n: 'OS-019', t: 'Abertura de acesso e drenagem', cli: 'Construtora Sul', eq: 'Retroescavadeira JCB 3CX', eqIc: 'tractor', h0: 1888.0, local: 'Linha Cascalho — Santa Rosa/RS', ini: '24/06', prevH: 40, doneH: 28, escopo: 'Abertura de 340 m de acesso com cascalhamento e valas de drenagem nas laterais.' },
  { n: 'OS-024', t: 'Nivelamento de pátio', cli: 'Agro Vale Verde', eq: 'Pá Carregadeira XCMG', eqIc: 'forklift', h0: 998.0, local: 'Sede — Giruá/RS', ini: '05/07', prevH: 24, doneH: 8, escopo: 'Regularização e compactação do pátio de manobra junto aos silos.' },
];
const fmtH = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const AC_HIST = [
  { d: 'Ontem · qui, 10/07', rows: [
    { os: 'OS-021', eq: 'Escavadeira CAT 320', eqIc: 'truck', hm: '4.210,0 → 4.218,0', h: '8,0 h', sync: true },
    { os: 'OS-019', eq: 'Retro JCB 3CX', eqIc: 'tractor', hm: '1.885,0 → 1.888,0', h: '3,0 h', sync: true },
  ]},
  { d: 'qua, 09/07', rows: [
    { os: 'OS-021', eq: 'Escavadeira CAT 320', eqIc: 'truck', hm: '4.203,0 → 4.210,0', h: '7,5 h', sync: true },
  ]},
  { d: 'ter, 08/07', rows: [
    { os: 'OS-024', eq: 'Pá Carregadeira XCMG', eqIc: 'forklift', hm: '990,0 → 998,0', h: '8,0 h', sync: true },
    { os: 'OS-019', eq: 'Retro JCB 3CX', eqIc: 'tractor', hm: '1.882,0 → 1.885,0', h: '3,0 h', sync: true },
  ]},
  { d: 'seg, 07/07', rows: [
    { os: 'OS-021', eq: 'Escavadeira CAT 320', eqIc: 'truck', hm: '4.195,0 → 4.203,0', h: '8,0 h', sync: true },
  ]},
];

const AC_NOTIF = [
  { d: 'Hoje', rows: [
    { ic: 'clipboard-list', t: 'Nova OS atribuída a você', m: 'OS-024 · Nivelamento de pátio — Agro Vale Verde', hr: '07:38', unread: true, os: 'OS-024' },
    { ic: 'wrench', t: 'Manutenção agendada', m: 'CAT 320 · plano 4.300 h — leve para a base sexta à tarde', hr: '07:15', unread: true },
  ]},
  { d: 'Ontem', rows: [
    { ic: 'check', t: 'Apontamento aprovado', m: 'OS-021 · 8,0 h de quinta confirmadas pela retaguarda', hr: '18:22', unread: false, os: 'OS-021' },
    { ic: 'gauge', t: 'Lembrete de apontamento', m: 'Você iniciou a OS-019 às 07:40 e não apontou até as 17h', hr: '17:00', unread: false, os: 'OS-019' },
  ]},
  { d: 'qua, 09/07', rows: [
    { ic: 'fuel', t: 'Abastecimento registrado', m: '120 L · Escavadeira CAT 320 — tanque interno', hr: '11:45', unread: false },
    { ic: 'circle-alert', t: 'Correção solicitada', m: 'OS-019 · confira o horímetro final de terça (1.885,0)', hr: '09:10', unread: false, os: 'OS-019' },
  ]},
];

const AC_CHK = [
  { t: 'Nível de óleo e água', m: 'Motor e hidráulico dentro da faixa' },
  { t: 'Vazamentos visíveis', m: 'Mangueiras, cilindros e comandos' },
  { t: 'Material rodante / pneus', m: 'Esteiras, sapatas ou calibragem' },
  { t: 'Luzes e alarme de ré', m: 'Faróis, giroflex e sinal sonoro' },
  { t: 'Cinto de segurança', m: 'Trava e retenção funcionando' },
  { t: 'Extintor de incêndio', m: 'Carga válida e lacre intacto' },
  { t: 'Espelhos e cabine', m: 'Visão limpa, vidros e retrovisores' },
  { t: 'Horímetro funcionando', m: 'Registrando horas normalmente' },
];

const AC_RDO_PREV = [
  { d: 'Ontem · qui, 10/07', clima: 'Sol · Sol', eq: 3, h: '11,0 h' },
  { d: 'qua, 09/07', clima: 'Nublado · Chuva', eq: 2, h: '7,5 h' },
];
const AC_CLIMAS = [['sol', 'sun', 'Sol'], ['nublado', 'cloud', 'Nublado'], ['chuva', 'cloud-rain', 'Chuva']];

const AC_MNT_TIPOS = [
  ['hidraulico', 'wrench', 'Hidráulico', 'Vazamento, comando lento, mangueira'],
  ['motor', 'gauge', 'Motor', 'Falha, fumaça, superaquecimento'],
  ['rodante', 'truck', 'Material rodante', 'Esteira, sapata, pneu, rolete'],
  ['eletrica', 'circle-alert', 'Elétrica', 'Luzes, alarme de ré, painel'],
  ['outro', 'file-text', 'Outro', 'Descreva na observação'],
];

const AC_BASE = [-28.2965, -54.266];
const AC_ROTAS = {
  'OS-021': { dest: [-28.318, -54.243], via: [[-28.301, -54.259], [-28.309, -54.251]], km: '12,4 km', min: '18 min' },
  'OS-019': { dest: [-28.276, -54.297], via: [[-28.289, -54.279], [-28.281, -54.291]], km: '8,7 km', min: '14 min' },
  'OS-024': { dest: [-28.328, -54.286], via: [[-28.308, -54.272], [-28.319, -54.281]], km: '15,2 km', min: '22 min' },
};

const AC_SEG = [
  { id: 's1', sev: 'critico', ic: 'circle-alert', t: 'Rede elétrica energizada a 8 m', m: 'OS-021 · setor leste do platô — altura máxima da lança 6 m, sinaleiro obrigatório' },
  { id: 's2', sev: 'atencao', ic: 'cloud-rain', t: 'Chuva prevista para a tarde', m: 'Talude do platô norte fica instável — mantenha a máquina afastada da crista' },
  { id: 's3', sev: 'atencao', ic: 'hard-hat', t: 'Visita técnica do cliente às 14h', m: 'OS-019 · EPI completo e área de manobra sinalizada durante a visita' },
];
const AC_DDS = { tema: 'Trabalho próximo a redes elétricas', pontos: ['Distância mínima de 3 m de cabos energizados', 'Sinaleiro sempre em contato visual com o operador', 'Em contato acidental: não desça da máquina, afaste com a própria máquina'] };

const AC_FICHA = {
  'Escavadeira CAT 320': { ano: '2019', serie: 'CAT0320-8842', consumo: '14,2 L/h', prox: 'Plano 4.300 h', proxIn: 'em 82 h', proxPct: 58, mnts: [['02/07', 'Plano 4.200 h — filtros e graxa'], ['14/05', 'Troca de dente da caçamba']] },
  'Retroescavadeira JCB 3CX': { ano: '2021', serie: 'JCB3CX-1107', consumo: '9,8 L/h', prox: 'Plano 2.000 h', proxIn: 'em 105 h', proxPct: 48, mnts: [['20/06', 'Revisão de freios'], ['02/04', 'Plano 1.800 h — óleos e filtros']] },
  'Pá Carregadeira XCMG': { ano: '2018', serie: 'XCMG-LW300-553', consumo: '11,5 L/h', prox: 'Plano 1.000 h', proxIn: 'vencida · −18 h', proxPct: 100, late: true, mnts: [['08/07', 'Corretiva — comando hidráulico (em andamento)'], ['12/06', 'Plano 900 h — óleos e filtros']] },
};

const AC_PAR_MOTIVOS = [
  ['chuva', 'cloud-rain', 'Chuva', 'Frente paralisada por clima'],
  ['caminhao', 'truck', 'Aguardando caminhão', 'Sem basculante para carregar'],
  ['quebra', 'wrench', 'Quebra de máquina', 'Parada por defeito ou manutenção'],
  ['liberacao', 'clock', 'Aguardando liberação', 'Frente, topografia ou cliente'],
  ['outro', 'file-text', 'Outro', 'Descreva na observação'],
];
const AC_PAR_PREV = [
  { d: 'Ontem · qui, 10/07', m: 'Chuva', h: '1,5 h', os: 'OS-021' },
  { d: 'ter, 08/07', m: 'Aguardando caminhão', h: '0,5 h', os: 'OS-024' },
];

const AC_ESP = {
  mes: 'jul/2025', base: 76.0, dias: 10, fecha: '31/07', confira: '28/07',
  porOS: [['OS-021', 'Terraplenagem — lote industrial', 46.5], ['OS-019', 'Abertura de acesso e drenagem', 21.5], ['OS-024', 'Nivelamento de pátio', 8.0]],
  semanas: [['S1 · 01–04/07', 26.0], ['S2 · 07–11/07', 50.0]],
};

const AC_ESC = [
  { d: 'sáb, 12/07', tag: 'amanhã', os: null, ic: 'wrench', t: 'Manutenção na base', m: 'Levar a CAT 320 — plano 4.300 h · meio turno' },
  { d: 'seg, 14/07', os: 'OS-021', ic: 'truck', t: 'Terraplenagem — lote industrial', m: 'Essavado · Distrito Industrial · CAT 320' },
  { d: 'ter, 15/07', os: 'OS-021', ic: 'truck', t: 'Terraplenagem — lote industrial', m: 'Essavado · Distrito Industrial · CAT 320' },
  { d: 'qua, 16/07', os: 'OS-024', ic: 'forklift', t: 'Nivelamento de pátio', m: 'Agro Vale Verde · Giruá · Pá XCMG', mud: true },
  { d: 'qui, 17/07', os: 'OS-019', ic: 'tractor', t: 'Abertura de acesso e drenagem', m: 'Construtora Sul · Linha Cascalho · JCB 3CX' },
  { d: 'sex, 18/07', os: 'OS-019', ic: 'tractor', t: 'Abertura de acesso e drenagem', m: 'Construtora Sul · Linha Cascalho · JCB 3CX' },
];

const AC_VIA_MAT = [['bota', 'Bota-fora'], ['cascalho', 'Cascalho'], ['argila', 'Argila']];
const AC_VIA_ROTA = {
  'OS-021': { dest: 'Depósito de bota-fora da obra', km: 3.2 },
  'OS-019': { dest: 'Jazida de cascalho — Linha Sul', km: 5.8 },
  'OS-024': { dest: 'Pátio de descarte — sede', km: 1.4 },
};

const AC_MOB_TIPOS = [['mob', 'Mobilização'], ['desmob', 'Desmobilização'], ['transf', 'Transferência']];
const AC_MOB_KM = { 'OS-021': 12.4, 'OS-019': 8.7, 'OS-024': 15.2 };

function CampoApp() {
  const [screen, setScreen] = React.useState('pin');
  const [tab, setTab] = React.useState('hoje');
  const [pin, setPin] = React.useState('');
  const [os, setOs] = React.useState(AC_OS[0]);
  const [hf, setHf] = React.useState(AC_OS[0].h0 + 8);
  const [litros, setLitros] = React.useState(120);
  const [chk, setChk] = React.useState({});
  const [climaM, setClimaM] = React.useState('sol');
  const [climaT, setClimaT] = React.useState(null);
  const [equipe, setEquipe] = React.useState(3);
  const [mntTipo, setMntTipo] = React.useState(null);
  const [mntUrg, setMntUrg] = React.useState('pode');
  const [parMotivo, setParMotivo] = React.useState(null);
  const [parDur, setParDur] = React.useState(1);
  const [espOk, setEspOk] = React.useState(false);
  const [espDiv, setEspDiv] = React.useState(false);
  const [viaMat, setViaMat] = React.useState('bota');
  const [viaCount, setViaCount] = React.useState(4);
  const [viaLast, setViaLast] = React.useState('10:20');
  const [mobTipo, setMobTipo] = React.useState('mob');
  const [mobKm, setMobKm] = React.useState(12);
  const [sigName, setSigName] = React.useState('');
  const [hasSig, setHasSig] = React.useState(false);
  const sigCanvas = React.useRef(null);
  const sigDrawing = React.useRef(false);
  const mapaEl = React.useRef(null);
  const mapaObj = React.useRef(null);
  const [mapErr, setMapErr] = React.useState(false);

  React.useEffect(() => {
    if (screen !== 'mapa') {
      if (mapaObj.current) { mapaObj.current.remove(); mapaObj.current = null; }
      return;
    }
    let dead = false;
    function init() {
      if (dead || !mapaEl.current || mapaObj.current || !window.L) return;
      const L = window.L;
      const r = AC_ROTAS[os.n] || AC_ROTAS['OS-021'];
      const map = L.map(mapaEl.current, { zoomControl: false });
      map.attributionControl.setPosition('topright');
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: 'Imagens © Esri' }).addTo(map);
      const pts = [AC_BASE, ...r.via, r.dest];
      L.polyline(pts, { color: '#ffb300', weight: 4, dashArray: '1 11', lineCap: 'round', opacity: 0.95 }).addTo(map);
      L.marker(AC_BASE, { icon: L.divIcon({ className: 'acm-pin', html: '<div class="bx bx--base"><svg viewBox="0 0 24 24" fill="none" stroke="#ffb300" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 20h18"/><path d="M6 20v-4h4v4"/><path d="m10 16 3-7 5 4v3"/></svg></div><div class="tl tl--base"></div>', iconSize: [30, 38], iconAnchor: [15, 38] }) }).addTo(map);
      L.marker(r.dest, { icon: L.divIcon({ className: 'acm-pin', html: '<div class="bx"><svg viewBox="0 0 24 24" fill="none" stroke="#16140f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg></div><div class="tl"></div>', iconSize: [30, 38], iconAnchor: [15, 38] }) }).addTo(map);
      map.fitBounds(L.latLngBounds(pts).pad(0.22));
      mapaObj.current = map;
    }
    if (window.L) init();
    else {
      if (!document.getElementById('leaflet-css')) {
        const css = document.createElement('link');
        css.id = 'leaflet-css'; css.rel = 'stylesheet';
        css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }
      let s = document.getElementById('leaflet-js');
      if (!s) {
        s = document.createElement('script');
        s.id = 'leaflet-js'; s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        document.head.appendChild(s);
      }
      s.addEventListener('load', init);
      s.addEventListener('error', () => { if (!dead) setMapErr(true); });
    }
    return () => { dead = true; if (mapaObj.current) { mapaObj.current.remove(); mapaObj.current = null; } };
  }, [screen, os]);
  const [okInfo, setOkInfo] = React.useState(null);
  const [hoje, setHoje] = React.useState([{ os: 'OS-019', h: '5,5 h' }]);
  const [lidas, setLidas] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [segAck, setSegAck] = React.useState({});
  const [ddsOk, setDdsOk] = React.useState(false);
  const [syncedAll, setSyncedAll] = React.useState(false);
  const [lastSync, setLastSync] = React.useState('07:42');
  const naoLidas = lidas ? 0 : AC_NOTIF.reduce((s, g) => s + g.rows.filter((r) => r.unread).length, 0);

  function key(d) {
    if (pin.length >= 4) return;
    const p = pin + d;
    setPin(p);
    if (p.length === 4) setTimeout(() => { setScreen('app'); setTab('hoje'); setPin(''); }, 250);
  }
  function openApont(o) { setOs(o); setHf(o.h0 + 8); setScreen('apontar'); }
  function openDet(o) { setOs(o); setScreen('osdet'); }
  function openChk(o) { setOs(o); setChk({}); setScreen('chk'); }
  function openRdo(o) { setOs(o); setScreen('rdo'); }
  function openMnt(o) { setOs(o); setMntTipo(null); setMntUrg('pode'); setScreen('mnt'); }
  function openPar(o) { setOs(o); setParMotivo(null); setParDur(1); setScreen('par'); }
  function openMob(o) { setOs(o); setMobTipo('mob'); setMobKm(AC_MOB_KM[o.n] || 12); setScreen('mob'); }
  function mobTrajeto(o, t) {
    const obra = o.local.split(' — ')[0];
    if (t === 'desmob') return obra + ' → Base Antonello';
    if (t === 'transf') return obra + ' → outra obra';
    return 'Base Antonello → ' + obra;
  }
  function confirmMob() {
    const tp = (AC_MOB_TIPOS.find((x) => x[0] === mobTipo) || [])[1];
    setOkInfo({
      title: tp + ' registrada',
      lines: [[os.n, os.eq], ['Trajeto', mobTrajeto(os, mobTipo)], ['Percurso', mobKm.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' km de prancha'], ['Registrado', 'no aparelho · sincroniza ao conectar']],
    });
    setScreen('ok');
  }
  function confirmVia() {
    const r = AC_VIA_ROTA[os.n] || AC_VIA_ROTA['OS-021'];
    const m = (AC_VIA_MAT.find((x) => x[0] === viaMat) || [])[1];
    setOkInfo({
      title: 'Viagens registradas',
      lines: [[os.n, os.t], ['Material', m], ['Viagens', viaCount + ' × 12 m³ ≈ ' + (viaCount * 12) + ' m³'], ['Percurso', (viaCount * r.km * 2).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' km rodados']],
    });
    setScreen('ok');
  }
  function confirmPar() {
    const m = (AC_PAR_MOTIVOS.find((t) => t[0] === parMotivo) || [])[2] || '—';
    setOkInfo({
      title: 'Paralisação registrada',
      lines: [[os.n, os.t], ['Motivo', m], ['Duração', fmtH(parDur) + ' h'], ['Registrado', 'sex, 11/07 · no aparelho']],
    });
    setScreen('ok');
  }
  function openSig(o) { setOs(o); setSigName(''); setHasSig(false); setScreen('sig'); }
  function doSync() {
    if (syncing || syncedAll) return;
    setSyncing(true);
    setTimeout(() => { setSyncing(false); setSyncedAll(true); setLastSync('agora'); }, 1400);
  }
  function sigPos(e) {
    const c = sigCanvas.current, r = c.getBoundingClientRect();
    return [(e.clientX - r.left) * (c.width / r.width), (e.clientY - r.top) * (c.height / r.height)];
  }
  function sigDown(e) {
    e.preventDefault();
    const ctx = sigCanvas.current.getContext('2d');
    ctx.strokeStyle = '#f0eee6'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const [x, y] = sigPos(e);
    sigDrawing.current = true;
    sigCanvas.current.setPointerCapture(e.pointerId);
    ctx.beginPath(); ctx.moveTo(x, y);
  }
  function sigMove(e) {
    if (!sigDrawing.current) return;
    const ctx = sigCanvas.current.getContext('2d');
    const [x, y] = sigPos(e);
    ctx.lineTo(x, y); ctx.stroke();
    if (!hasSig) setHasSig(true);
  }
  function sigUp() { sigDrawing.current = false; }
  function sigClear() {
    const c = sigCanvas.current;
    c.getContext('2d').clearRect(0, 0, c.width, c.height);
    setHasSig(false);
  }
  function confirmSig() {
    const feitasHoje = hoje.filter((a) => a.os === os.n).reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
    setOkInfo({
      title: 'Medição assinada',
      lines: [[os.n, 'Medição #2 · 01/07 – 11/07'], ['Responsável', sigName + ' — ' + os.cli], ['Horas no período', fmtH(os.doneH + feitasHoje) + ' h'], ['Assinado', 'no aparelho · sex, 11/07']],
    });
    setScreen('ok');
  }
  function confirmMnt() {
    const tipo = (AC_MNT_TIPOS.find((t) => t[0] === mntTipo) || [])[2] || '—';
    setOkInfo({
      title: 'Solicitação enviada',
      lines: [[os.n, os.eq], ['Tipo', tipo], ['Urgência', mntUrg === 'parado' ? 'Máquina parada' : 'Pode aguardar'], ['Horímetro', fmtH(os.h0)]],
    });
    setScreen('ok');
  }
  function confirmRdo() {
    const lb = (v) => (AC_CLIMAS.find((c) => c[0] === v) || [])[2] || '—';
    const hHoje = hoje.reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
    setOkInfo({
      title: 'Diário registrado',
      lines: [[os.n, 'sex, 11/07'], ['Clima', lb(climaM) + ' · ' + lb(climaT)], ['Equipe', equipe + ' pessoas'], ['Horas de máquina', fmtH(hHoje) + ' h']],
    });
    setScreen('ok');
  }
  function confirmChk() {
    const noks = Object.values(chk).filter((v) => v === 'nok').length;
    setOkInfo({
      title: noks > 0 ? 'Checklist com pendências' : 'Checklist concluído',
      lines: [[os.n, os.eq], ['Conformes', (AC_CHK.length - noks) + ' de ' + AC_CHK.length], ...(noks > 0 ? [['Não conformes', noks + (noks === 1 ? ' item — manutenção notificada' : ' itens — manutenção notificada')]] : [])],
    });
    setScreen('ok');
  }
  function confirmApont() {
    const hrs = fmtH(hf - os.h0) + ' h';
    setHoje((h) => [...h, { os: os.n, h: hrs }]);
    setOkInfo({ title: 'Apontamento registrado', lines: [[os.n, os.eq], ['Horímetro', fmtH(os.h0) + ' → ' + fmtH(hf)], ['Horas', hrs]] });
    setScreen('ok');
  }
  function confirmDiesel() {
    setOkInfo({ title: 'Abastecimento registrado', lines: [[os.n, os.eq], ['Litros', litros + ' L'], ['Horímetro', fmtH(os.h0)]] });
    setScreen('ok');
  }

  /* ---------- PIN ---------- */
  if (screen === 'pin') {
    return (
      <div className="ac-app" data-screen-label="Login por PIN">
        <div className="ac-pin">
          <div className="brand">
            <img src="../../assets/logo-tile.svg" alt="" />
            <b>APP DE CAMPO<small>ANTONELLO TERRAPLANAGEM</small></b>
            <span className="who">Adelar Machado · Operador</span>
          </div>
          <div className="ac-dots">{[0, 1, 2, 3].map((i) => <i key={i} className={i < pin.length ? 'on' : ''}></i>)}</div>
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted-2)' }}>Digite seu PIN de 4 dígitos</div>
          <div className="ac-pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => <button key={d} type="button" className="ac-key" onClick={() => key(String(d))}>{d}</button>)}
            <span></span>
            <button type="button" className="ac-key" onClick={() => key('0')}>0</button>
            <button type="button" className="ac-key ac-key--mute" aria-label="Apagar" onClick={() => setPin(pin.slice(0, -1))}><Icon name="arrow-left" size={20} /></button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Apontamento ---------- */
  if (screen === 'apontar') {
    return (
      <div className="ac-app" data-screen-label="Apontamento">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('osdet')}><Icon name="arrow-left" size={18} /></button>
          <b>Apontamento</b>
          <span className="osn">{os.n}</span>
        </div>
        <div className="ac-scroll">
          <div className="ac-field">
            <span className="k">Equipamento</span>
            <div className="ac-eq">
              <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={os.eqIc} size={18} /></span>
              <b>{os.eq}</b>
              <span className="hm">início {fmtH(os.h0)}</span>
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Horímetro final</span>
            <div className="ac-stepper">
              <button type="button" aria-label="Diminuir" onClick={() => setHf(Math.max(os.h0, hf - 0.5))}>−</button>
              <div className="val"><b>{fmtH(hf)}</b><span>horas máquina</span></div>
              <button type="button" aria-label="Aumentar" onClick={() => setHf(hf + 0.5)}>+</button>
            </div>
          </div>
          <div className="ac-calc"><Icon name="clock" size={17} /><b>{fmtH(hf - os.h0)} h</b><span>trabalhadas nesta OS hoje</span></div>
          <div className="ac-field ac-obs">
            <span className="k">Observação (opcional)</span>
            <textarea placeholder="Ex.: chuva no fim da tarde, troca de frente…"></textarea>
          </div>
          <button type="button" className="ac-big" disabled={hf <= os.h0} onClick={confirmApont}><Icon name="check" size={18} strokeWidth={2.2} />Confirmar apontamento</button>
        </div>
      </div>
    );
  }

  /* ---------- Sucesso ---------- */
  if (screen === 'ok') {
    return (
      <div className="ac-app" data-screen-label="Confirmação">
        <div className="ac-ok">
          <div className="ic"><Icon name="circle-check-big" size={36} /></div>
          <h2>{okInfo.title}</h2>
          <div className="sum">{okInfo.lines.map(([k, v], i) => <div key={i}>{k} · <b>{v}</b></div>)}</div>
          <span className="off"><Icon name="smartphone" size={13} />Salvo no aparelho — sincroniza ao conectar</span>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 9, marginTop: 10 }}>
            <button type="button" className="ac-big" onClick={() => setScreen('app')}>Voltar ao início</button>
            <button type="button" className="ac-big ac-big--ghost" onClick={() => openApont(os)}>Novo apontamento</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Detalhe da OS ---------- */
  if (screen === 'osdet') {
    const feitasHoje = hoje.filter((a) => a.os === os.n).reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
    const done = os.doneH + feitasHoje;
    const pct = Math.min(100, Math.round((done / os.prevH) * 100));
    const apts = [
      ...hoje.filter((a) => a.os === os.n).map((a) => ({ d: 'hoje', hm: null, h: a.h, sync: syncedAll })).reverse(),
      ...AC_HIST.flatMap((g) => g.rows.filter((r) => r.os === os.n).map((r) => ({ d: g.d.replace('Ontem · ', ''), hm: r.hm, h: r.h, sync: true }))),
    ].slice(0, 4);
    return (
      <div className="ac-app" data-screen-label="Detalhe da OS">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('app')}><Icon name="arrow-left" size={18} /></button>
          <b>Ordem de Serviço</b>
          <span className="osn">{os.n}</span>
        </div>
        <div className="ac-scroll" style={{ paddingBottom: 12 }}>
          <div className="ac-card ac-active" style={{ marginBottom: 14 }}>
            <div className="top">{os.n === 'OS-024'
              ? <StatusChip tone="info" led>Aberta</StatusChip>
              : <StatusChip tone="amber" led>Em andamento</StatusChip>}</div>
            <h3>{os.t}</h3>
            <div className="meta" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 7 }}>
              <span><Icon name="user" size={12} />{os.cli}</span>
              <span><Icon name="map-pin" size={12} />{os.local}</span>
              <span><Icon name="calendar" size={12} />desde {os.ini}</span>
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Equipamento</span>
            <div className="ac-eq">
              <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={os.eqIc} size={18} /></span>
              <b>{os.eq}</b>
              <span className="hm">horím. {fmtH(os.h0)}</span>
            </div>
            <button type="button" className="ac-chk-open" onClick={() => setScreen('eqf')}>
              <Icon name="truck" size={16} />Ficha do equipamento<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button type="button" className="ac-chk-open" onClick={() => openChk(os)}>
              <Icon name="circle-check-big" size={16} />Fazer checklist de pré-uso<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button type="button" className="ac-chk-open" onClick={() => openRdo(os)}>
              <Icon name="file-text" size={16} />Diário de obra · hoje<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button type="button" className="ac-chk-open" onClick={() => openMnt(os)}>
              <Icon name="wrench" size={16} />Solicitar manutenção<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button type="button" className="ac-chk-open" onClick={() => openPar(os)}>
              <Icon name="ban" size={16} />Registrar paralisação<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button type="button" className="ac-chk-open" onClick={() => setScreen('via')}>
              <Icon name="truck" size={16} />Viagens de basculante<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button type="button" className="ac-chk-open" onClick={() => openMob(os)}>
              <Icon name="forklift" size={16} />Mobilização · prancha<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button type="button" className="ac-chk-open" onClick={() => openSig(os)}>
              <Icon name="pencil" size={16} />Medição · assinatura do cliente<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
            </button>
            <button type="button" className="ac-chk-open" onClick={() => setScreen('mapa')}>
              <Icon name="map-pin" size={16} />Mapa da obra · como chegar<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
            </button>
          </div>
          <div className="ac-field">
            <span className="k">Progresso</span>
            <div className="ac-prog">
              <div className="row"><b>{fmtH(done)} h</b><span>de {os.prevH} h previstas · {pct}%</span></div>
              <div className="bar"><i style={{ width: pct + '%' }}></i></div>
            </div>
          </div>
          <div className="ac-sec">Meus apontamentos nesta OS</div>
          <div className="ac-card" style={{ marginBottom: 14 }}>
            {apts.length === 0 && <div className="ac-osrow" style={{ cursor: 'default' }}><div className="bd"><div className="m">Nenhum apontamento seu ainda.</div></div></div>}
            {apts.map((a, i) => (
              <div className="ac-osrow" key={i} style={{ cursor: 'default' }}>
                <span className="atp-tile atp-tile--muted" style={{ width: 34, height: 34 }}><Icon name="clock" size={16} /></span>
                <div className="bd"><div className="t">{a.d}</div><div className="m">{a.hm ? <span className="mono">{a.hm}</span> : 'registrado hoje'}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <b style={{ font: '600 13px var(--font-mono)' }}>{a.h}</b>
                  <span className={a.sync ? 'ac-syncmini' : 'ac-syncmini ac-syncmini--pend'}>
                    <Icon name={a.sync ? 'check' : 'clock'} size={10} strokeWidth={2.4} />{a.sync ? 'sincronizado' : 'no aparelho'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="ac-field">
            <span className="k">Escopo</span>
            <div className="ac-escopo">{os.escopo}</div>
          </div>
        </div>
        <div className="ac-det-actions">
          <button type="button" className="ac-big" onClick={() => openApont(os)}><Icon name="gauge" size={18} />Apontar horas</button>
          <button type="button" className="ac-big ac-big--ghost" onClick={() => { setScreen('app'); setTab('fuel'); }}><Icon name="fuel" size={17} />Abastecer</button>
        </div>
      </div>
    );
  }

  /* ---------- Checklist do equipamento ---------- */
  if (screen === 'chk') {
    const done = Object.keys(chk).length;
    const noks = Object.values(chk).filter((v) => v === 'nok').length;
    return (
      <div className="ac-app" data-screen-label="Checklist do equipamento">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('osdet')}><Icon name="arrow-left" size={18} /></button>
          <b>Checklist</b>
          <span className="osn">{done}/{AC_CHK.length}</span>
        </div>
        <div className="ac-scroll" style={{ paddingBottom: 12 }}>
          <div className="ac-field">
            <span className="k">Pré-uso · hoje</span>
            <div className="ac-eq">
              <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={os.eqIc} size={18} /></span>
              <b>{os.eq}</b>
              <span className="hm">horím. {fmtH(os.h0)}</span>
            </div>
          </div>
          <div className="ac-card">
            {AC_CHK.map((it, i) => (
              <div className="ac-chk" key={i}>
                <div className="bd">
                  <div className="t">{it.t}</div>
                  <div className="m">{it.m}</div>
                </div>
                <div className="btns">
                  <button type="button" aria-label="Conforme" className={chk[i] === 'ok' ? 'ok on' : 'ok'} onClick={() => setChk({ ...chk, [i]: 'ok' })}><Icon name="check" size={18} strokeWidth={2.4} /></button>
                  <button type="button" aria-label="Não conforme" className={chk[i] === 'nok' ? 'nok on' : 'nok'} onClick={() => setChk({ ...chk, [i]: 'nok' })}><Icon name="ban" size={16} strokeWidth={2.2} /></button>
                </div>
              </div>
            ))}
          </div>
          {noks > 0 && (
            <div className="ac-chk-warn"><Icon name="circle-alert" size={15} />Itens não conformes serão enviados à <b>Manutenção</b> ao confirmar.</div>
          )}
          <div style={{ marginTop: 14 }}>
            <button type="button" className="ac-big" disabled={done < AC_CHK.length} onClick={confirmChk}>
              <Icon name="check" size={18} strokeWidth={2.2} />{done < AC_CHK.length ? `Responda os ${AC_CHK.length} itens` : 'Concluir checklist'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Diário de obra (RDO) ---------- */
  if (screen === 'rdo') {
    return (
      <div className="ac-app" data-screen-label="Diário de obra">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('osdet')}><Icon name="arrow-left" size={18} /></button>
          <b>Diário de obra</b>
          <span className="osn">{os.n}</span>
        </div>
        <div className="ac-scroll" style={{ paddingBottom: 12 }}>
          <div className="ac-field">
            <span className="k">Hoje · sex, 11/07</span>
            <div className="ac-eq">
              <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name="map-pin" size={17} /></span>
              <b style={{ fontSize: 13 }}>{os.local}</b>
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Clima — manhã</span>
            <div className="ac-seg">
              {AC_CLIMAS.map(([id, ic, lb]) => (
                <button type="button" key={id} className={climaM === id ? 'on' : ''} onClick={() => setClimaM(id)}><Icon name={ic} size={17} />{lb}</button>
              ))}
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Clima — tarde</span>
            <div className="ac-seg">
              {AC_CLIMAS.map(([id, ic, lb]) => (
                <button type="button" key={id} className={climaT === id ? 'on' : ''} onClick={() => setClimaT(id)}><Icon name={ic} size={17} />{lb}</button>
              ))}
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Equipe em campo</span>
            <div className="ac-stepper">
              <button type="button" aria-label="Diminuir" onClick={() => setEquipe(Math.max(1, equipe - 1))}>−</button>
              <div className="val"><b>{equipe}</b><span>pessoas</span></div>
              <button type="button" aria-label="Aumentar" onClick={() => setEquipe(equipe + 1)}>+</button>
            </div>
          </div>
          <div className="ac-field ac-obs">
            <span className="k">Atividades executadas</span>
            <textarea placeholder="Ex.: corte e aterro no platô norte, 2 viagens de bota-fora…"></textarea>
          </div>
          <div className="ac-field ac-obs">
            <span className="k">Ocorrências (opcional)</span>
            <textarea placeholder="Ex.: chuva paralisou a frente das 14h às 15h30…"></textarea>
          </div>
          <div className="ac-field">
            <span className="k">Foto da frente de serviço</span>
            <div style={{ height: 150, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <image-slot id={'rdo-' + os.n} shape="rect" placeholder="Toque ou arraste a foto do dia"></image-slot>
            </div>
          </div>
          <button type="button" className="ac-big" disabled={!climaT} onClick={confirmRdo}>
            <Icon name="check" size={18} strokeWidth={2.2} />{climaT ? 'Enviar diário de hoje' : 'Informe o clima da tarde'}
          </button>
          <div className="ac-sec">Diários anteriores desta OS</div>
          <div className="ac-card">
            {AC_RDO_PREV.map((r, i) => (
              <div className="ac-osrow" key={i} style={{ cursor: 'default' }}>
                <span className="atp-tile atp-tile--muted" style={{ width: 34, height: 34 }}><Icon name="file-text" size={16} /></span>
                <div className="bd"><div className="t">{r.d}</div><div className="m">{r.clima} · {r.eq} pessoas · {r.h}</div></div>
                <span className="ac-syncmini"><Icon name="check" size={10} strokeWidth={2.4} />enviado</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Solicitar manutenção ---------- */
  if (screen === 'mnt') {
    return (
      <div className="ac-app" data-screen-label="Solicitar manutenção">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('osdet')}><Icon name="arrow-left" size={18} /></button>
          <b>Solicitar manutenção</b>
          <span className="osn">{os.n}</span>
        </div>
        <div className="ac-scroll" style={{ paddingBottom: 12 }}>
          <div className="ac-field">
            <span className="k">Equipamento</span>
            <div className="ac-eq">
              <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={os.eqIc} size={18} /></span>
              <b>{os.eq}</b>
              <span className="hm">horím. {fmtH(os.h0)}</span>
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Qual o problema?</span>
            <div className="ac-card">
              {AC_MNT_TIPOS.map(([id, ic, t, m]) => (
                <div className="ac-osrow" key={id} onClick={() => setMntTipo(id)} style={{ background: mntTipo === id ? 'var(--surface-2)' : undefined }}>
                  <span className={id === 'eletrica' ? 'atp-tile' : 'atp-tile atp-tile--amber'} style={id === 'eletrica' ? { width: 34, height: 34, background: 'var(--danger-soft)', color: 'var(--danger-fg)' } : { width: 34, height: 34 }}><Icon name={ic} size={17} /></span>
                  <div className="bd"><div className="t">{t}</div><div className="m">{m}</div></div>
                  {mntTipo === id && <Icon name="check" size={17} style={{ color: 'var(--amarelo)' }} />}
                </div>
              ))}
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Urgência</span>
            <div className="ac-seg" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <button type="button" className={mntUrg === 'pode' ? 'on' : ''} onClick={() => setMntUrg('pode')}><Icon name="clock" size={17} />Pode aguardar</button>
              <button type="button" className={mntUrg === 'parado' ? 'on ac-seg-danger' : 'ac-seg-danger'} onClick={() => setMntUrg('parado')}><Icon name="ban" size={17} />Máquina parada</button>
            </div>
          </div>
          {mntUrg === 'parado' && (
            <div className="ac-chk-warn"><Icon name="circle-alert" size={15} />Máquina parada abre chamado <b>corretivo prioritário</b> e avisa a retaguarda na hora.</div>
          )}
          <div className="ac-field ac-obs" style={{ marginTop: 14 }}>
            <span className="k">Observação</span>
            <textarea placeholder="Ex.: vazamento no cilindro da lança, começou hoje cedo…"></textarea>
          </div>
          <div className="ac-field">
            <span className="k">Foto do problema (opcional)</span>
            <div style={{ height: 140, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <image-slot id={'mnt-' + os.n} shape="rect" placeholder="Toque ou arraste uma foto do problema"></image-slot>
            </div>
          </div>
          <button type="button" className="ac-big" disabled={!mntTipo} onClick={confirmMnt}>
            <Icon name="wrench" size={18} />{mntTipo ? 'Enviar solicitação' : 'Selecione o problema'}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Assinatura da medição ---------- */
  if (screen === 'sig') {
    const feitasHoje = hoje.filter((a) => a.os === os.n).reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
    return (
      <div className="ac-app" data-screen-label="Assinatura do cliente">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('osdet')}><Icon name="arrow-left" size={18} /></button>
          <b>Assinatura da medição</b>
          <span className="osn">{os.n}</span>
        </div>
        <div className="ac-scroll" style={{ paddingBottom: 12 }}>
          <div className="ac-field">
            <span className="k">Medição #2 · 01/07 – 11/07</span>
            <div className="ac-card" style={{ padding: '13px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
                <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={os.eqIc} size={17} /></span>
                <div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{os.t}</div><div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 3 }}>{os.cli} · {os.local}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 18, paddingTop: 10, borderTop: '1px solid var(--border-soft)', font: '600 12.5px var(--font-mono)' }}>
                <span>{fmtH(os.doneH + feitasHoje)} h no período</span>
                <span style={{ color: 'var(--muted-2)' }}>{os.eq}</span>
              </div>
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Responsável no cliente</span>
            <input className="ac-input" type="text" value={sigName} placeholder="Nome de quem acompanha a obra" onChange={(e) => setSigName(e.target.value)} />
          </div>
          <div className="ac-field">
            <span className="k" style={{ display: 'flex', alignItems: 'center' }}>Assinatura
              {hasSig && <button type="button" className="ac-marklidas" style={{ padding: 0 }} onClick={sigClear}>Limpar</button>}
            </span>
            <div className="ac-sig">
              <canvas ref={sigCanvas} width={640} height={280}
                onPointerDown={sigDown} onPointerMove={sigMove} onPointerUp={sigUp} onPointerLeave={sigUp}></canvas>
              {!hasSig && <span className="ph"><Icon name="pencil" size={15} />Assine aqui com o dedo</span>}
            </div>
          </div>
          <div className="ac-chk-warn" style={{ background: 'var(--amarelo-soft)', borderColor: 'rgba(255,179,0,.26)', color: 'var(--muted)', marginTop: 0, marginBottom: 14 }}>
            <Icon name="info" size={15} style={{ color: 'var(--amarelo-dim)' }} />A assinatura confirma as <b style={{ color: 'var(--fg)' }}>horas executadas</b> — valores são tratados pela retaguarda.
          </div>
          <button type="button" className="ac-big" disabled={!hasSig || !sigName.trim()} onClick={confirmSig}>
            <Icon name="check" size={18} strokeWidth={2.2} />{!hasSig ? 'Colete a assinatura' : !sigName.trim() ? 'Informe o responsável' : 'Confirmar medição'}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Sincronização / modo offline ---------- */
  if (screen === 'sync') {
    const pend = [
      ...hoje.map((a, i) => ({ ic: 'gauge', t: 'Apontamento · ' + a.os, m: a.h + ' registradas hoje', sz: '2 KB', key: 'a' + i })),
      { ic: 'file-text', t: 'Diário de obra · OS-021', m: 'texto + 1 foto da frente', sz: '1,8 MB', key: 'rdo' },
      { ic: 'pencil', t: 'Assinatura de medição', m: 'Medição #2 · OS-021', sz: '64 KB', key: 'sig' },
    ];
    const online = syncedAll;
    return (
      <div className="ac-app" data-screen-label="Modo offline">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('app')}><Icon name="arrow-left" size={18} /></button>
          <b>Sincronização</b>
          <span className="osn" style={online ? { color: 'var(--success-fg)', background: 'var(--success-soft)', borderColor: 'rgba(76,122,63,.3)' } : undefined}>{online ? 'em dia' : pend.length + ' pendentes'}</span>
        </div>
        <div className="ac-scroll">
          <div className={online ? 'ac-conn ac-conn--on' : 'ac-conn'}>
            <span className="led"></span>
            <div className="bd">
              <b>{syncing ? 'Sincronizando…' : online ? 'Conectado — tudo enviado' : 'Sem conexão no canteiro'}</b>
              <span>{syncing ? 'enviando ' + pend.length + ' itens pela rede' : online ? 'última sincronização · ' + lastSync : 'seus registros ficam salvos no aparelho'}</span>
            </div>
            {!online && !syncing && <Icon name="smartphone" size={20} style={{ color: 'var(--amarelo-dim)' }} />}
            {syncing && <span className="ac-spin"><Icon name="history" size={20} /></span>}
            {online && <Icon name="circle-check-big" size={20} style={{ color: 'var(--success-fg)' }} />}
          </div>
          <div className="ac-tiles" style={{ marginTop: 12 }}>
            <div className="ac-tile"><div className="k">No aparelho</div><div className="v">{online ? 0 : pend.length}<small> itens</small></div></div>
            <div className="ac-tile"><div className="k">Espaço usado</div><div className="v">4,2<small> MB</small></div></div>
          </div>
          <div className="ac-sec">{online ? 'Enviados agora' : 'Fila de envio'}</div>
          <div className="ac-card">
            {pend.map((p) => (
              <div className="ac-osrow" key={p.key} style={{ cursor: 'default' }}>
                <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={p.ic} size={16} /></span>
                <div className="bd"><div className="t">{p.t}</div><div className="m">{p.m}</div></div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                  <span style={{ font: '500 10.5px var(--font-mono)', color: 'var(--muted-2)' }}>{p.sz}</span>
                  <span className={online ? 'ac-syncmini' : 'ac-syncmini ac-syncmini--pend'}>
                    <Icon name={online ? 'check' : 'clock'} size={10} strokeWidth={2.4} />{online ? 'sincronizado' : 'aguardando'}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="ac-chk-warn" style={{ background: 'var(--amarelo-soft)', borderColor: 'rgba(255,179,0,.26)', color: 'var(--muted)', marginTop: 14 }}>
            <Icon name="info" size={15} style={{ color: 'var(--amarelo-dim)' }} />O app funciona <b style={{ color: 'var(--fg)' }}>offline por padrão</b>: tudo é salvo no aparelho e enviado sozinho quando a rede volta. Nada se perde ao fechar o app.
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="ac-big" disabled={syncing || online} onClick={doSync}>
              {syncing ? <span className="ac-spin"><Icon name="history" size={18} /></span> : <Icon name="arrow-up-right" size={18} />}
              {online ? 'Tudo sincronizado' : syncing ? 'Sincronizando…' : 'Tentar sincronizar agora'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Mapa da obra ---------- */
  if (screen === 'mapa') {
    const r = AC_ROTAS[os.n] || AC_ROTAS['OS-021'];
    return (
      <div className="ac-app" data-screen-label="Mapa da obra">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('osdet')}><Icon name="arrow-left" size={18} /></button>
          <b>Mapa da obra</b>
          <span className="osn">{os.n}</span>
        </div>
        <div className="acm-wrap">
          <div ref={mapaEl} className="acm-map"></div>
          {mapErr && <div className="acm-fallback"><div><Icon name="map-pin" size={22} /><br />Mapa indisponível offline — destino: {os.local}</div></div>}
          <div className="acm-info">
            <div className="row">
              <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name="map-pin" size={17} /></span>
              <div className="bd">
                <b>{os.local}</b>
                <span>{os.cli} · {os.t}</span>
              </div>
            </div>
            <div className="row stats">
              <span className="st"><Icon name="truck" size={14} />{r.km}</span>
              <span className="st"><Icon name="clock" size={14} />{r.min} da base</span>
            </div>
            <button type="button" className="ac-big"><Icon name="arrow-up-right" size={18} />Abrir rota no GPS</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Alertas de segurança ---------- */
  if (screen === 'seg') {
    const pend = AC_SEG.filter((a) => !segAck[a.id]).length + (ddsOk ? 0 : 1);
    return (
      <div className="ac-app" data-screen-label="Alertas de segurança">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('app')}><Icon name="arrow-left" size={18} /></button>
          <b>Segurança</b>
          <span className="osn" style={pend === 0 ? { color: 'var(--success-fg)', background: 'var(--success-soft)', borderColor: 'rgba(76,122,63,.3)' } : undefined}>{pend === 0 ? 'tudo ciente' : pend + ' pendentes'}</span>
        </div>
        <div className="ac-scroll">
          <div className="ac-sec" style={{ marginTop: 0 }}>DDS de hoje · sex, 11/07</div>
          <div className="ac-card" style={{ padding: '14px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name="hard-hat" size={17} /></span>
              <b style={{ fontSize: 14 }}>{AC_DDS.tema}</b>
            </div>
            <ul className="ac-dds">
              {AC_DDS.pontos.map((p, i) => <li key={i}><Icon name="check" size={13} strokeWidth={2.4} />{p}</li>)}
            </ul>
            {ddsOk
              ? <div className="ac-ackok"><Icon name="circle-check-big" size={15} />Participação confirmada · agora</div>
              : <button type="button" className="ac-big" style={{ minHeight: 46 }} onClick={() => setDdsOk(true)}><Icon name="check" size={17} strokeWidth={2.2} />Participei do DDS de hoje</button>}
          </div>
          <div className="ac-sec">Alertas ativos</div>
          {AC_SEG.map((a) => {
            const ok = !!segAck[a.id];
            return (
              <div className={a.sev === 'critico' ? 'ac-alert ac-alert--crit' : 'ac-alert'} key={a.id}>
                <div className="row">
                  <span className="ic"><Icon name={a.ic} size={17} /></span>
                  <div className="bd">
                    <div className="tt">{a.t}</div>
                    <div className="mm">{a.m}</div>
                  </div>
                  <span className={a.sev === 'critico' ? 'atp-status atp-status--danger' : 'atp-status atp-status--amber'} style={{ flex: 'none' }}>{a.sev === 'critico' ? 'Crítico' : 'Atenção'}</span>
                </div>
                {ok
                  ? <div className="ac-ackok"><Icon name="circle-check-big" size={15} />Ciente · confirmado agora</div>
                  : <button type="button" className="ac-big ac-big--ghost" style={{ minHeight: 44 }} onClick={() => setSegAck({ ...segAck, [a.id]: true })}><Icon name="check" size={16} strokeWidth={2.2} />Confirmar ciência</button>}
              </div>
            );
          })}
          <div className="ac-chk-warn" style={{ background: 'var(--amarelo-soft)', borderColor: 'rgba(255,179,0,.26)', color: 'var(--muted)', marginTop: 4 }}>
            <Icon name="info" size={15} style={{ color: 'var(--amarelo-dim)' }} />As confirmações ficam registradas na OS e visíveis para a <b style={{ color: 'var(--fg)' }}>retaguarda</b>.
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Ficha do equipamento ---------- */
  if (screen === 'eqf') {
    const f = AC_FICHA[os.eq] || AC_FICHA['Escavadeira CAT 320'];
    return (
      <div className="ac-app" data-screen-label="Ficha do equipamento">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('osdet')}><Icon name="arrow-left" size={18} /></button>
          <b>Equipamento</b>
          <span className="osn">{os.n}</span>
        </div>
        <div className="ac-scroll" style={{ paddingBottom: 12 }}>
          <div style={{ height: 150, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 12 }}>
            <image-slot id={'eqf-' + f.serie} shape="rect" placeholder={'Foto — ' + os.eq}></image-slot>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
            <span className="atp-tile atp-tile--brand" style={{ width: 40, height: 40 }}><Icon name={os.eqIc} size={20} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ font: '800 15px/1.15 var(--font-display)', textTransform: 'uppercase' }}>{os.eq}</div>
              <div style={{ fontSize: 11.5, color: 'var(--muted-2)', marginTop: 3 }}>alocada na {os.n} · {os.cli}</div>
            </div>
            <StatusChip tone="amber" led>Em obra</StatusChip>
          </div>
          <div className="ac-card" style={{ marginBottom: 14 }}>
            <div className="ac-datarow" style={{ borderTop: 'none' }}><Icon name="gauge" size={16} /><span className="k">Horímetro</span><span className="v mono">{fmtH(os.h0)} h</span></div>
            <div className="ac-datarow"><Icon name="calendar" size={16} /><span className="k">Ano</span><span className="v mono">{f.ano}</span></div>
            <div className="ac-datarow"><Icon name="id-card" size={16} /><span className="k">Série</span><span className="v mono">{f.serie}</span></div>
            <div className="ac-datarow"><Icon name="fuel" size={16} /><span className="k">Consumo</span><span className="v mono">{f.consumo} <small style={{ color: 'var(--muted-2)' }}>médio</small></span></div>
          </div>
          <div className="ac-field">
            <span className="k">Próxima manutenção</span>
            <div className="ac-prog">
              <div className="row"><b style={f.late ? { color: 'var(--danger-fg)' } : undefined}>{f.prox}</b><span style={f.late ? { color: 'var(--danger-fg)' } : undefined}>{f.proxIn}</span></div>
              <div className="bar"><i style={{ width: f.proxPct + '%', background: f.late ? 'var(--danger)' : undefined }}></i></div>
            </div>
          </div>
          <div className="ac-sec">Últimas manutenções</div>
          <div className="ac-card" style={{ marginBottom: 14 }}>
            {f.mnts.map(([d, t], i) => (
              <div className="ac-osrow" key={i} style={{ cursor: 'default' }}>
                <span className="atp-tile atp-tile--muted" style={{ width: 34, height: 34 }}><Icon name="wrench" size={16} /></span>
                <div className="bd"><div className="t">{t}</div><div className="m mono">{d}</div></div>
              </div>
            ))}
          </div>
          <button type="button" className="ac-chk-open" onClick={() => openChk(os)}>
            <Icon name="circle-check-big" size={16} />Checklist de pré-uso<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
          </button>
          <button type="button" className="ac-chk-open" onClick={() => openMnt(os)}>
            <Icon name="wrench" size={16} />Solicitar manutenção<Icon name="chevron-right" size={14} style={{ marginLeft: 'auto' }} />
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Registro de paralisação ---------- */
  if (screen === 'par') {
    return (
      <div className="ac-app" data-screen-label="Registro de paralisação">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('osdet')}><Icon name="arrow-left" size={18} /></button>
          <b>Paralisação</b>
          <span className="osn">{os.n}</span>
        </div>
        <div className="ac-scroll" style={{ paddingBottom: 12 }}>
          <div className="ac-field">
            <span className="k">Motivo da parada</span>
            <div className="ac-card">
              {AC_PAR_MOTIVOS.map(([id, ic, t, m]) => (
                <div className="ac-osrow" key={id} onClick={() => setParMotivo(id)} style={{ background: parMotivo === id ? 'var(--surface-2)' : undefined }}>
                  <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={ic} size={17} /></span>
                  <div className="bd"><div className="t">{t}</div><div className="m">{m}</div></div>
                  {parMotivo === id && <Icon name="check" size={17} style={{ color: 'var(--amarelo)' }} />}
                </div>
              ))}
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Duração</span>
            <div className="ac-stepper">
              <button type="button" aria-label="Diminuir" onClick={() => setParDur(Math.max(0.5, parDur - 0.5))}>−</button>
              <div className="val"><b>{fmtH(parDur)} h</b><span>frente parada</span></div>
              <button type="button" aria-label="Aumentar" onClick={() => setParDur(parDur + 0.5)}>+</button>
            </div>
          </div>
          {parMotivo === 'quebra' && (
            <div className="ac-chk-warn"><Icon name="circle-alert" size={15} />Quebra de máquina? Abra também uma <b>solicitação de manutenção</b> na tela do equipamento.</div>
          )}
          <div className="ac-field ac-obs" style={{ marginTop: parMotivo === 'quebra' ? 14 : 0 }}>
            <span className="k">Observação (opcional)</span>
            <textarea placeholder="Ex.: chuva forte das 13h às 14h30, frente alagada…"></textarea>
          </div>
          <div className="ac-chk-warn" style={{ background: 'var(--amarelo-soft)', borderColor: 'rgba(255,179,0,.26)', color: 'var(--muted)', marginTop: 0, marginBottom: 14 }}>
            <Icon name="info" size={15} style={{ color: 'var(--amarelo-dim)' }} />A paralisação entra no <b style={{ color: 'var(--fg)' }}>diário de obra</b> e justifica horas menores na medição.
          </div>
          <button type="button" className="ac-big" disabled={!parMotivo} onClick={confirmPar}>
            <Icon name="check" size={18} strokeWidth={2.2} />{parMotivo ? 'Registrar paralisação' : 'Selecione o motivo'}
          </button>
          <div className="ac-sec">Paralisações recentes</div>
          <div className="ac-card">
            {AC_PAR_PREV.map((p, i) => (
              <div className="ac-osrow" key={i} style={{ cursor: 'default' }}>
                <span className="atp-tile atp-tile--muted" style={{ width: 34, height: 34 }}><Icon name="ban" size={15} /></span>
                <div className="bd"><div className="t">{p.m} · {p.os}</div><div className="m">{p.d}</div></div>
                <b style={{ font: '600 13px var(--font-mono)' }}>{p.h}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Espelho de horas ---------- */
  if (screen === 'esp') {
    const addHoje = hoje.reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0) - 5.5;
    const total = AC_ESP.base + addHoje;
    const media = total / AC_ESP.dias;
    const maxOS = Math.max(...AC_ESP.porOS.map(([, , h]) => h));
    return (
      <div className="ac-app" data-screen-label="Espelho de horas">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('app')}><Icon name="arrow-left" size={18} /></button>
          <b>Espelho de horas</b>
          <span className="osn">{AC_ESP.mes}</span>
        </div>
        <div className="ac-scroll" style={{ paddingBottom: 12 }}>
          <div className="ac-tiles" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
            <div className="ac-tile"><div className="k">No mês</div><div className="v">{fmtH(total)}<small> h</small></div></div>
            <div className="ac-tile"><div className="k">Dias</div><div className="v">{AC_ESP.dias}</div></div>
            <div className="ac-tile"><div className="k">Média/dia</div><div className="v">{fmtH(media)}<small> h</small></div></div>
          </div>
          <div className="ac-sec">Por ordem de serviço</div>
          <div className="ac-card">
            {AC_ESP.porOS.map(([n, t, h]) => (
              <div className="ac-osrow" key={n} style={{ cursor: 'default' }}>
                <span className="osn" style={{ width: 'auto' }}>{n}</span>
                <div className="bd">
                  <div className="t">{t}</div>
                  <div style={{ height: 4, borderRadius: 2, background: 'var(--surface-2)', marginTop: 7 }}><i style={{ display: 'block', height: '100%', borderRadius: 2, width: (h / maxOS) * 100 + '%', background: 'linear-gradient(90deg, var(--amarelo), var(--amarelo-deep))' }}></i></div>
                </div>
                <b style={{ font: '600 13px var(--font-mono)', flex: 'none' }}>{fmtH(h)} h</b>
              </div>
            ))}
          </div>
          <div className="ac-sec">Por semana</div>
          <div className="ac-card" style={{ marginBottom: 14 }}>
            {AC_ESP.semanas.map(([s, h]) => (
              <div className="ac-osrow" key={s} style={{ cursor: 'default' }}>
                <span className="atp-tile atp-tile--muted" style={{ width: 34, height: 34 }}><Icon name="calendar" size={16} /></span>
                <div className="bd"><div className="t">{s}</div><div className="m">{s.startsWith('S2') ? 'inclui os apontamentos de hoje' : 'semana fechada'}</div></div>
                <b style={{ font: '600 13px var(--font-mono)' }}>{fmtH(s.startsWith('S2') ? h + addHoje : h)} h</b>
              </div>
            ))}
          </div>
          <div className="ac-chk-warn" style={{ background: 'var(--amarelo-soft)', borderColor: 'rgba(255,179,0,.26)', color: 'var(--muted)', marginTop: 0, marginBottom: 14 }}>
            <Icon name="info" size={15} style={{ color: 'var(--amarelo-dim)' }} />Confira suas horas até <b style={{ color: 'var(--fg)' }}>{AC_ESP.confira}</b> — o fechamento do mês é em {AC_ESP.fecha}. Valores de folha são tratados pela retaguarda.
          </div>
          {espOk
            ? <div className="ac-ackok" style={{ minHeight: 48 }}><Icon name="circle-check-big" size={16} />Horas conferidas · confirmado agora</div>
            : <button type="button" className="ac-big" onClick={() => { setEspOk(true); setEspDiv(false); }}><Icon name="check" size={18} strokeWidth={2.2} />Confirmar minhas horas</button>}
          {!espOk && !espDiv && (
            <div style={{ marginTop: 9 }}>
              <button type="button" className="ac-big ac-big--ghost" onClick={() => setEspDiv(true)}><Icon name="circle-alert" size={17} />Apontar divergência</button>
            </div>
          )}
          {espDiv && (
            <div style={{ marginTop: 14 }}>
              <div className="ac-field ac-obs">
                <span className="k">Qual a divergência?</span>
                <textarea placeholder="Ex.: dia 08/07 trabalhei 8 h na OS-024, o espelho mostra 6 h…"></textarea>
              </div>
              <button type="button" className="ac-big" onClick={() => { setEspDiv(false); setOkInfo({ title: 'Divergência enviada', lines: [['Espelho', AC_ESP.mes], ['Status', 'em análise pela retaguarda'], ['Registrado', 'no aparelho · sincroniza ao conectar']] }); setScreen('ok'); }}>
                <Icon name="arrow-up-right" size={18} />Enviar divergência
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------- Escala da semana ---------- */
  if (screen === 'esc') {
    return (
      <div className="ac-app" data-screen-label="Escala da semana">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('app')}><Icon name="arrow-left" size={18} /></button>
          <b>Minha escala</b>
          <span className="osn">12–18/07</span>
        </div>
        <div className="ac-scroll">
          <div className="ac-card">
            {AC_ESC.map((e, i) => {
              const alvo = e.os ? AC_OS.find((x) => x.n === e.os) : null;
              return (
                <div className="ac-osrow" key={i} onClick={alvo ? () => openDet(alvo) : undefined}
                  style={e.tag ? { background: 'rgba(255,179,0,.05)', cursor: alvo ? 'pointer' : 'default' } : alvo ? undefined : { cursor: 'default' }}>
                  <div style={{ width: 52, flex: 'none' }}>
                    <div style={{ font: '700 11px/1 var(--font-mono)', color: e.tag ? 'var(--amarelo)' : 'var(--fg)' }}>{e.d.split(', ')[0]}</div>
                    <div style={{ font: '500 10px/1 var(--font-mono)', color: 'var(--muted-2)', marginTop: 4 }}>{e.d.split(', ')[1]}</div>
                  </div>
                  <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={e.ic} size={17} /></span>
                  <div className="bd">
                    <div className="t">{e.t}</div>
                    <div className="m">{e.m}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5, flex: 'none' }}>
                    {e.os ? <span className="osn" style={{ width: 'auto' }}>{e.os}</span> : <StatusChip tone="amber" led>Base</StatusChip>}
                    {e.tag && <span className="ac-syncmini ac-syncmini--pend">{e.tag}</span>}
                    {e.mud && <span className="ac-syncmini" style={{ color: 'var(--info-fg)' }}><Icon name="info" size={10} strokeWidth={2.4} />alterada</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="ac-chk-warn" style={{ background: 'var(--amarelo-soft)', borderColor: 'rgba(255,179,0,.26)', color: 'var(--muted)', marginTop: 14 }}>
            <Icon name="info" size={15} style={{ color: 'var(--amarelo-dim)' }} />A escala é definida pela retaguarda e pode mudar — alterações chegam por <b style={{ color: 'var(--fg)' }}>notificação</b>. Toque num dia para abrir a OS.
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Viagens de basculante ---------- */
  if (screen === 'via') {
    const r = AC_VIA_ROTA[os.n] || AC_VIA_ROTA['OS-021'];
    return (
      <div className="ac-app" data-screen-label="Viagens de basculante">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('osdet')}><Icon name="arrow-left" size={18} /></button>
          <b>Viagens</b>
          <span className="osn">{os.n}</span>
        </div>
        <div className="ac-scroll" style={{ paddingBottom: 12 }}>
          <div className="ac-field">
            <span className="k">Material</span>
            <div className="ac-seg">
              {AC_VIA_MAT.map(([id, lb]) => (
                <button type="button" key={id} className={viaMat === id ? 'on' : ''} onClick={() => setViaMat(id)} style={{ minHeight: 46 }}>{lb}</button>
              ))}
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Trajeto · ida e volta</span>
            <div className="ac-eq">
              <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name="map-pin" size={17} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 13 }}>{os.local.split(' — ')[0]} → {r.dest}</b>
              </div>
              <span className="hm">{r.km.toLocaleString('pt-BR', { minimumFractionDigits: 1 })} km</span>
            </div>
          </div>
          <div className="ac-via">
            <div className="k">Viagens hoje</div>
            <div className="n">{viaCount}</div>
            <div className="s">última · {viaLast} · caçamba 12 m³</div>
            <div className="btns">
              <button type="button" className="undo" aria-label="Desfazer" disabled={viaCount === 0} onClick={() => setViaCount(Math.max(0, viaCount - 1))}><Icon name="arrow-left" size={18} /></button>
              <button type="button" className="add" onClick={() => { setViaCount(viaCount + 1); setViaLast('agora'); }}>+1 viagem</button>
            </div>
          </div>
          <div className="ac-tiles" style={{ margin: '12px 0 14px' }}>
            <div className="ac-tile"><div className="k">Volume estimado</div><div className="v">{viaCount * 12}<small> m³</small></div></div>
            <div className="ac-tile"><div className="k">Rodados</div><div className="v">{(viaCount * r.km * 2).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}<small> km</small></div></div>
          </div>
          <div className="ac-chk-warn" style={{ background: 'var(--amarelo-soft)', borderColor: 'rgba(255,179,0,.26)', color: 'var(--muted)', marginTop: 0, marginBottom: 14 }}>
            <Icon name="info" size={15} style={{ color: 'var(--amarelo-dim)' }} />Cada toque fica salvo no aparelho na hora — as viagens entram na <b style={{ color: 'var(--fg)' }}>medição</b> da OS.
          </div>
          <button type="button" className="ac-big" disabled={viaCount === 0} onClick={confirmVia}>
            <Icon name="check" size={18} strokeWidth={2.2} />Encerrar dia · {viaCount} viagens
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Mobilização / prancha ---------- */
  if (screen === 'mob') {
    return (
      <div className="ac-app" data-screen-label="Mobilização / prancha">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('osdet')}><Icon name="arrow-left" size={18} /></button>
          <b>Prancha</b>
          <span className="osn">{os.n}</span>
        </div>
        <div className="ac-scroll" style={{ paddingBottom: 12 }}>
          <div className="ac-field">
            <span className="k">Tipo de transporte</span>
            <div className="ac-seg">
              {AC_MOB_TIPOS.map(([id, lb]) => (
                <button type="button" key={id} className={mobTipo === id ? 'on' : ''} onClick={() => setMobTipo(id)} style={{ minHeight: 46, fontSize: 10.5 }}>{lb}</button>
              ))}
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Equipamento na prancha</span>
            <div className="ac-eq">
              <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={os.eqIc} size={18} /></span>
              <b>{os.eq}</b>
              <span className="hm">horím. {fmtH(os.h0)}</span>
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Trajeto</span>
            <div className="ac-eq">
              <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name="map-pin" size={17} /></span>
              <b style={{ fontSize: 13, flex: 1, minWidth: 0 }}>{mobTrajeto(os, mobTipo)}</b>
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Quilômetros de prancha</span>
            <div className="ac-stepper">
              <button type="button" aria-label="Diminuir" onClick={() => setMobKm(Math.max(1, mobKm - 1))}>−</button>
              <div className="val"><b>{mobKm.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km</b><span>só ida · conforme odômetro</span></div>
              <button type="button" aria-label="Aumentar" onClick={() => setMobKm(mobKm + 1)}>+</button>
            </div>
          </div>
          <div className="ac-field ac-obs">
            <span className="k">Observação (opcional)</span>
            <textarea placeholder="Ex.: saída 06h40, escolta no trecho da RS-344…"></textarea>
          </div>
          <div className="ac-field">
            <span className="k">Foto do equipamento carregado</span>
            <div style={{ height: 140, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <image-slot id={'mob-' + os.n} shape="rect" placeholder="Toque ou arraste a foto na prancha"></image-slot>
            </div>
          </div>
          <div className="ac-chk-warn" style={{ background: 'var(--amarelo-soft)', borderColor: 'rgba(255,179,0,.26)', color: 'var(--muted)', marginTop: 0, marginBottom: 14 }}>
            <Icon name="info" size={15} style={{ color: 'var(--amarelo-dim)' }} />Os km de prancha entram no <b style={{ color: 'var(--fg)' }}>faturamento da OS</b> pela tabela de preços — valores ficam na retaguarda.
          </div>
          <button type="button" className="ac-big" onClick={confirmMob}>
            <Icon name="check" size={18} strokeWidth={2.2} />Registrar transporte
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Histórico ---------- */
  if (screen === 'hist') {
    const semana = 29.5 + hoje.reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
    const grupos = [{ d: 'Hoje · sex, 11/07', rows: hoje.map((a) => {
      const o = AC_OS.find((x) => x.n === a.os) || AC_OS[0];
      return { os: a.os, eq: o.eq, eqIc: o.eqIc, hm: null, h: a.h, sync: syncedAll };
    }).reverse() }, ...AC_HIST];
    return (
      <div className="ac-app" data-screen-label="Histórico de apontamentos">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('app')}><Icon name="arrow-left" size={18} /></button>
          <b>Histórico</b>
          <span className="osn">{fmtH(semana)} h na semana</span>
        </div>
        <div className="ac-scroll">
          {grupos.map((g) => g.rows.length > 0 && (
            <div key={g.d}>
              <div className="ac-sec">{g.d}</div>
              <div className="ac-card">
                {g.rows.map((r, i) => (
                  <div className="ac-osrow" key={i} style={{ cursor: 'default' }}>
                    <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={r.eqIc} size={17} /></span>
                    <div className="bd">
                      <div className="t">{r.os} · {r.eq}</div>
                      <div className="m">{r.hm ? <span className="mono">{r.hm}</span> : 'registrado hoje'}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <b style={{ font: '600 13px var(--font-mono)' }}>{r.h}</b>
                      <span className={r.sync ? 'ac-syncmini' : 'ac-syncmini ac-syncmini--pend'}>
                        <Icon name={r.sync ? 'check' : 'clock'} size={10} strokeWidth={2.4} />{r.sync ? 'sincronizado' : 'no aparelho'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- Notificações ---------- */
  if (screen === 'notif') {
    return (
      <div className="ac-app" data-screen-label="Notificações">
        <div className="ac-form-head">
          <button type="button" aria-label="Voltar" onClick={() => setScreen('app')}><Icon name="arrow-left" size={18} /></button>
          <b>Notificações</b>
          {naoLidas > 0
            ? <button type="button" className="ac-marklidas" onClick={() => setLidas(true)}>Marcar lidas</button>
            : <span className="osn" style={{ color: 'var(--muted-2)', background: 'var(--surface-2)', borderColor: 'var(--border)' }}>em dia</span>}
        </div>
        <div className="ac-scroll">
          {AC_NOTIF.map((g) => (
            <div key={g.d}>
              <div className="ac-sec">{g.d}</div>
              <div className="ac-card">
                {g.rows.map((r, i) => {
                  const alvo = r.os ? AC_OS.find((x) => x.n === r.os) : null;
                  const unread = r.unread && !lidas;
                  return (
                    <div className={unread ? 'ac-osrow ac-notif ac-notif--new' : 'ac-osrow ac-notif'} key={i}
                      onClick={alvo ? () => openDet(alvo) : undefined} style={alvo ? undefined : { cursor: 'default' }}>
                      <span className={r.ic === 'circle-alert' ? 'atp-tile' : 'atp-tile atp-tile--amber'} style={r.ic === 'circle-alert' ? { width: 34, height: 34, background: 'var(--danger-soft)', color: 'var(--danger-fg)' } : { width: 34, height: 34 }}><Icon name={r.ic} size={17} /></span>
                      <div className="bd">
                        <div className="t">{r.t}</div>
                        <div className="m" style={{ whiteSpace: 'normal' }}>{r.m}</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flex: 'none' }}>
                        <span style={{ font: '500 10.5px var(--font-mono)', color: 'var(--muted-2)' }}>{r.hr}</span>
                        {unread && <span className="ac-dot"></span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ---------- App (abas) ---------- */
  const totalHoje = hoje.reduce((s, a) => s + parseFloat(a.h.replace(',', '.')), 0);
  return (
    <div className="ac-app" data-screen-label={'Aba ' + tab}>
      {tab === 'hoje' && (
        <>
          <div className="ac-head">
            <span className="atp-avatar" style={{ width: 40, height: 40, borderRadius: '50%', fontSize: 15 }}>AM</span>
            <div className="hi"><b>Bom dia, Adelar</b><span>sexta, 11 de julho</span></div>
            <button type="button" className="ac-bell" aria-label="Notificações" onClick={() => setScreen('notif')}>
              <Icon name="bell" size={19} />
              {naoLidas > 0 && <span className="bd">{naoLidas}</span>}
            </button>
            <button type="button" className={syncedAll ? 'ac-sync' : 'ac-sync ac-sync--pend'} onClick={() => setScreen('sync')}>
              <i></i>{syncedAll ? 'Sincronizado · ' + lastSync : (hoje.length + 2) + ' no aparelho'}
            </button>
          </div>
          <div className="ac-scroll">
            {(AC_SEG.some((a) => !segAck[a.id]) || !ddsOk) && (
              <button type="button" className="ac-segban" onClick={() => setScreen('seg')}>
                <span className="ic"><Icon name="hard-hat" size={17} /></span>
                <span className="bd"><b>Alertas de segurança</b><span>{AC_SEG.filter((a) => !segAck[a.id]).length + (ddsOk ? 0 : 1)} pendentes — confirme ciência antes de operar</span></span>
                <Icon name="chevron-right" size={16} />
              </button>
            )}
            <div className="ac-sec">Em andamento agora</div>
            <div className="ac-card ac-active">
              <div className="top"><span className="os">OS-021</span><StatusChip tone="amber" led>Em andamento</StatusChip></div>
              <h3>Terraplenagem — lote industrial</h3>
              <div className="meta">
                <span><Icon name="user" size={12} />Essavado Ltda.</span>
                <span><Icon name="gauge" size={12} />início 4.218,0</span>
                <span><Icon name="clock" size={12} />desde 07:42</span>
              </div>
              <div className="ft"><button type="button" className="ac-big ac-big--flat" onClick={() => openApont(AC_OS[0])}><Icon name="gauge" size={17} />Encerrar e apontar horas</button></div>
            </div>
            <div className="ac-sec">Hoje</div>
            <div className="ac-tiles">
              <div className="ac-tile"><div className="k">Horas apontadas</div><div className="v">{fmtH(totalHoje)}<small> h</small></div></div>
              <div className="ac-tile"><div className="k">Apontamentos</div><div className="v">{hoje.length}</div></div>
            </div>
            <div className="ac-sec" style={{ display: 'flex', alignItems: 'center' }}>Minhas OS
              <button type="button" onClick={() => setScreen('esc')} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--amarelo)', font: '600 11px/1 var(--font-sans)', textTransform: 'none', letterSpacing: 0 }}>Minha escala <Icon name="chevron-right" size={13} /></button>
            </div>
            <div className="ac-card">
              {AC_OS.map((o) => (
                <div className="ac-osrow" key={o.n} onClick={() => openDet(o)}>
                  <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={o.eqIc} size={17} /></span>
                  <div className="bd"><div className="t">{o.t}</div><div className="m">{o.cli} · {o.eq}</div></div>
                  <span className="osn">{o.n}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      {tab === 'os' && (
        <div className="ac-scroll" style={{ paddingTop: 14 }}>
          <div className="ac-head" style={{ padding: '0 0 10px' }}><div className="hi"><b>Minhas OS</b><span>3 ativas nesta semana</span></div></div>
          <div className="ac-card">
            {AC_OS.map((o) => (
              <div className="ac-osrow" key={o.n} onClick={() => openDet(o)}>
                <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={o.eqIc} size={17} /></span>
                <div className="bd"><div className="t">{o.t}</div><div className="m">{o.cli} · horím. {fmtH(o.h0)}</div></div>
                <span className="osn">{o.n}</span>
              </div>
            ))}
          </div>
          <div className="ac-sec" style={{ display: 'flex', alignItems: 'center' }}>Apontamentos de hoje
            <button type="button" onClick={() => setScreen('hist')} style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--amarelo)', font: '600 11px/1 var(--font-sans)', textTransform: 'none', letterSpacing: 0 }}>Ver histórico <Icon name="chevron-right" size={13} /></button>
          </div>
          <div className="ac-card">
            {hoje.map((a, i) => (
              <div className="ac-osrow" key={i} style={{ cursor: 'default' }}>
                <span className="atp-tile atp-tile--muted" style={{ width: 34, height: 34 }}><Icon name="clock" size={16} /></span>
                <div className="bd"><div className="t">{a.os}</div><div className="m">registrado hoje</div></div>
                <b style={{ font: '600 13px var(--font-mono)' }}>{a.h}</b>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'fuel' && (
        <div className="ac-scroll" style={{ paddingTop: 14 }}>
          <div className="ac-head" style={{ padding: '0 0 10px' }}><div className="hi"><b>Abastecer</b><span>diesel do tanque interno</span></div></div>
          <div className="ac-field">
            <span className="k">Equipamento</span>
            <div className="ac-card">
              {AC_OS.map((o) => (
                <div className="ac-osrow" key={o.n} onClick={() => setOs(o)} style={{ background: os.n === o.n ? 'var(--surface-2)' : undefined }}>
                  <span className="atp-tile atp-tile--amber" style={{ width: 34, height: 34 }}><Icon name={o.eqIc} size={17} /></span>
                  <div className="bd"><div className="t">{o.eq}</div><div className="m">{o.n} · horím. {fmtH(o.h0)}</div></div>
                  {os.n === o.n && <Icon name="check" size={17} style={{ color: 'var(--amarelo)' }} />}
                </div>
              ))}
            </div>
          </div>
          <div className="ac-field">
            <span className="k">Litros</span>
            <div className="ac-stepper">
              <button type="button" aria-label="Diminuir" onClick={() => setLitros(Math.max(10, litros - 10))}>−</button>
              <div className="val"><b>{litros} L</b><span>diesel S10</span></div>
              <button type="button" aria-label="Aumentar" onClick={() => setLitros(litros + 10)}>+</button>
            </div>
          </div>
          <button type="button" className="ac-big" onClick={confirmDiesel}><Icon name="fuel" size={18} />Registrar abastecimento</button>
        </div>
      )}
      {tab === 'perfil' && (
        <div className="ac-scroll" style={{ paddingTop: 14 }}>
          <div className="ac-card">
            <div className="ac-perfil-hero">
              <span className="atp-avatar atp-avatar--brand" style={{ width: 54, height: 54, borderRadius: 15, fontSize: 20 }}>AM</span>
              <div><div className="nm">Adelar Machado</div><div className="sb">Operador · CLT · Santo Ângelo — RS</div></div>
            </div>
            <div className="ac-datarow"><Icon name="id-card" size={16} /><span className="k">CNH</span><span className="v">Categoria E · até 03/2028</span></div>
            <div className="ac-datarow"><Icon name="phone" size={16} /><span className="k">Telefone</span><span className="v mono">(55) 99912-3040</span></div>
            <div className="ac-datarow"><Icon name="smartphone" size={16} /><span className="k">Versão</span><span className="v mono">v0.1 · fundação</span></div>
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="ac-big ac-big--ghost" onClick={() => setScreen('notif')}><Icon name="bell" size={17} />Notificações{naoLidas > 0 ? ` · ${naoLidas} novas` : ''}</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="ac-big ac-big--ghost" onClick={() => setScreen('seg')}><Icon name="hard-hat" size={17} />Alertas de segurança</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="ac-big ac-big--ghost" onClick={() => setScreen('sync')}><Icon name="smartphone" size={17} />Sincronização{syncedAll ? '' : ' · pendente'}</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="ac-big ac-big--ghost" onClick={() => setScreen('hist')}><Icon name="history" size={17} />Histórico de apontamentos</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="ac-big ac-big--ghost" onClick={() => setScreen('esc')}><Icon name="calendar" size={17} />Minha escala · 12–18/07</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="ac-big ac-big--ghost" onClick={() => setScreen('esp')}><Icon name="calendar" size={17} />Espelho de horas · {AC_ESP.mes}</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <button type="button" className="ac-big ac-big--ghost" onClick={() => setScreen('pin')}><Icon name="log-in" size={17} style={{ transform: 'scaleX(-1)' }} />Sair</button>
          </div>
        </div>
      )}
      <nav className="ac-tabs">
        {[['hoje', 'dashboard', 'Hoje'], ['os', 'clipboard-list', 'Minhas OS'], ['fuel', 'fuel', 'Abastecer'], ['perfil', 'user', 'Perfil']].map(([id, ic, lb]) => (
          <button key={id} type="button" className={tab === id ? 'ac-tab is-active' : 'ac-tab'} onClick={() => setTab(id)}>
            <Icon name={ic} size={19} /><span>{lb}</span><span className="dt"></span>
          </button>
        ))}
      </nav>
    </div>
  );
}
window.CampoApp = CampoApp;
