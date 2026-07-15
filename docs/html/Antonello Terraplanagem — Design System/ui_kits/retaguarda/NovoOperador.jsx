/* Retaguarda — Novo Operador (formulário de cadastro com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, Badge, Avatar, Chip, Note, Icon } = NS;

const NOP_EQUIP = [
  ['Escavadeira CAT 320', 'truck'], ['Escavadeira Volvo EC140', 'truck'],
  ['Retroescavadeira JCB 3CX', 'tractor'], ['Pá Carregadeira XCMG', 'forklift'],
  ['Rolo compactador CA25', 'tractor'], ['Caminhão basculante', 'truck'],
];
const NOP_CNH = ['A', 'B', 'C', 'D', 'E'];

function iniciais(nome) {
  const p = nome.trim().split(/\s+/).filter(Boolean);
  if (!p.length) return '—';
  return (p[0][0] + (p.length > 1 ? p[p.length - 1][0] : '')).toUpperCase();
}
function maskCpf(v) {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function NovoOperador({ onCancel, onCreate }) {
  const [f, setF] = React.useState({
    nome: '', vinculo: 'CLT', doc: '', tel: '', nasc: '', cnh: 'C', cnhVal: '', base: 'Santo Ângelo — RS', app: true,
  });
  const [eqs, setEqs] = React.useState(['Escavadeira CAT 320']);
  const set = (k) => (e) => {
    const v = e.target.value;
    setF((s) => ({ ...s, [k]: k === 'doc' ? maskCpf(v) : v }));
  };
  const toggleEq = (nm) => setEqs((s) => s.includes(nm) ? s.filter((x) => x !== nm) : [...s, nm]);
  const ready = f.nome.trim() && f.doc.trim() && f.tel.trim();

  return (
    <>
      <button className="rtg-back" onClick={onCancel}><Icon name="arrow-left" size={16} /> Operadores</button>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Novo operador</h1>
        <span className="rtg-ostag">cadastro</span>
      </div>

      <form className="rtg-form" onSubmit={(e) => { e.preventDefault(); if (ready) onCreate && onCreate(); }}>
        {/* CAMPOS */}
        <Card title="Dados cadastrais" icon="contact" padded>
          <div className="rtg-form-grid">
            <div className="rtg-field-l col2">
              <span className="k">Nome completo<span className="req">*</span></span>
              <input className="rtg-input" type="text" placeholder="Ex.: Adelar Machado" value={f.nome} onChange={set('nome')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Vínculo</span>
              <div className="rtg-seg2">
                <button type="button" className={f.vinculo === 'CLT' ? 'on' : ''} onClick={() => setF((s) => ({ ...s, vinculo: 'CLT' }))}>CLT</button>
                <button type="button" className={f.vinculo === 'PJ' ? 'on' : ''} onClick={() => setF((s) => ({ ...s, vinculo: 'PJ' }))}>PJ</button>
              </div>
            </div>
            <div className="rtg-field-l">
              <span className="k">CPF<span className="req">*</span></span>
              <input className="rtg-input mono" type="text" inputMode="numeric" placeholder="000.000.000-00" value={f.doc} onChange={set('doc')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Telefone<span className="req">*</span></span>
              <input className="rtg-input mono" type="text" placeholder="(55) 99912-3040" value={f.tel} onChange={set('tel')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Nascimento</span>
              <input className="rtg-input mono" type="text" placeholder="dd/mm/aaaa" value={f.nasc} onChange={set('nasc')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">CNH — categoria</span>
              <select className="rtg-select" value={f.cnh} onChange={set('cnh')}>
                {NOP_CNH.map((c) => <option key={c} value={c}>Categoria {c}</option>)}
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">CNH — validade</span>
              <input className="rtg-input mono" type="text" placeholder="mm/aaaa" value={f.cnhVal} onChange={set('cnhVal')} />
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Base</span>
              <input className="rtg-input" type="text" placeholder="Santo Ângelo — RS" value={f.base} onChange={set('base')} />
            </div>
            <div className="rtg-field-l col2">
              <span className="k">Equipamentos habilitados</span>
              <div className="rtg-chipset">
                {NOP_EQUIP.map(([nm, ic]) => (
                  <button type="button" key={nm} className={eqs.includes(nm) ? 'on' : ''} onClick={() => toggleEq(nm)}>
                    <Icon name={ic} size={14} />{nm}
                    {eqs.includes(nm) && <Icon name="check" size={13} strokeWidth={2.4} />}
                  </button>
                ))}
              </div>
            </div>
            <div className="rtg-field-l col2">
              <label className="rtg-switch">
                <input type="checkbox" checked={f.app} onChange={(e) => setF((s) => ({ ...s, app: e.target.checked }))} />
                <span className="tk"></span>
                <span><b>Liberar acesso ao app de campo</b><small>O operador aponta horas e checklist pelo celular</small></span>
              </label>
            </div>
          </div>
          <div className="rtg-form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <div style={{ flex: 1 }} />
            <Button type="submit" variant="primary" icon="check" disabled={!ready}>Cadastrar operador</Button>
          </div>
        </Card>

        {/* RESUMO AO VIVO */}
        <div className="rtg-stack">
          <Card title="Resumo" icon="hard-hat" padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <Avatar initials={iniciais(f.nome)} size={48} shape="square" tone="brand" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{f.nome || 'Novo operador'}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Badge tone="neutral" icon="briefcase">Operador · {f.vinculo}</Badge>
                  <Badge tone={f.app ? 'info' : 'neutral'} icon="smartphone">{f.app ? 'Acesso ao app' : 'Sem app'}</Badge>
                </div>
              </div>
            </div>
            <div className="rtg-summary">
              <div className="sm-row"><span className="k">CPF</span><span className={f.doc ? 'v mono' : 'v ph'}>{f.doc || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Telefone</span><span className={f.tel ? 'v mono' : 'v ph'}>{f.tel || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">CNH</span><span className="v">Categoria {f.cnh}{f.cnhVal ? ' · ' + f.cnhVal : ''}</span></div>
              <div className="sm-row"><span className="k">Base</span><span className={f.base ? 'v' : 'v ph'}>{f.base || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Equipamentos</span><span className={eqs.length ? 'v' : 'v ph'}>{eqs.length ? eqs.length + ' habilitados' : 'nenhum'}</span></div>
            </div>
            {eqs.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
                {eqs.map((nm) => <Chip key={nm} icon={(NOP_EQUIP.find((x) => x[0] === nm) || [])[1]}>{nm}</Chip>)}
              </div>
            )}
          </Card>
          <Note icon="lock" tone="steel">Perfil operacional — sem dados financeiros. Custo-hora e valores ficam restritos às telas de <b>Custo da Hora</b> e <b>Financeiro</b>.</Note>
        </div>
      </form>
    </>
  );
}
window.NovoOperador = NovoOperador;
