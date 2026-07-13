/* Retaguarda — placeholder for modules not yet recreated in this UI kit. */
const NS = window.AntonelloTerraplanagemDesignSystem_2ede57;
const { Icon } = NS;

function Placeholder({ icon, label }) {
  return (
    <>
      <h1 className="rtg-pagetitle" style={{ marginBottom: 16 }}>{label}</h1>
      <div className="rtg-empty">
        <div className="rtg-empty-ic"><Icon name={icon} size={26} /></div>
        <h2>Em construção</h2>
        <p>Este módulo existe no sistema Retaguarda e está em construção neste UI kit.</p>
      </div>
    </>
  );
}
window.Placeholder = Placeholder;
