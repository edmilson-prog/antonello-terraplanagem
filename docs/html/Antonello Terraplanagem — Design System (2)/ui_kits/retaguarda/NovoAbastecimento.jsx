/* Retaguarda — Novo Abastecimento (formulário de diesel com custo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, StatusChip, IconTile, Note, Icon } = NS;

const NAB_EQUIP = [
  ['Escavadeira CAT 320', 'truck'], ['Escavadeira Volvo EC140', 'truck'],
  ['Retroescavadeira JCB 3CX', 'tractor'], ['Pá Carregadeira XCMG', 'forklift'],
  ['Rolo compactador CA25', 'tractor'], ['Caminhão basculante 01', 'truck'],
];
const NAB_ORIG = [['interno', 'Tanque interno', 5.84], ['posto', 'Posto Missões', 6.04]];
const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function NovoAbastecimento({ onCancel, onCreate }) {
  const [f, setF] = React.useState({ data: '', eq: 'Escavadeira CAT 320', orig: 'interno', hor: '', litros: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const eqIc = (NAB_EQUIP.find((x) => x[0] === f.eq) || [])[1] || 'truck';
  const orig = NAB_ORIG.find((o) => o[0] === f.orig) || NAB_ORIG[0];
  const litros = parseFloat((f.litros || '').replace(',', '.')) || 0;
  const total = litros * orig[2];
  const ready = litros > 0 && f.hor.trim();

  return (
    <>
      <button className="rtg-back" onClick={onCancel}><Icon name="arrow-left" size={16} /> Diesel</button>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Novo abastecimento</h1>
        <span className="rtg-ostag">diesel</span>
      </div>

      <form className="rtg-form" onSubmit={(e) => { e.preventDefault(); if (ready) onCreate && onCreate(); }}>
        {/* CAMPOS */}
        <Card title="Dados do abastecimento" icon="fuel" padded>
          <div className="rtg-form-grid">
            <div className="rtg-field-l col2">
              <span className="k">Equipamento<span className="req">*</span></span>
              <select className="rtg-select" value={f.eq} onChange={set('eq')}>
                {NAB_EQUIP.map(([t]) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Origem do diesel</span>
              <div className="rtg-seg2">
                {NAB_ORIG.map(([id, lbl, pr]) => (
                  <button type="button" key={id} className={f.orig === id ? 'on' : ''} onClick={() => setF((s) => ({ ...s, orig: id }))}>
                    <Icon name={id === 'interno' ? 'database' : 'map-pin'} size={15} />{lbl}
                  </button>
                ))}
              </div>
            </div>
            <div className="rtg-field-l">
              <span className="k">Data</span>
              <input className="rtg-input mono" type="text" placeholder="dd/mm/aaaa" value={f.data} onChange={set('data')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Horímetro<span className="req">*</span></span>
              <input className="rtg-input mono" type="text" inputMode="numeric" placeholder="4.218" value={f.hor} onChange={set('hor')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Litros<span className="req">*</span></span>
              <input className="rtg-input mono" type="number" min="0" step="0.1" placeholder="110" value={f.litros} onChange={set('litros')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Preço do litro</span>
              <input className="rtg-input mono" type="text" value={brl(orig[2])} readOnly style={{ opacity: .7 }} />
            </div>
          </div>
          <div className="rtg-form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <div style={{ flex: 1 }} />
            <Button type="submit" variant="primary" icon="check" disabled={!ready}>Registrar abastecimento</Button>
          </div>
        </Card>

        {/* RESUMO AO VIVO */}
        <div className="rtg-stack">
          <Card title="Resumo" icon="fuel" padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <IconTile icon={eqIc} tone="brand" size="lg" style={{ width: 48, height: 48, borderRadius: 13 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{f.eq}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 4 }}>{orig[1]}</div>
              </div>
            </div>
            <div className="rtg-summary">
              <div className="sm-row"><span className="k">Data</span><span className={f.data ? 'v mono' : 'v ph'}>{f.data || 'hoje'}</span></div>
              <div className="sm-row"><span className="k">Horímetro</span><span className={f.hor ? 'v mono' : 'v ph'}>{f.hor || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Litros</span><span className={litros ? 'v mono' : 'v ph'}>{litros ? litros.toLocaleString('pt-BR') + ' L' : 'a definir'}</span></div>
              <div className="sm-row"><span className="k">R$/litro</span><span className="v mono">{brl(orig[2])}</span></div>
              <div className="sm-row"><span className="k">Origem</span><span className="v">{f.orig === 'interno' ? <StatusChip tone="info">Tanque interno</StatusChip> : <StatusChip tone="amber">Posto externo</StatusChip>}</span></div>
            </div>
            <div className="rtg-total">
              <span>Custo do abastecimento</span>
              <b>{brl(total)}</b>
            </div>
          </Card>
          <Note icon="info">Entra no <b>Custo da Hora</b> do equipamento pelo horímetro. Abastecimento em <b>posto</b> vira conta a pagar em <b>Financeiro</b>; no <b>tanque interno</b> baixa o estoque de diesel.</Note>
        </div>
      </form>
    </>
  );
}
window.NovoAbastecimento = NovoAbastecimento;
