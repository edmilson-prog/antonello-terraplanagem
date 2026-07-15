/* Retaguarda — Nova NF (emissão a partir de OS/medição, com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, StatusChip, IconTile, Note, Icon } = NS;

/* OS concluídas / medições prontas para faturar (espelha "A faturar"). */
const NF_FONTES = [
  { id: 'os015', os: 'OS-015', cli: 'Metalúrgica Boa Vista', t: 'Fundação de galpão — estacas', v: 19800 },
  { id: 'os011', os: 'OS-011', cli: 'Construtora Sul', t: 'Limpeza de terreno', v: 6400 },
  { id: 'os021m2', os: 'OS-021', cli: 'Construtora Vale Verde', t: 'Terraplenagem — medição #2', v: 15400 },
];
const NF_NATUREZA = ['Prestação de serviço', 'Locação de equipamento', 'Locação com operador'];
const brl = (n) => 'R$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

function NovaNF({ onCancel, onCreate }) {
  const [fonte, setFonte] = React.useState('os015');
  const [nat, setNat] = React.useState(NF_NATUREZA[0]);
  const [emissao, setEmissao] = React.useState('');
  const [prazo, setPrazo] = React.useState('15');
  const [obs, setObs] = React.useState('');
  const f = NF_FONTES.find((x) => x.id === fonte) || NF_FONTES[0];
  const iss = Math.round(f.v * 0.05);
  const ready = !!fonte;

  return (
    <>
      <button className="rtg-back" onClick={onCancel}><Icon name="arrow-left" size={16} /> Faturamento</button>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Nova nota fiscal</h1>
        <span className="rtg-ostag">NF 1043 · rascunho</span>
      </div>

      <form className="rtg-form" onSubmit={(e) => { e.preventDefault(); if (ready) onCreate && onCreate(); }}>
        {/* CAMPOS */}
        <Card title="Emissão de NF" icon="file-check" padded>
          <div className="rtg-form-grid">
            <div className="rtg-field-l col2">
              <span className="k">Faturar a partir de<span className="req">*</span></span>
              <select className="rtg-select" value={fonte} onChange={(e) => setFonte(e.target.value)}>
                {NF_FONTES.map((o) => <option key={o.id} value={o.id}>{o.os} · {o.cli} — {brl(o.v)}</option>)}
              </select>
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Natureza da operação</span>
              <select className="rtg-select" value={nat} onChange={(e) => setNat(e.target.value)}>
                {NF_NATUREZA.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">Emissão</span>
              <input className="rtg-input mono" type="text" placeholder="dd/mm/aaaa" value={emissao} onChange={(e) => setEmissao(e.target.value)} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Prazo de pagamento</span>
              <select className="rtg-select" value={prazo} onChange={(e) => setPrazo(e.target.value)}>
                <option value="0">À vista</option>
                <option value="15">15 dias</option>
                <option value="30">30 dias</option>
                <option value="45">28/45 dias</option>
              </select>
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Observações da nota</span>
              <textarea className="rtg-ta" placeholder="Dados adicionais, retenções, referência do contrato…" value={obs} onChange={(e) => setObs(e.target.value)}></textarea>
            </div>
          </div>
          <div className="rtg-form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <div style={{ flex: 1 }} />
            <Button type="button" variant="ghost" icon="file-text" disabled={!ready}>Salvar rascunho</Button>
            <Button type="submit" variant="primary" icon="file-check" disabled={!ready}>Emitir NF</Button>
          </div>
        </Card>

        {/* RESUMO AO VIVO */}
        <div className="rtg-stack">
          <Card title="Resumo" icon="file-check" padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <IconTile icon="file-check" tone="brand" size="lg" style={{ width: 48, height: 48, borderRadius: 13 }} />
              <div>
                <div style={{ font: '700 12px/1 var(--font-mono)', color: 'var(--amarelo)' }}>NF 1043</div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: 5 }}>{f.cli}</div>
              </div>
            </div>
            <div className="rtg-summary">
              <div className="sm-row"><span className="k">Origem</span><span className="v"><span className="rtg-ostag">{f.os}</span></span></div>
              <div className="sm-row"><span className="k">Serviço</span><span className="v">{f.t}</span></div>
              <div className="sm-row"><span className="k">Natureza</span><span className="v">{nat}</span></div>
              <div className="sm-row"><span className="k">Vencimento</span><span className="v">{prazo === '0' ? 'à vista' : 'em ' + prazo + ' dias'}</span></div>
              <div className="sm-row"><span className="k">Base</span><span className="v mono">{brl(f.v)}</span></div>
              <div className="sm-row"><span className="k">ISS (5%)</span><span className="v mono">{brl(iss)}</span></div>
              <div className="sm-row"><span className="k">Situação</span><span className="v"><StatusChip tone="amber" led>A vencer</StatusChip></span></div>
            </div>
            <div className="rtg-total">
              <span>Valor da nota</span>
              <b>{brl(f.v)}</b>
            </div>
          </Card>
          <Note icon="info">A NF baixa a <b>medição</b> na OS e cria o título em <b>Financeiro › Contas a receber</b>. O pagamento é conciliado pelo <b>comprovante</b>.</Note>
        </div>
      </form>
    </>
  );
}
window.NovaNF = NovaNF;
