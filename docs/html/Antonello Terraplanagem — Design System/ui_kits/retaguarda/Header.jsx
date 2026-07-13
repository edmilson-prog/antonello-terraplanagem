/* Retaguarda — sticky top header (breadcrumbs + AI + theme + user). */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Button, IconButton, Avatar, Icon } = NS;

function Header({ crumbs }) {
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
      <IconButton icon="sun" label="Tema claro" />
      <div className="rtg-user"><Avatar initials="AA" size={28} /> <b>Admin AILA</b></div>
    </header>
  );
}
window.Header = Header;
