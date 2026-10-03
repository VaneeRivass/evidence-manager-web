// RF-04 · a full page load, not a move within the app: it drops the cache, so nothing of
// this session is left for the next person on the browser
export function goToLogin() {
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- the full load is the point: it drops the cache
  window.location.assign('/login')
}
