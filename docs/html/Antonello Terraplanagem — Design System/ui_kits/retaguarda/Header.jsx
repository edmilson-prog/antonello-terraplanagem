/* Retaguarda — sticky top header (breadcrumbs + AI + theme + user). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Button, IconButton, Avatar, Icon } = NS;

function Header({ crumbs }) {
  const [theme, setTheme] = React.useState(() => {
    try { return localStorage.getItem('rtg-theme') || 'dark'; } catch (e) { return 'dark'; }
  });
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('rtg-theme', theme); } catch (e) {}
  }, [theme]);
  const light = theme === 'light';
  return (
    <header className="rtg-header">
      <div className="rtg-crumbs">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className="sep"><Icon name="chevron-right" size={15} /></span>}
            <span className={c.here ? 'here' : ''}>{c.label}</span>
          </React.Fragment>
        ))}
      </div>
      <div className="rtg-spacer" />
      <Button variant="ai" icon="sparkles">Perguntar à IA</Button>
      <IconButton icon={light ? 'moon' : 'sun'} label={light ? 'Tema escuro' : 'Tema claro'}
        onClick={() => setTheme(light ? 'dark' : 'light')} />
      <div className="rtg-user"><Avatar initials="AA" size={28} /> <b>Admin AILA</b></div>
    </header>
  );
}
window.Header = Header;
