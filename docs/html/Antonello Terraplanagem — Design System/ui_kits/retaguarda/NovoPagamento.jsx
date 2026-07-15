/* Retaguarda — Novo Pagamento (título a pagar, com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, StatusChip, IconTile, Note, Icon } = NS;

const NPG_CAT = [
  ['diesel', 'Diesel', 'fuel'],
  ['manut', 'Manutenção / peças', 'wrench'],
  ['folha', 'Folha — operadores', 'hard-hat'],
  ['frota', 'Frota / seguro', 'truck'],
  ['outros', 'Outros', 'wallet'],
];
const NPG_FORMA = ['PIX', 'TED', 'Boleto', 'Dinheiro'];
const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function NovoPagamento({ onCancel, onCreate }) {
  const [f, setF] = React.useState({ cat: 'diesel', forn: '', doc: '', venc: '', valor: '', forma: 'Boleto', obs: '' });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));
  const cat = NPG_CAT.find((c) => c[0] === f.cat) || NPG_CAT[0];
  const valorNum = parseFloat((f.valor || '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')) || 0;
  const ready = f.forn.trim() && valorNum > 0 && f.venc.trim();

  return (
    <>
      <button className="rtg-back" onClick={onCancel}><Icon name="arrow-left" size={16} /> Financeiro</button>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Novo pagamento</h1>
        <span className="rtg-ostag">conta a pagar</span>
      </div>

      <form className="rtg-form" onSubmit={(e) => { e.preventDefault(); if (ready) onCreate && onCreate(); }}>
        {/* CAMPOS */}
        <Card title="Dados do título" icon="wallet" padded>
          <div className="rtg-form-grid">
            <div className="rtg-field-l col2">
              <span className="k">Categoria</span>
              <select className="rtg-select" value={f.cat} onChange={set('cat')}>
                {NPG_CAT.map(([id, lbl]) => <option key={id} value={id}>{lbl}</option>)}
              </select>
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Fornecedor / beneficiário<span className="req">*</span></span>
              <input className="rtg-input" type="text" placeholder="Ex.: Posto Missões" value={f.forn} onChange={set('forn')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Documento</span>
              <input className="rtg-input mono" type="text" placeholder="BOL 8821 / NF 5540" value={f.doc} onChange={set('doc')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Vencimento<span className="req">*</span></span>
              <input className="rtg-input mono" type="text" placeholder="dd/mm/aaaa" value={f.venc} onChange={set('venc')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Valor<span className="req">*</span></span>
              <input className="rtg-input mono" type="text" inputMode="decimal" placeholder="R$ 0" value={f.valor} onChange={set('valor')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Forma de pagamento</span>
              <select className="rtg-select" value={f.forma} onChange={set('forma')}>
                {NPG_FORMA.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Observações</span>
              <textarea className="rtg-ta" placeholder="Rateio por equipamento, centro de custo, referência…" value={f.obs} onChange={set('obs')}></textarea>
            </div>
          </div>
          <div className="rtg-form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <div style={{ flex: 1 }} />
            <Button type="button" variant="ghost" icon="file-text" disabled={!ready}>Salvar rascunho</Button>
            <Button type="submit" variant="primary" icon="check" disabled={!ready}>Lançar pagamento</Button>
          </div>
        </Card>

        {/* RESUMO AO VIVO */}
        <div className="rtg-stack">
          <Card title="Resumo" icon="wallet" padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <IconTile icon={cat[2]} tone="brand" size="lg" style={{ width: 48, height: 48, borderRadius: 13 }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{f.forn || 'Novo pagamento'}</div>
                <div style={{ fontSize: 12, color: 'var(--muted-2)', marginTop: 4 }}>{cat[1]}</div>
              </div>
            </div>
            <div className="rtg-summary">
              <div className="sm-row"><span className="k">Documento</span><span className={f.doc ? 'v mono' : 'v ph'}>{f.doc || 'sem documento'}</span></div>
              <div className="sm-row"><span className="k">Vencimento</span><span className={f.venc ? 'v mono' : 'v ph'}>{f.venc || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Forma</span><span className="v">{f.forma}</span></div>
              <div className="sm-row"><span className="k">Situação</span><span className="v"><StatusChip tone="amber" led>A vencer</StatusChip></span></div>
            </div>
            <div className="rtg-total">
              <span>Valor a pagar</span>
              <b>{brl(valorNum)}</b>
            </div>
          </Card>
          <Note icon="info">Entra em <b>Financeiro › Contas a pagar</b>. Pagamentos de <b>diesel</b> e <b>manutenção</b> são rateados no <b>Custo da Hora</b> do equipamento; a baixa é feita pelo <b>comprovante</b>.</Note>
        </div>
      </form>
    </>
  );
}
window.NovoPagamento = NovoPagamento;
