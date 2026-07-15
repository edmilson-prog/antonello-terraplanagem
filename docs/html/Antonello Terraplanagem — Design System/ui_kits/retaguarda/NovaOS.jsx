/* Retaguarda — Nova OS (formulário de criação com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, StatusChip, IconTile, Note, Icon } = NS;

const NOS_TIPOS = [
  ['Terraplenagem', 'truck'], ['Drenagem', 'tractor'], ['Nivelamento', 'forklift'],
  ['Fundação — estacas', 'truck'], ['Cascalhamento', 'truck'], ['Limpeza de terreno', 'tractor'],
];
const NOS_EQUIP = [
  ['Escavadeira CAT 320', 'truck'], ['Escavadeira Volvo EC140', 'truck'],
  ['Retroescavadeira JCB 3CX', 'tractor'], ['Pá Carregadeira XCMG', 'forklift'],
  ['Rolo compactador CA25', 'tractor'], ['Caminhão basculante', 'truck'],
];
const NOS_ORC = [
  ['', 'Sem orçamento vinculado', ''],
  ['ORC-055', 'ORC-055 · Terraplenagem — fase 2', 'R$ 58.000'],
  ['ORC-051', 'ORC-051 · Drenagem de acesso', 'R$ 22.400'],
  ['ORC-047', 'ORC-047 · Pátio de manobra', 'R$ 18.900'],
];

function NovaOS({ onCancel, onCreate }) {
  const clientes = window.RTG.clientes;
  const operadores = window.RTG.operadores.filter((o) => o.ativo);
  const [f, setF] = React.useState({
    cli: '', tipo: 'Terraplenagem', serv: '', eq: 'Escavadeira CAT 320',
    op: '', inicio: '', local: '', orc: '', valor: '', obs: '',
  });
  const set = (k) => (e) => {
    const v = e.target.value;
    setF((s) => {
      const n = { ...s, [k]: v };
      if (k === 'orc') { const row = NOS_ORC.find((r) => r[0] === v); if (row && row[2]) n.valor = row[2]; }
      return n;
    });
  };
  const eqIc = (NOS_EQUIP.find((x) => x[0] === f.eq) || [])[1] || 'truck';
  const ready = f.cli && f.serv.trim() && f.op;

  return (
    <>
      <button className="rtg-back" onClick={onCancel}><Icon name="arrow-left" size={16} /> Ordens de Serviço</button>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Nova OS</h1>
        <span className="rtg-ostag">OS-0025 · rascunho</span>
      </div>

      <form className="rtg-form" onSubmit={(e) => { e.preventDefault(); if (ready) onCreate && onCreate(); }}>
        {/* CAMPOS */}
        <Card title="Dados da ordem de serviço" icon="clipboard-list" padded>
          <div className="rtg-form-grid">
            <div className="rtg-field-l col2">
              <span className="k">Cliente<span className="req">*</span></span>
              <select className="rtg-select" value={f.cli} onChange={set('cli')}>
                <option value="">Selecione o cliente…</option>
                {clientes.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">Tipo de serviço</span>
              <select className="rtg-select" value={f.tipo} onChange={set('tipo')}>
                {NOS_TIPOS.map(([t]) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">Início previsto</span>
              <input className="rtg-input mono" type="text" placeholder="dd/mm/aaaa" value={f.inicio} onChange={set('inicio')} />
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Descrição do serviço<span className="req">*</span></span>
              <input className="rtg-input" type="text" placeholder="Ex.: Terraplenagem — lote industrial" value={f.serv} onChange={set('serv')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Equipamento</span>
              <select className="rtg-select" value={f.eq} onChange={set('eq')}>
                {NOS_EQUIP.map(([t]) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">Operador<span className="req">*</span></span>
              <select className="rtg-select" value={f.op} onChange={set('op')}>
                <option value="">Selecione…</option>
                {operadores.map((o) => <option key={o.id} value={o.nome}>{o.nome}</option>)}
              </select>
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Local da obra</span>
              <input className="rtg-input" type="text" placeholder="Ex.: Distrito Industrial — Santo Ângelo/RS" value={f.local} onChange={set('local')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Orçamento vinculado</span>
              <select className="rtg-select" value={f.orc} onChange={set('orc')}>
                {NOS_ORC.map(([v, lbl]) => <option key={v} value={v}>{lbl}</option>)}
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">Valor previsto</span>
              <input className="rtg-input mono" type="text" placeholder="R$ 0" value={f.valor} onChange={set('valor')} />
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Observações</span>
              <textarea className="rtg-ta" placeholder="Condições da frente, restrições de acesso, combinações com o cliente…" value={f.obs} onChange={set('obs')}></textarea>
            </div>
          </div>
          <div className="rtg-form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <div style={{ flex: 1 }} />
            <Button type="button" variant="ghost" icon="file-text" disabled={!ready}>Salvar rascunho</Button>
            <Button type="submit" variant="primary" icon="check" disabled={!ready}>Abrir OS</Button>
          </div>
        </Card>

        {/* RESUMO AO VIVO */}
        <div className="rtg-stack">
          <Card title="Resumo" icon="clipboard-list" padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <IconTile icon={eqIc} tone="brand" size="lg" style={{ width: 48, height: 48, borderRadius: 13 }} />
              <div>
                <div style={{ font: '700 12px/1 var(--font-mono)', color: 'var(--amarelo)' }}>OS-0025</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: 5 }}>{f.serv || 'Nova ordem de serviço'}</div>
              </div>
            </div>
            <div className="rtg-summary">
              <div className="sm-row"><span className="k">Cliente</span><span className={f.cli ? 'v' : 'v ph'}>{f.cli || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Tipo</span><span className="v">{f.tipo}</span></div>
              <div className="sm-row"><span className="k">Equipamento</span><span className="v">{f.eq}</span></div>
              <div className="sm-row"><span className="k">Operador</span><span className={f.op ? 'v' : 'v ph'}>{f.op || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Início</span><span className={f.inicio ? 'v mono' : 'v ph'}>{f.inicio || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Orçamento</span><span className={f.orc ? 'v mono' : 'v ph'}>{f.orc || 'nenhum'}</span></div>
              <div className="sm-row"><span className="k">Valor</span><span className={f.valor ? 'v mono' : 'v ph'}>{f.valor || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Situação</span><span className="v"><StatusChip tone="info" led>Aberta</StatusChip></span></div>
            </div>
          </Card>
          <Note icon="smartphone">Ao abrir a OS, ela aparece no <b>app de campo</b> do operador — os apontamentos por horímetro passam a chegar em tempo real.</Note>
        </div>
      </form>
    </>
  );
}
window.NovaOS = NovaOS;
