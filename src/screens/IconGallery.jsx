import ToolHeader from './toolbox/components/ToolHeader.jsx';
import { ICON_CATEGORIES, ICON_INDEX } from '../components/icons/system.jsx';

export default function IconGallery() {
  return (
    <div className="icon-gallery ds2-themed">
      <ToolHeader
        title="מערכת האייקונים"
        subtitle="48 אייקונים · 7 קטגוריות · DS3 outline"
        backTo="/"
      />
      <main className="icon-gallery-main">
        {ICON_CATEGORIES.map((cat) => {
          const entries = Object.entries(ICON_INDEX).filter(
            ([, meta]) => meta.cat === cat.id,
          );
          return (
            <section key={cat.id} className="icon-gallery-section">
              <header className="icon-gallery-section-head">
                <h2 className="icon-gallery-section-title">{cat.title}</h2>
                <p className="icon-gallery-section-note">{cat.note}</p>
              </header>
              <ul className="icon-gallery-grid">
                {entries.map(([name, meta]) => {
                  const Icon = meta.Component;
                  return (
                    <li key={name} className="icon-gallery-card">
                      <span className="icon-gallery-card-icon">
                        <Icon size={32} title={meta.he} />
                      </span>
                      <span className="icon-gallery-card-he">{meta.he}</span>
                      <span className="icon-gallery-card-name">{name}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}
