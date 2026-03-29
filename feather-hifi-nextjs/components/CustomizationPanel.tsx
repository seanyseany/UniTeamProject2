export function CustomizationPanel() {
  const toggles = [
    'Show task board first',
    'Pin unread messages',
    'Display workload insights',
    'Show meeting availability',
  ];

  return (
    <section className="panel panel-padding">
      <div className="section-head">
        <div>
          <p className="muted">Easy viewing feature</p>
          <h3>Customisable home screen</h3>
        </div>
        <button className="ghost-btn">Save layout</button>
      </div>

      <div className="customize-grid">
        {toggles.map((label) => (
          <div className="toggle-row" key={label}>
            <div>
              <strong>{label}</strong>
              <p className="muted" style={{ marginTop: 4 }}>Let each student choose which widgets appear on top.</p>
            </div>
            <div className="toggle" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}
