import "server-only";

/** Resolve the app's own origin without trusting client-supplied headers. */
export function getAppOrigin(requestOrigin?: string) {
  const candidates = [process.env.NEXT_APP_URL, requestOrigin];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      return new URL(candidate).origin;
    } catch {
      // Ignore malformed values and try the next candidate.
    }
  }

  return "http://localhost:3000";
}
