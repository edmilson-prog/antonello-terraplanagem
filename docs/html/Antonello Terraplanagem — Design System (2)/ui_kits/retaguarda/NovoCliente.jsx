/* Retaguarda — Novo Cliente (formulário de cadastro com resumo ao vivo). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Card, Button, Badge, IconTile, Note, Icon } = NS;

const NCL_SEG = ['Construção civil', 'Terraplenagem', 'Agronegócio', 'Indústria', 'Particular'];

function maskDoc(v, pj) {
  const d = v.replace(/\D/g, '').slice(0, pj ? 14 : 11);
  if (pj) return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
  return d.replace(/^(\d{3})(\d)/, '$1.$2').replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function NovoCliente({ onCancel, onCreate }) {
  const [f, setF] = React.useState({
    tipo: 'PJ', nome: '', fantasia: '', seg: 'Construção civil', doc: '',
    email: '', tel: '', cidade: '', endereco: '', contato: '', area: '',
  });
  const set = (k) => (e) => {
    const v = e.target.value;
    setF((s) => ({ ...s, [k]: k === 'doc' ? maskDoc(v, s.tipo === 'PJ') : v }));
  };
  const setTipo = (t) => setF((s) => ({ ...s, tipo: t, doc: '' }));
  const pj = f.tipo === 'PJ';
  const ready = f.nome.trim() && f.doc.trim() && f.tel.trim();

  return (
    <>
      <button className="rtg-back" onClick={onCancel}><Icon name="arrow-left" size={16} /> Clientes</button>
      <div className="rtg-listhead">
        <h1 className="rtg-pagetitle">Novo cliente</h1>
        <span className="rtg-ostag">cadastro</span>
      </div>

      <form className="rtg-form" onSubmit={(e) => { e.preventDefault(); if (ready) onCreate && onCreate(); }}>
        {/* CAMPOS */}
        <Card title="Dados cadastrais" icon="contact" padded>
          <div className="rtg-form-grid">
            <div className="rtg-field-l col2">
              <span className="k">Tipo de pessoa</span>
              <div className="rtg-seg2">
                <button type="button" className={pj ? 'on' : ''} onClick={() => setTipo('PJ')}><Icon name="building-2" size={15} />Pessoa Jurídica</button>
                <button type="button" className={!pj ? 'on' : ''} onClick={() => setTipo('PF')}><Icon name="user" size={15} />Pessoa Física</button>
              </div>
            </div>
            <div className="rtg-field-l col2">
              <span className="k">{pj ? 'Razão social' : 'Nome completo'}<span className="req">*</span></span>
              <input className="rtg-input" type="text" placeholder={pj ? 'Ex.: Construtora Vale Verde Ltda.' : 'Ex.: João Beletti'} value={f.nome} onChange={set('nome')} />
            </div>
            {pj && (
              <div className="rtg-field-l">
                <span className="k">Nome fantasia</span>
                <input className="rtg-input" type="text" placeholder="Ex.: Vale Verde" value={f.fantasia} onChange={set('fantasia')} />
              </div>
            )}
            <div className="rtg-field-l">
              <span className="k">Segmento</span>
              <select className="rtg-select" value={f.seg} onChange={set('seg')}>
                {NCL_SEG.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="rtg-field-l">
              <span className="k">{pj ? 'CNPJ' : 'CPF'}<span className="req">*</span></span>
              <input className="rtg-input mono" type="text" inputMode="numeric" placeholder={pj ? '00.000.000/0000-00' : '000.000.000-00'} value={f.doc} onChange={set('doc')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Telefone<span className="req">*</span></span>
              <input className="rtg-input mono" type="text" placeholder="(55) 3312-8800" value={f.tel} onChange={set('tel')} />
            </div>
            <div className="rtg-field-l col2">
              <span className="k">E-mail</span>
              <input className="rtg-input mono" type="text" placeholder="financeiro@empresa.com.br" value={f.email} onChange={set('email')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Cidade / UF</span>
              <input className="rtg-input" type="text" placeholder="Santo Ângelo/RS" value={f.cidade} onChange={set('cidade')} />
            </div>
            <div className="rtg-field-l">
              <span className="k">Endereço</span>
              <input className="rtg-input" type="text" placeholder="Rua das Indústrias, 480" value={f.endereco} onChange={set('endereco')} />
            </div>
            {pj && (
              <>
                <div className="rtg-field-l">
                  <span className="k">Contato</span>
                  <input className="rtg-input" type="text" placeholder="Ex.: Marcos Feltrin" value={f.contato} onChange={set('contato')} />
                </div>
                <div className="rtg-field-l">
                  <span className="k">Área do contato</span>
                  <input className="rtg-input" type="text" placeholder="Ex.: Compras" value={f.area} onChange={set('area')} />
                </div>
              </>
            )}
          </div>
          <div className="rtg-form-actions">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <div style={{ flex: 1 }} />
            <Button type="submit" variant="primary" icon="check" disabled={!ready}>Cadastrar cliente</Button>
          </div>
        </Card>

        {/* RESUMO AO VIVO */}
        <div className="rtg-stack">
          <Card title="Resumo" icon={pj ? 'building-2' : 'user'} padded>
            <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
              <IconTile icon={pj ? 'building-2' : 'user'} tone="brand" size="lg" style={{ width: 48, height: 48, borderRadius: 13 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{f.nome || 'Novo cliente'}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <Badge tone={pj ? 'info' : 'neutral'}>{pj ? 'Pessoa Jurídica' : 'Pessoa Física'}</Badge>
                </div>
              </div>
            </div>
            <div className="rtg-summary">
              <div className="sm-row"><span className="k">Segmento</span><span className="v">{f.seg}</span></div>
              <div className="sm-row"><span className="k">{pj ? 'CNPJ' : 'CPF'}</span><span className={f.doc ? 'v mono' : 'v ph'}>{f.doc || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Telefone</span><span className={f.tel ? 'v mono' : 'v ph'}>{f.tel || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">E-mail</span><span className={f.email ? 'v mono' : 'v ph'}>{f.email || 'a definir'}</span></div>
              <div className="sm-row"><span className="k">Cidade</span><span className={f.cidade ? 'v' : 'v ph'}>{f.cidade || 'a definir'}</span></div>
              {pj && <div className="sm-row"><span className="k">Contato</span><span className={f.contato ? 'v' : 'v ph'}>{f.contato || 'a definir'}{f.area ? ' · ' + f.area : ''}</span></div>}
            </div>
          </Card>
          <Note icon="info">O cliente entra <b>ativo</b> e já pode receber <b>orçamentos</b> e <b>ordens de serviço</b>. O histórico do ERP Farolti, quando houver, é vinculado pela retaguarda.</Note>
        </div>
      </form>
    </>
  );
}
window.NovoCliente = NovoCliente;
