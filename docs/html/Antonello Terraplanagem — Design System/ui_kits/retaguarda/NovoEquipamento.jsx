/* Retaguarda — Novo Equipamento (cadastro de frota, com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, Badge, StatusChip, IconTile, Note, Icon } = NS;

const NEQ_TIPOS = [
  ['Escavadeira', 'truck'], ['Retroescavadeira', 'tractor'], ['Pá carregadeira', 'forklift'],
  ['Caminhão', 'truck'], ['Compactador', 'tractor'], ['Implemento', 'truck'],
];
const NEQ_PROP = [['propria', 'Própria'], ['locada', 'Locada']];

function NovoEquipamento({ onCancel, onCreate }) {
  const [f, setF] = React.useState({
    nome: '', tipo: 'Escavadeira', marca: '', ano: '', prop: 'propria', placa: '', hor: '', planoH: '',
  });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const tipoIc = (NEQ_TIPOS.find((x) => x[0] === f.tipo) || [])[1] || 'truck';
  const ready = f.nome.trim() && f.marca.trim();

  return (
    <>
      <button className="rtg-back" onClick={onCancel}><Icon name="arrow-left" size={16} /> Equipamentos</button>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Novo equipamento</h1>
        <span className="rtg-ostag">frota</span>
      </div>

      <form className="rtg-form" onSubmit={(e) => { e.preventDefault(); if (ready) onCreate && onCreate(); }}>
        {/* CAMPOS */}
        <Card title="Dados do equipamento" icon="truck" padded>
          <div className="rtg-form-grid">
            <div className="rtg-field-l col2">
              <span className="k">Nome / identificação<span className="req">*</span></span>
              <input className="rtg-input" type="text" placeholder="Ex.: Escavadeira CAT 320" value={f.nome} onChange={set('nome')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Tipo</span>
              <select className="rtg-select" value={f.tipo} onChange={set('tipo')}>
                {NEQ_TIPOS.map(([t]) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">Propriedade</span>
              <div className="rtg-seg2">
                {NEQ_PROP.map(([id, lbl]) => (
                  <button type="button" key={id} className={f.prop === id ? 'on' : ''} onClick={() => setF((s) => ({ ...s, prop: id }))}>
                    <Icon name={id === 'propria' ? 'badge-check' : 'link'} size={15} />{lbl}
                  </button>
                ))}
              </div>
            </div>
            <div className="rtg-field-l">
              <span className="k">Marca / modelo<span className="req">*</span></span>
              <input className="rtg-input" type="text" placeholder="Ex.: Caterpillar 320" value={f.marca} onChange={set('marca')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Ano</span>
              <input className="rtg-input mono" type="text" inputMode="numeric" placeholder="2019" value={f.ano} onChange={set('ano')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Placa / patrimônio</span>
              <input className="rtg-input mono" type="text" placeholder="ABC-1D23 / PAT-014" value={f.placa} onChange={set('placa')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Horímetro inicial</span>
              <input className="rtg-input mono" type="text" inputMode="numeric" placeholder="0" value={f.hor} onChange={set('hor')} />
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Intervalo do plano preventivo</span>
              <input className="rtg-input mono" type="text" placeholder="Ex.: a cada 250 h" value={f.planoH} onChange={set('planoH')} />
            </div>
          </div>
          <div className="rtg-form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <div style={{ flex: 1 }} />
            <Button type="submit" variant="primary" icon="check" disabled={!ready}>Cadastrar equipamento</Button>
          </div>
        </Card>

        {/* RESUMO AO VIVO */}
        <div className="rtg-stack">
          <Card title="Resumo" icon="truck" padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <IconTile icon={tipoIc} tone="brand" size="lg" style={{ width: 48, height: 48, borderRadius: 13 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{f.nome || 'Novo equipamento'}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Badge tone="neutral">{f.tipo}</Badge>
                  <Badge tone={f.prop === 'propria' ? 'info' : 'gold'}>{f.prop === 'propria' ? 'Própria' : 'Locada'}</Badge>
                </div>
              </div>
            </div>
            <div className="rtg-summary">
              <div className="sm-row"><span className="k">Marca</span><span className={f.marca ? 'v' : 'v ph'}>{f.marca || 'a definir'}{f.ano ? ' · ' + f.ano : ''}</span></div>
              <div className="sm-row"><span className="k">Placa/pat.</span><span className={f.placa ? 'v mono' : 'v ph'}>{f.placa || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Horímetro</span><span className="v mono">{f.hor || '0'}</span></div>
              <div className="sm-row"><span className="k">Plano</span><span className={f.planoH ? 'v' : 'v ph'}>{f.planoH || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Situação</span><span className="v"><StatusChip tone="success" led>Em operação</StatusChip></span></div>
            </div>
          </Card>
          <Note icon="info">O equipamento fica disponível para <b>apontamentos</b> e <b>OS</b>. O horímetro alimenta o <b>Custo da Hora</b> e dispara os <b>planos de manutenção</b> pelo intervalo definido.</Note>
        </div>
      </form>
    </>
  );
}
window.NovoEquipamento = NovoEquipamento;
