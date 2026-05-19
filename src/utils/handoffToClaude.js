// Hand off a built prompt to claude.ai in a single user gesture: copy to
// clipboard + open the project URL in a new tab. Critical detail — the
// clipboard write must be fire-and-forget (no await) so Safari treats the
// click as the originator of both actions.

export const CLAUDE_CONVERSATION_PROJECT_URL =
  'https://claude.ai/project/019e0f55-801c-7678-a509-a30da71d5386';

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
