// Hand off a built prompt to claude.ai in a single user gesture: copy to
// clipboard + open the project URL in a new tab. Critical detail — the
// clipboard write must be fire-and-forget (no await) so Safari treats the
// click as the originator of both actions.

export const CLAUDE_CONVERSATION_PROJECT_URL =
  'https://claude.ai/project/019e4074-ebe0-7103-a92e-71503e07ed24';

export function copyAndOpen(text, url) {
  try {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
  } catch {
    /* clipboard blocked — still open Claude so user can paste manually */
  }
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch {
    /* popup blocked — caller can fallback */
  }
}
