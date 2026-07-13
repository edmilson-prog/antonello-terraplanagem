/* Retaguarda — Dashboard · aba Operacional (tempo real: mapa, ordens, financeiro, manutenção preditiva). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Pill, Icon, Sparkline, Button, StatusChip } = NS;

const OP_SVG = {
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  tractor: '<path d="m10 11 11 .9a1 1 0 0 1 .8 1.1l-.665 4.158a1 1 0 0 1-.988.842H20"/><path d="M16 18h-5"/><path d="M18 5a1 1 0 0 0-1 1v5.573"/><path d="M3 4h8.129a1 1 0 0 1 .99.863L13 11.246"/><path d="M4 11V4"/><path d="M7 15h.01"/><path d="M8 10.1V4"/><circle cx="18" cy="18" r="2"/><circle cx="7" cy="15" r="5"/>',
  forklift: '<path d="M12 12H5a2 2 0 0 0-2 2v5"/><path d="M15 19h7"/><path d="M16 19V2"/><path d="M6 12V7a2 2 0 0 1 2-2h2.172a2 2 0 0 1 1.414.586l3.828 3.828A2 2 0 0 1 16 10.828"/><path d="M7 19h4"/><circle cx="13" cy="19" r="2"/><circle cx="5" cy="19" r="2"/>',
};
const OP_PINS = [
  { ll: [-28.296, -54.281], eq: 'Escavadeira CAT 320', os: 'OS-021', op: 'Adelar Machado', g: 'truck' },
  { ll: [-28.308, -54.252], eq: 'Retroescavadeira JCB 3CX', os: 'OS-019', op: 'Vilson Prediger', g: 'tractor' },
  { ll: [-28.313, -54.272], eq: 'Pá Carregadeira XCMG', os: 'OS-024', op: 'Nelson Kunz', g: 'forklift' },
  { ll: [-28.291, -54.259], eq: 'Caminhão basculante', os: 'OS-018', op: 'Ivo Scherer', g: 'truck' },
];
const OP_NOVAS = [40, 80, 0, 40, 0, 80, 40];
const OP_MANUT = [
  { eq: 'Pá Carregadeira XCMG', ic: 'forklift', al: 'Plano 1.000 h — óleo e filtros', v: 'vencida · −18 h', pct: 100, c: 'var(--danger)', late: true },
  { eq: 'Escavadeira Volvo EC140', ic: 'truck', al: 'Plano 7.500 h — filtros e óleos', v: 'em 12 h', pct: 92, c: 'var(--amarelo)' },
  { eq: 'Escavadeira CAT 320', ic: 'truck', al: 'Plano 4.300 h — filtros e graxa', v: 'em 82 h', pct: 58, c: 'var(--success-fg)' },
  { eq: 'Retroescavadeira JCB 3CX', ic: 'tractor', al: 'Plano 2.000 h — revisão geral', v: 'em 105 h', pct: 48, c: 'var(--success-fg)' },
  { eq: 'Rolo compactador CA25', ic: 'tractor', al: 'Plano 3.000 h — óleo e filtros', v: 'em 130 h', pct: 35, c: 'var(--success-fg)' },
];
const OP_RECV_MAX = 21300;
const OP_RECV = [
  { cli: 'Construtora Vale Verde', total: 'R$ 21.300', seg: [{ v: 12400, c: 'var(--amarelo)' }, { v: 8900, c: 'var(--amarelo-deep)' }] },
  { cli: 'Construtora Sul', total: 'R$ 19.900', seg: [{ v: 19900, c: 'var(--danger)' }] },
  { cli: 'Essavado Ltda.', total: 'R$ 11.100', seg: [{ v: 11100, c: 'var(--danger)' }] },
  { cli: 'Agro Vale Verde', total: 'R$ 9.600', seg: [{ v: 9600, c: 'var(--amarelo)' }] },
];
const OP_HOJE = [
  { os: 'OS-021', op: 'Adelar Machado', h: '8,0 h' },
  { os: 'OS-019', op: 'Vilson Prediger', h: '7,0 h' },
  { os: 'OS-024', op: 'Nelson Kunz', h: '6,0 h' },
];

function DashboardOperacional({ onNavigate }) {
  const mapEl = React.useRef(null);
  const mapObj = React.useRef(null);
  const [mapErr, setMapErr] = React.useState(false);

  React.useEffect(() => {
    let dead = false;
    function init() {
      if (dead || !mapEl.current || mapObj.current || !window.L) return;
      const L = window.L;
      const map = L.map(mapEl.current, { scrollWheelZoom: false }).setView([-28.302, -54.266], 14);
      map.attributionControl.setPosition('topright');
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 18, attribution: 'Imagens © Esri' }).addTo(map);
      OP_PINS.forEach((p) => {
        L.marker(p.ll, {
          icon: L.divIcon({
            className: 'rtg-pin',
            html: '<div class="bx"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + OP_SVG[p.g] + '</svg></div><div class="tl"></div>',
            iconSize: [30, 38], iconAnchor: [15, 38], popupAnchor: [0, -34],
          }),
        }).addTo(map).bindPopup('<b>' + p.eq + '</b><br>' + p.os + ' — ' + p.op);
      });
      mapObj.current = map;
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
    return () => { dead = true; if (mapObj.current) { mapObj.current.remove(); mapObj.current = null; } };
  }, []);

  return (
    <div className="rtg-opgrid">
      {/* ESQUERDA — mapa + manutenção preditiva */}
      <div className="rtg-stack">
        <Card title="Operacional em tempo real" icon="map-pin" headerRight={<Pill>4 equipamentos em campo</Pill>}>
          <div className="rtg-map-wrap">
            <div ref={mapEl} className="rtg-map"></div>
            {mapErr && <div className="rtg-map-fallback"><div><Icon name="map-pin" size={22} /><br />Mapa indisponível offline — 4 equipamentos em campo (OS-018, 019, 021, 024).</div></div>}
            <span className="rtg-map-live"><i></i>Ao vivo</span>
            <div className="rtg-map-ov">
              <Icon name="sun" size={15} /> <b>17°</b>&nbsp;· Santo Ângelo — RS · céu limpo
              <span className="sep"></span>
              <Icon name="hard-hat" size={15} /> 4 operadores em campo
            </div>
          </div>
        </Card>

        <Card title="Manutenção preditiva" icon="wrench"
          headerRight={<span className="rtg-link" onClick={() => onNavigate && onNavigate('manutencao')}>Ver todas <Icon name="chevron-right" size={14} /></span>}>
          <table className="rtg-table">
            <thead>
              <tr><th>Equipamento</th><th>Alerta</th><th className="r">Vence</th><th className="r">Saúde</th></tr>
            </thead>
            <tbody>
              {OP_MANUT.map((m) => (
                <tr key={m.eq}>
                  <td>
                    <div className="rtg-eqcell">
                      <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={m.ic} size={15} /></span>
                      <span className="nm">{m.eq}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--muted)' }}>{m.al}</td>
                  <td className="r"><span className="mono" style={{ fontWeight: 600, color: m.late ? 'var(--danger-fg)' : 'var(--fg)' }}>{m.v}</span></td>
                  <td className="r"><span className="rtg-health"><i style={{ width: m.pct + '%', background: m.c }}></i></span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      {/* DIREITA — ordens, financeiro, contas, atalhos */}
      <div className="rtg-stack">
        <div>
          <div className="eyebrow rtg-opsec">Ordens e horas</div>
          <div className="rtg-optiles">
            <div className="rtg-optile">
              <div className="k">Abertas</div>
              <div className="v">4</div>
              <div className="rtg-minibars">
                {OP_NOVAS.map((h, i) => <i key={i} className={h ? '' : 'z'} style={{ height: (h || 8) + '%' }}></i>)}
              </div>
              <div className="s">Novas OS · últimos 7 dias</div>
            </div>
            <div className="rtg-optile">
              <div className="k">Em andamento</div>
              <div className="v">7</div>
              <div className="rtg-statlist">
                <div className="r"><i style={{ background: 'var(--amarelo)' }}></i>Em andamento<b>7</b></div>
                <div className="r"><i style={{ background: 'var(--info-fg)' }}></i>Abertas<b>4</b></div>
                <div className="r"><i style={{ background: 'var(--success-fg)' }}></i>Concluídas no mês<b>6</b></div>
              </div>
            </div>
            <div className="rtg-optile">
              <div className="k">Horas apontadas</div>
              <div className="v">640<span className="u">h</span></div>
              <div className="rtg-minirows">
                {OP_HOJE.map((r) => (
                  <div className="r" key={r.os}><span className="rtg-ostag" style={{ padding: '2px 6px', fontSize: 11 }}>{r.os}</span><span className="nm">{r.op.split(' ')[0]}</span><b>{r.h}</b></div>
                ))}
              </div>
              <div className="s">Hoje · 21 h em 3 OS</div>
            </div>
          </div>
        </div>

        <div>
          <div className="eyebrow rtg-opsec">Financeiro</div>
          <div className="rtg-optiles">
            <div className="rtg-optile">
              <div className="k">Executado</div>
              <div className="v mono">R$ 98.400</div>
              <div className="s">serviço executado no mês</div>
              <Sparkline points={[19, 17, 18, 13, 14, 10, 11, 5]} width={170} height={30} style={{ display: 'block', marginTop: 12 }} />
            </div>
            <div className="rtg-optile">
              <div className="k">Faturado</div>
              <div className="v mono">R$ 86.200</div>
              <div className="s"><span className="atp-trend atp-trend--up"><Icon name="arrow-up-right" size={12} />11%</span> vs. junho</div>
              <Sparkline points={[18, 16, 17, 12, 13, 9, 10, 5]} width={170} height={30} style={{ display: 'block', marginTop: 12 }} />
            </div>
            <div className="rtg-optile">
              <div className="k">Recebido</div>
              <div className="v mono">R$ 55.800</div>
              <div className="s"><span className="atp-trend atp-trend--down"><Icon name="arrow-up-right" size={12} style={{ transform: 'rotate(90deg)' }} />4%</span> vs. junho</div>
              <Sparkline points={[16, 17, 14, 15, 12, 13, 12, 14]} width={170} height={30} stroke="var(--amarelo-dim)" style={{ display: 'block', marginTop: 12 }} />
            </div>
          </div>
        </div>

        <Card title="Contas a receber por cliente" icon="hand-coins" headerRight={<Pill>R$ 61.900 em aberto</Pill>}>
          <div className="rtg-recv">
            {OP_RECV.map((r) => (
              <div className="rtg-recv-row" key={r.cli}>
                <span className="nm">{r.cli}</span>
                <span className="rtg-recv-bar">
                  {r.seg.map((s, i) => <i key={i} style={{ width: (s.v / OP_RECV_MAX) * 100 + '%', background: s.c }}></i>)}
                </span>
                <span className="vl">{r.total}</span>
              </div>
            ))}
            <div className="rtg-recv-legend">
              <span><i style={{ background: 'var(--amarelo)' }}></i>A vencer · 0–15 dias</span>
              <span><i style={{ background: 'var(--amarelo-deep)' }}></i>A vencer · 16–30 dias</span>
              <span><i style={{ background: 'var(--danger)' }}></i>Vencida</span>
            </div>
          </div>
        </Card>

        <div>
          <div className="eyebrow rtg-opsec">Atalhos e ações rápidas</div>
          <div className="rtg-shortcuts">
            <Button variant="primary" icon="file-plus" onClick={() => onNavigate && onNavigate('os')}>Nova O.S.</Button>
            <Button variant="ghost" icon="file-text" onClick={() => onNavigate && onNavigate('orcamentos')}>Novo orçamento</Button>
            <Button variant="ghost" icon="users" onClick={() => onNavigate && onNavigate('clientes')}>Novo cliente</Button>
            <Button variant="ghost" icon="fuel" onClick={() => onNavigate && onNavigate('diesel')}>Registrar abastecimento</Button>
            <Button variant="ghost" icon="bar-chart" onClick={() => onNavigate && onNavigate('painel')}>Gerar relatório</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
window.DashboardOperacional = DashboardOperacional;
