/* Retaguarda — Novo Orçamento (itens da tabela de preços + total ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, StatusChip, IconTile, Note, Icon } = NS;

/* Itens catalogáveis (espelham a tabela de Preços). */
const NORC_CAT = [
  { id: 'cat320', nm: 'Escavadeira CAT 320', ic: 'truck', un: 'h', preco: 400 },
  { id: 'jcb', nm: 'Retroescavadeira JCB 3CX', ic: 'tractor', un: 'h', preco: 320 },
  { id: 'xcmg', nm: 'Pá Carregadeira XCMG', ic: 'forklift', un: 'h', preco: 300 },
  { id: 'rolo', nm: 'Rolo compactador CA25', ic: 'tractor', un: 'h', preco: 260 },
  { id: 'basc', nm: 'Caminhão basculante', ic: 'truck', un: 'h', preco: 220 },
  { id: 'mob', nm: 'Mobilização — prancha', ic: 'truck', un: 'km', preco: 8.5 },
];
const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });

function NovoOrcamento({ onCancel, onCreate }) {
  const clientes = window.RTG.clientes;
  const [cli, setCli] = React.useState('');
  const [serv, setServ] = React.useState('');
  const [val, setVal] = React.useState('');
  const [itens, setItens] = React.useState([{ id: 'cat320', qt: 40 }]);

  const addItem = () => {
    const usados = itens.map((i) => i.id);
    const prox = NORC_CAT.find((c) => !usados.includes(c.id)) || NORC_CAT[0];
    setItens((s) => [...s, { id: prox.id, qt: 1 }]);
  };
  const rmItem = (idx) => setItens((s) => s.filter((_, i) => i !== idx));
  const setId = (idx) => (e) => { const v = e.target.value; setItens((s) => s.map((it, i) => i === idx ? { ...it, id: v } : it)); };
  const setQt = (idx) => (e) => { const v = Math.max(0, parseFloat(e.target.value) || 0); setItens((s) => s.map((it, i) => i === idx ? { ...it, qt: v } : it)); };

  const linhas = itens.map((it) => { const c = NORC_CAT.find((x) => x.id === it.id); return { ...c, qt: it.qt, sub: c.preco * it.qt }; });
  const total = linhas.reduce((s, l) => s + l.sub, 0);
  const ready = cli && serv.trim() && total > 0;

  return (
    <>
      <button className="rtg-back" onClick={onCancel}><Icon name="arrow-left" size={16} /> Orçamentos</button>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Novo orçamento</h1>
        <span className="rtg-ostag">ORC-056 · rascunho</span>
      </div>

      <form className="rtg-form" onSubmit={(e) => { e.preventDefault(); if (ready) onCreate && onCreate(); }}>
        {/* CAMPOS */}
        <div className="rtg-stack">
          <Card title="Dados do orçamento" icon="file-text" padded>
            <div className="rtg-form-grid">
              <div className="rtg-field-l col2">
                <span className="k">Cliente<span className="req">*</span></span>
                <select className="rtg-select" value={cli} onChange={(e) => setCli(e.target.value)}>
                  <option value="">Selecione o cliente…</option>
                  {clientes.map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                </select>
              </div>
              <div className="rtg-field-l col2">
                <span className="k">Serviço<span className="req">*</span></span>
                <input className="rtg-input" type="text" placeholder="Ex.: Terraplenagem — fase 2" value={serv} onChange={(e) => setServ(e.target.value)} />
              </div>
              <div className="rtg-field-l">
                <span className="k">Validade da proposta</span>
                <input className="rtg-input mono" type="text" placeholder="dd/mm/aaaa" value={val} onChange={(e) => setVal(e.target.value)} />
              </div>
            </div>
          </Card>

          <Card title="Itens" icon="tag" headerRight={<span className="rtg-link" onClick={addItem}><Icon name="file-plus" size={14} /> Adicionar item</span>}>
            <div className="rtg-tablewrap">
              <table className="rtg-table rtg-orc">
                <thead>
                  <tr><th>Item</th><th className="r">Qtd</th><th className="r">Unit.</th><th className="r">Subtotal</th><th></th></tr>
                </thead>
                <tbody>
                  {itens.map((it, idx) => {
                    const c = NORC_CAT.find((x) => x.id === it.id);
                    return (
                      <tr key={idx}>
                        <td>
                          <div className="rtg-eqcell">
                            <span className="atp-tile atp-tile--amber" style={{ width: 26, height: 26 }}><Icon name={c.ic} size={15} /></span>
                            <select className="rtg-select rtg-select--bare" value={it.id} onChange={setId(idx)}>
                              {NORC_CAT.map((o) => <option key={o.id} value={o.id}>{o.nm}</option>)}
                            </select>
                          </div>
                        </td>
                        <td className="r"><input className="rtg-input rtg-input--qt mono" type="number" min="0" value={it.qt} onChange={setQt(idx)} /> <span className="rtg-un">{c.un}</span></td>
                        <td className="r rtg-val">{brl(c.preco)}</td>
                        <td className="r rtg-val">{brl(c.preco * it.qt)}</td>
                        <td className="r"><button type="button" className="rtg-rm" aria-label="Remover" disabled={itens.length === 1} onClick={() => rmItem(idx)}><Icon name="ban" size={15} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="rtg-form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <div style={{ flex: 1 }} />
            <Button type="button" variant="ghost" icon="file-text" disabled={!ready}>Salvar rascunho</Button>
            <Button type="submit" variant="primary" icon="check" disabled={!ready}>Emitir orçamento</Button>
          </div>
        </div>

        {/* RESUMO AO VIVO */}
        <div className="rtg-stack">
          <Card title="Resumo" icon="file-text" padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <IconTile icon="file-text" tone="brand" size="lg" style={{ width: 48, height: 48, borderRadius: 13 }} />
              <div>
                <div style={{ font: '700 12px/1 var(--font-mono)', color: 'var(--amarelo)' }}>ORC-056</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: 5 }}>{serv || 'Nova proposta'}</div>
              </div>
            </div>
            <div className="rtg-summary">
              <div className="sm-row"><span className="k">Cliente</span><span className={cli ? 'v' : 'v ph'}>{cli || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Itens</span><span className="v">{itens.length} {itens.length === 1 ? 'item' : 'itens'}</span></div>
              <div className="sm-row"><span className="k">Validade</span><span className={val ? 'v mono' : 'v ph'}>{val || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Situação</span><span className="v"><StatusChip tone="info" led>Aberto</StatusChip></span></div>
            </div>
            <div className="rtg-total">
              <span>Total da proposta</span>
              <b>{brl(total)}</b>
            </div>
          </Card>
          <Note icon="info">Preços vêm da <b>tabela vigente</b>; a margem é conferida contra o <b>Custo da Hora</b>. Ao aprovar, o orçamento vira uma <b>OS</b> com um toque.</Note>
        </div>
      </form>
    </>
  );
}
window.NovoOrcamento = NovoOrcamento;
