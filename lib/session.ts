// A full page load, not a move within the app: it drops the cache, so nothing of this
// session is left for the next person on the browser (RF-04).
// `expired` marks a session the API rejected. The cookie may still be in the browser — the
// client cannot delete an httpOnly one — so the guard would bounce /login back to /cases
// for ever. The marker makes the login reachable and breaks the loop (RF-14).
export function goToLogin(expired = false) {
  window.location.assign(expired ? '/login?expirada=1' : '/login')
}
