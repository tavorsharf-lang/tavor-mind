export const SENSES_54321 = [
  { count: 5, sense: 'sight',   label: 'דברים שאתה רואה',   action: 'ראיתי אחד' },
  { count: 4, sense: 'hearing', label: 'דברים שאתה שומע',   action: 'שמעתי אחד' },
  { count: 3, sense: 'touch',   label: 'דברים שאתה חש במגע', action: 'חשתי אחד' },
  { count: 2, sense: 'smell',   label: 'דברים שאתה מריח',   action: 'הרחתי אחד' },
  { count: 1, sense: 'taste',   label: 'דבר שאתה טועם',     action: 'טעמתי' },
];

export const COLOR_SCAN = [
  { count: 3, color: 'green', label: 'דברים ירוקים', action: 'מצאתי 3 דברים ירוקים' },
  { count: 3, color: 'red',   label: 'דברים אדומים',  action: 'מצאתי 3 דברים אדומים' },
];

export const ACTIVATION_TO_TECHNIQUE = {
  hyper: 'colors',
  hypo:  'senses',
  mid:   'senses',
};
