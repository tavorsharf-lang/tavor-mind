import { useMemo } from 'react';
import { selectQuestion } from '../../../utils/reviewQuestions.js';

export default function OpenQuestion({ aggregate }) {
  const { question } = useMemo(() => selectQuestion(aggregate || { scope: 'week' }), [aggregate]);
  return (
    <section className="review-section open-question-section">
      <p className="open-question-prompt">שאלה לשבת איתה אחרי שתסגור:</p>
      <div className="callout callout-question open-question-text">
        {question}
      </div>
    </section>
  );
}
