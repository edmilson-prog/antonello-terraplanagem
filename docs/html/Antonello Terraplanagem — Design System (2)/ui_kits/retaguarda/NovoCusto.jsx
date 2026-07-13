/* Retaguarda — Novo lançamento de custo (compõe o Custo da Hora; resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, StatusChip, IconTile, Note, Icon } = NS;

const NLC_CAT = [
  ['depreciacao', 'Depreciação', 'history'],
  ['seguro', 'Seguro', 'badge-check'],
  ['pneus', 'Pneus / rodante', 'truck'],
  ['operador', 'Operador / folha', 'hard-hat'],
  ['indireto', 'Custo indireto', 'wallet'],
  ['outros', 'Outros', 'calculator'],
];
const NLC_EQUIP = ['Rateio da frota', 'Escavadeira CAT 320', 'Retroescavadeira JCB 3CX', 'Pá Carregadeira XCMG', 'Caminhão basculante 01'];
const NLC_BASE = [['mensal', 'Mensal'], ['hora', 'Por hora'], ['anual', 'Anual']];
const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

function NovoCusto({ onCancel, onCreate }) {
  const [f, setF] = React.useState({ cat: 'depreciacao', eq: 'Escavadeira CAT 320', base: 'mensal', valor: '', horas: '160', comp: '', obs: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const cat = NLC_CAT.find((c) => c[0] === f.cat) || NLC_CAT[0];
  const valor = parseFloat((f.valor || '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
  const horas = parseFloat(f.horas) || 0;
  const porHora = f.base === 'hora' ? valor : f.base === 'anual' ? (horas ? valor / (horas * 12) : 0) : (horas ? valor / horas : 0);
  const ready = valor > 0 && (f.base === 'hora' || horas > 0);

  return (
    <>
      <button className="rtg-back" onClick={onCancel}><Icon name="arrow-left" size={16} /> Custo da Hora</button>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Novo lançamento de custo</h1>
        <span className="rtg-ostag">custo da hora</span>
      </div>

      <form className="rtg-form" onSubmit={(e) => { e.preventDefault(); if (ready) onCreate && onCreate(); }}>
        {/* CAMPOS */}
        <Card title="Dados do custo" icon="calculator" padded>
          <div className="rtg-form-grid">
            <div className="rtg-field-l">
              <span className="k">Categoria</span>
              <select className="rtg-select" value={f.cat} onChange={set('cat')}>
                {NLC_CAT.map(([id, lbl]) => <option key={id} value={id}>{lbl}</option>)}
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">Equipamento</span>
              <select className="rtg-select" value={f.eq} onChange={set('eq')}>
                {NLC_EQUIP.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Base do valor</span>
              <div className="rtg-seg3">
                {NLC_BASE.map(([id, lbl]) => (
                  <button type="button" key={id} className={f.base === id ? 'on' : ''} onClick={() => setF((s) => ({ ...s, base: id }))}>{lbl}</button>
                ))}
              </div>
            </div>
            <div className="rtg-field-l">
              <span className="k">Valor {f.base === 'hora' ? '(R$/h)' : f.base === 'anual' ? '(anual)' : '(mensal)'}<span className="req">*</span></span>
              <input className="rtg-input mono" type="text" inputMode="decimal" placeholder="R$ 0" value={f.valor} onChange={set('valor')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Horas/mês de referência{f.base !== 'hora' && <span className="req">*</span>}</span>
              <input className="rtg-input mono" type="number" min="0" placeholder="160" value={f.horas} onChange={set('horas')} disabled={f.base === 'hora'} style={f.base === 'hora' ? { opacity: .5 } : undefined} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Competência</span>
              <input className="rtg-input mono" type="text" placeholder="mm/aaaa" value={f.comp} onChange={set('comp')} />
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Observações</span>
              <textarea className="rtg-ta" placeholder="Critério de rateio, referência do contrato, memória de cálculo…" value={f.obs} onChange={set('obs')}></textarea>
            </div>
          </div>
          <div className="rtg-form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <div style={{ flex: 1 }} />
            <Button type="submit" variant="primary" icon="check" disabled={!ready}>Lançar custo</Button>
          </div>
        </Card>

        {/* RESUMO AO VIVO */}
        <div className="rtg-stack">
          <Card title="Resumo" icon="calculator" padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <IconTile icon={cat[2]} tone="brand" size="lg" style={{ width: 48, height: 48, borderRadius: 13 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{cat[1]}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 4 }}>{f.eq}</div>
              </div>
            </div>
            <div className="rtg-summary">
              <div className="sm-row"><span className="k">Base</span><span className="v">{(NLC_BASE.find((b) => b[0] === f.base) || [])[1]}</span></div>
              <div className="sm-row"><span className="k">Valor</span><span className={valor ? 'v mono' : 'v ph'}>{valor ? brl(valor) : 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Horas ref.</span><span className={f.base === 'hora' ? 'v ph' : 'v mono'}>{f.base === 'hora' ? 'n/a' : (f.horas || '0') + ' h'}</span></div>
              <div className="sm-row"><span className="k">Competência</span><span className={f.comp ? 'v mono' : 'v ph'}>{f.comp || 'atual'}</span></div>
              <div className="sm-row"><span className="k">Situação</span><span className="v"><StatusChip tone="info" led>No cálculo</StatusChip></span></div>
            </div>
            <div className="rtg-total">
              <span>Impacto no custo/h</span>
              <b>{brl(Math.round(porHora * 100) / 100)}<span style={{ font: '400 12px/1 var(--font-sans)', color: 'var(--muted)' }}>/h</span></b>
            </div>
          </Card>
          <Note icon="info">Entra na <b>composição do Custo da Hora</b> do equipamento (ao lado de diesel e manutenção). Valores ficam restritos a <b>Custo da Hora</b>, <b>Financeiro</b> e <b>Rentabilidade</b>.</Note>
        </div>
      </form>
    </>
  );
}
window.NovoCusto = NovoCusto;
