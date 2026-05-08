import ToolHeader from './components/ToolHeader.jsx';
import { letterMeta, letterDefault } from '../../data/selfLetter.js';

export default function SelfLetter() {
  const paragraphs = letterDefault.trim().split(/\n\n+/);
  return (
    <div className="tool-page ds2-themed">
      <ToolHeader title={letterMeta.title} subtitle={letterMeta.context} subtitleItalic />
      <main className="tool-content">
        <article className="letter-paper">
          {paragraphs.map((p, i) => (
            <p key={i} className="letter-paragraph">{p}</p>
          ))}
          <div className="letter-chip">
            נכתב במצב טוב • לקריאה כשצריך
          </div>
        </article>
        <p className="letter-footnote">זה הטקסט המוגדר כברירת מחדל. בעתיד תוכל לערוך אותו.</p>
      </main>
    </div>
  );
}
