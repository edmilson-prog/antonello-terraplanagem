/* Retaguarda — tela de login (acesso restrito à gestão). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Button, Icon, Note } = NS;

function Login({ onLogin }) {
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  function submit(e) {
    e.preventDefault();
    if (loading) return;
    if (!user.trim() || !pass.trim()) { setError('Informe usuário e senha para entrar.'); return; }
    setError('');
    setLoading(true);
    setTimeout(() => onLogin && onLogin(), 900);
  }

  return (
    <div className="rtg-login" data-screen-label="Login">
      {/* PAINEL DA MARCA */}
      <aside className="rtg-login-brand">
        <div className="rtg-login-brand-in">
          <div className="rtg-brand-row">
            <div className="rtg-logo" style={{ width: 46, height: 46, borderRadius: 13 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#16140f" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
                <path d="M3 20h18" /><path d="M6 20v-4h4v4" /><path d="m10 16 3-7 5 4v3" />
              </svg>
            </div>
            <div className="rtg-brand-name" style={{ fontSize: 17 }}>ANTONELLO<small>TERRAPLANAGEM</small></div>
          </div>
          <div className="rtg-hazard" style={{ margin: '18px 0 0' }}><div style={{ height: 8, background: 'var(--hazard)' }}></div></div>
          <h2>Gestão da operação — do orçamento à nota fiscal.</h2>
          <div className="rtg-login-feats">
            <div className="f"><span className="atp-tile atp-tile--amber" style={{ width: 30, height: 30 }}><Icon name="clipboard-list" size={16} /></span>Ordens de Serviço e medições</div>
            <div className="f"><span className="atp-tile atp-tile--amber" style={{ width: 30, height: 30 }}><Icon name="gauge" size={16} /></span>Apontamentos por horímetro</div>
            <div className="f"><span className="atp-tile atp-tile--amber" style={{ width: 30, height: 30 }}><Icon name="wallet" size={16} /></span>Faturamento e custo da hora</div>
          </div>
        </div>
        <div className="rtg-login-foot">
          <span className="st"><i></i>Sistemas operacionais</span>
          <span className="vs">v0.1 · fundação</span>
        </div>
      </aside>

      {/* FORMULÁRIO */}
      <main className="rtg-login-main">
        <form className="rtg-login-card" onSubmit={submit} noValidate>
          <div className="eyebrow" style={{ color: 'var(--amarelo)' }}>Acesso restrito</div>
          <h1>Entrar na Retaguarda</h1>
          <p className="sub">Use as credenciais fornecidas pela administração.</p>

          <label className="rtg-field">
            <span className="k">Usuário</span>
            <span className="bx">
              <Icon name="user" size={16} />
              <input type="text" value={user} placeholder="nome.sobrenome" autoComplete="username"
                onChange={(e) => { setUser(e.target.value); setError(''); }} />
            </span>
          </label>

          <label className="rtg-field">
            <span className="k">Senha</span>
            <span className="bx">
              <Icon name="lock" size={16} />
              <input type={show ? 'text' : 'password'} value={pass} placeholder="••••••••" autoComplete="current-password"
                onChange={(e) => { setPass(e.target.value); setError(''); }} />
              <button type="button" className="eye" aria-label={show ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setShow(!show)}>
                <Icon name={show ? 'eye-off' : 'eye'} size={16} />
              </button>
            </span>
          </label>

          <div className="rtg-login-row">
            <label className="rem">
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span className="ck"><Icon name="check" size={11} strokeWidth={2.6} /></span>
              Manter conectado
            </label>
            <a href="#" onClick={(e) => e.preventDefault()}>Esqueci minha senha</a>
          </div>

          {error && <div className="rtg-login-err"><Icon name="circle-alert" size={15} />{error}</div>}

          <Button type="submit" variant="primary" icon={loading ? 'clock' : 'log-in'} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px 13px', fontSize: 14 }}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>

          <div style={{ marginTop: 18 }}>
            <Note icon="smartphone" tone="steel">Operadores de campo não entram por aqui — o apontamento é feito pelo <b>app de campo</b>.</Note>
          </div>
        </form>
      </main>
    </div>
  );
}
window.Login = Login;
