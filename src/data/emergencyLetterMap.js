// Letter card copy by closing-score zone (computed in Phase10).
// Replaces the previous activation-based mapping — what matters is the user's
// state at the *end* of the flow, not the start. The whole point of the flow
// is to change activation, so gating on initial activation defeats the purpose.
// The letter content itself comes from `letterDefault` in data/selfLetter.js.
export const LETTER_COPY_BY_ZONE = {
  high: {
    lead: 'הילד שבך כתב לעצמו פעם משהו. עכשיו זה זמן טוב להזכיר.',
    cta: 'פתח מכתב',
  },
  mid: {
    lead: 'יש מכתב שכתבת לעצמך. אתה לא חייב לקרוא אותו עכשיו — אבל הוא כאן אם תרצה.',
    cta: 'פתח מכתב',
    declineCta: 'לא עכשיו',
    afterDeclineHint: 'אם תרצה אחר כך — המכתב נמצא ב-Toolbox, תמיד זמין.',
  },
};
