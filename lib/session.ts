// RF-04 · RF-14 · leaving the session: a full page load to the login, not a move within the
// application. The page is dropped and, with it, the query cache, so nothing of this
// session is left for the next person on the browser. Used on sign-out and on any 401.
export function goToLogin() {
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- the full load is the point: it drops the cache
  window.location.assign('/login')
}
