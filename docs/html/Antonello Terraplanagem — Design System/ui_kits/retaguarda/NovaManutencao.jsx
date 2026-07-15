/* Retaguarda — Nova Manutenção (ordem de manutenção com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, Badge, StatusChip, IconTile, Note, Icon } = NS;

const NMT_EQUIP = [
  ['Escavadeira CAT 320', 'truck'], ['Escavadeira Volvo EC140', 'truck'],
  ['Retroescavadeira JCB 3CX', 'tractor'], ['Pá Carregadeira XCMG', 'forklift'],
  ['Rolo compactador CA25', 'tractor'], ['Caminhão basculante 01', 'truck'],
];

function NovaManutencao({ onCancel, onCreate }) {
  const [f, setF] = React.useState({
    eq: 'Pá Carregadeira XCMG', tipo: 'Corretiva', prio: 'alta', abertura: '',
    hor: '', desc: '', custo: '', fornec: '',
  });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const eqIc = (NMT_EQUIP.find((x) => x[0] === f.eq) || [])[1] || 'truck';
  const ready = f.desc.trim() && f.hor.trim();
  const prioTone = { alta: 'danger', media: 'amber', baixa: 'neutral' }[f.prio];
  const prioLbl = { alta: 'Alta', media: 'Média', baixa: 'Baixa' }[f.prio];

  return (
    <>
      <button className="rtg-back" onClick={onCancel}><Icon name="arrow-left" size={16} /> Manutenção</button>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Nova manutenção</h1>
        <span className="rtg-ostag">MNT · rascunho</span>
      </div>

      <form className="rtg-form" onSubmit={(e) => { e.preventDefault(); if (ready) onCreate && onCreate(); }}>
        {/* CAMPOS */}
        <Card title="Dados da manutenção" icon="wrench" padded>
          <div className="rtg-form-grid">
            <div className="rtg-field-l col2">
              <span className="k">Equipamento<span className="req">*</span></span>
              <select className="rtg-select" value={f.eq} onChange={set('eq')}>
                {NMT_EQUIP.map(([t]) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">Tipo</span>
              <div className="rtg-seg2">
                <button type="button" className={f.tipo === 'Preventiva' ? 'on' : ''} onClick={() => setF((s) => ({ ...s, tipo: 'Preventiva' }))}>Preventiva</button>
                <button type="button" className={f.tipo === 'Corretiva' ? 'on' : ''} onClick={() => setF((s) => ({ ...s, tipo: 'Corretiva' }))}>Corretiva</button>
              </div>
            </div>
            <div className="rtg-field-l">
              <span className="k">Prioridade</span>
              <select className="rtg-select" value={f.prio} onChange={set('prio')}>
                <option value="alta">Alta — parar a máquina</option>
                <option value="media">Média — programar</option>
                <option value="baixa">Baixa — próxima revisão</option>
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">Abertura</span>
              <input className="rtg-input mono" type="text" placeholder="dd/mm/aaaa" value={f.abertura} onChange={set('abertura')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Horímetro<span className="req">*</span></span>
              <input className="rtg-input mono" type="text" inputMode="numeric" placeholder="998" value={f.hor} onChange={set('hor')} />
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Descrição do serviço<span className="req">*</span></span>
              <input className="rtg-input" type="text" placeholder="Ex.: Vazamento no comando hidráulico" value={f.desc} onChange={set('desc')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Custo estimado</span>
              <input className="rtg-input mono" type="text" placeholder="R$ 0" value={f.custo} onChange={set('custo')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Fornecedor / oficina</span>
              <input className="rtg-input" type="text" placeholder="Ex.: Oficina interna" value={f.fornec} onChange={set('fornec')} />
            </div>
          </div>
          <div className="rtg-form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <div style={{ flex: 1 }} />
            <Button type="submit" variant="primary" icon="check" disabled={!ready}>Abrir manutenção</Button>
          </div>
        </Card>

        {/* RESUMO AO VIVO */}
        <div className="rtg-stack">
          <Card title="Resumo" icon="wrench" padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <IconTile icon={eqIc} tone="brand" size="lg" style={{ width: 48, height: 48, borderRadius: 13 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{f.eq}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Badge tone={f.tipo === 'Corretiva' ? 'gold' : 'neutral'}>{f.tipo}</Badge>
                </div>
              </div>
            </div>
            <div className="rtg-summary">
              <div className="sm-row"><span className="k">Serviço</span><span className={f.desc ? 'v' : 'v ph'}>{f.desc || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Prioridade</span><span className="v"><StatusChip tone={prioTone} led={f.prio !== 'baixa'}>{prioLbl}</StatusChip></span></div>
              <div className="sm-row"><span className="k">Horímetro</span><span className={f.hor ? 'v mono' : 'v ph'}>{f.hor || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Custo est.</span><span className={f.custo ? 'v mono' : 'v ph'}>{f.custo || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Oficina</span><span className={f.fornec ? 'v' : 'v ph'}>{f.fornec || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Situação</span><span className="v"><StatusChip tone="amber" led>Em andamento</StatusChip></span></div>
            </div>
          </Card>
          {f.prio === 'alta'
            ? <Note icon="circle-alert">Prioridade <b>alta</b> tira o equipamento de operação — as OS que dependem dele ficam sinalizadas até a conclusão.</Note>
            : <Note icon="info">A manutenção alimenta o <b>Custo da Hora</b> do equipamento e o histórico da <b>ficha</b>.</Note>}
        </div>
      </form>
    </>
  );
}
window.NovaManutencao = NovaManutencao;
