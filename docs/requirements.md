# Requirements — Evidence Manager Web

Interface requirements. Each one has a stable identifier used across issues, tests and
code: searching for `RF-15` in the repository returns the requirement, the issue that
delivers it, the test that proves it and the code that implements it.

**Requirements `RF-01`–`RF-12` and `RF-21`–`RF-23` are not repeated here.** They describe
the API this application consumes and are defined in
[`evidence-manager-api/docs/requirements.md`](https://github.com/VaneeRivass/evidence-manager-api/blob/main/docs/requirements.md),
together with the endpoint map and the error contract. Every requirement is defined in
exactly one file.

---

## 1. Functional requirements

| ID | Requirement |
|---|---|
| **RF-13** | Registration and login screens showing errors **next to the field that caused them**, with the message from the API |
| **RF-14** | Private routes: with no session, redirect to login **before the page is served**. No flash of protected content |
| **RF-15** | The list renders one of **three distinct states**: **empty**, **loading**, **error** |
| **RF-16** | Create, edit, change status and delete from the interface |
| **RF-17** | Attach evidence (request link → upload → confirm) and download it |
| **RF-18** | **Validation errors** appear next to the field that caused them |
| **RF-19** | **Operation errors** — failed upload, expired link, network down — appear as a floating notice carrying the API error code and, when the action can be repeated, a retry button. Success notices dismiss themselves; error notices wait to be dismissed |
| **RF-20** | Every destructive action requires explicit confirmation. The dialog **names what is lost** — the case and its evidence — and warns it cannot be undone. A generic "are you sure?" is not enough |

---

## 2. What each requirement means in practice

### RF-14 · The guard runs on the server

Next's `middleware.ts` runs before the page is sent. With no session cookie the browser
gets a redirect and never downloads the protected page.

It is **not a security boundary** — that lives in the API, which checks session and
ownership on every request. It is better behaviour: no flash of content that should not
have been shown.

`middleware.ts` lives at the project root, a sibling of `app/`. Placed inside `app/` Next
does not run it, the page loads, everything appears to work, and the guard protects
nothing.

### RF-15 · The three states

| State | What is rendered |
|---|---|
| **Loading** | A skeleton occupying the same space the data will, so the page does not jump when it arrives. Not the word "loading" |
| **Empty** | A message explaining there is nothing yet and a button to create the first case. Not a blank table |
| **Error** | The API error code and a retry button. Not a blank screen |

### RF-17 · The upload, from the client's side

```
1. The person picks a file
   → validate type and size IN THE BROWSER, before any request

2. POST /api/cases/:id/file/upload-url
   → returns { uploadUrl, key, expiresIn }

3. PUT uploadUrl
   → straight to storage, never through the API
   → Content-Type identical to the one that was signed
   → WITHOUT credentials: the session cookie must never travel to storage

4. POST /api/cases/:id/file/complete { key }
   → the API verifies against storage and persists the reference
```

Client-side validation is **for the honest user**: instant feedback, nothing uploaded that
will be rejected. The server validation is for everyone else and cannot be skipped
(`RNF-04`).

If any step fails, the notice says **which one** — asking for the link, uploading, or
confirming — because the fix differs in each case.

### RF-18 and RF-19 · Two kinds of error, two placements

| Kind | Where it appears |
|---|---|
| **Validation** — `400` with fields | Next to the field, through the form library's error API |
| **Operation** — upload failed, link expired, network down | A floating notice with the code and, where it applies, a retry button |

The API emits stable codes with parameters (`RF-23`); this application turns them into
sentences. That mapping lives in one file.

---

## 3. Non-functional requirements this application is responsible for

The full list lives in the API repository. These are the ones enforced here:

| ID | What this application must do |
|---|---|
| **RNF-03** | Never read, store or attach the token. The browser holds the `httpOnly` cookie and sends it by itself. There is no `saveToken()` or `readToken()` |
| **RNF-04** | Treat client-side validation as convenience only. The server decides |
| **RNF-09** | Never hardcode the API origin. Every call is relative and goes through the proxy |

---

## 4. The proxy

Every API call is relative — `fetch('/api/cases')` — and a rewrite forwards it:

```js
// next.config.js
async rewrites() {
  return [{ source: '/api/:path*', destination: `${process.env.API_URL}/:path*` }]
}
```

The browser only ever talks to its own origin, so the session cookie is first-party with
`SameSite=Lax` and **there is no CORS at all**: the same-origin policy is a browser rule,
and the hop between domains happens server to server.

Without this, the cookie would be cross-site, would require `SameSite=None`, and **Safari
blocks it** — the demo would work or not depending on the reviewer's browser.

**The variable is `API_URL`, never `NEXT_PUBLIC_API_URL`.** Anything prefixed
`NEXT_PUBLIC_` is inlined into the bundle the browser downloads and anyone can read it. The
rewrite runs on Next's server, so the variable stays server-side. Using the public prefix
would publish the API origin in the client bundle — exactly what the proxy exists to
prevent.

The upload does not go through the proxy: it goes straight from the browser to storage.

---

## 5. Interface language

Everything in this repository is written in English — code, identifiers, commits, issues
and documentation. **The exception is the text a person reads on screen, which is in
Spanish**, composed here from the codes the API emits.

```ts
// lib/messages.es.ts
export const messages = {
  TOO_SHORT:      ({ min }) => `Mínimo ${min} caracteres`,
  TOO_LARGE:      ({ max }) => `El archivo supera ${max} MB`,
  INVALID_FORMAT: () => 'Formato no válido',
}
```

No internationalisation library and no locale switcher. Adding a second language would be
adding one more file: an open door, not a built room.

---

## 6. Known limitations

The system-wide list lives in the API repository. These concern the interface:

**Pagination controls are not exposed.** The listing is bounded on the server, which is
where the risk was, and the response envelope already accepts pagination fields. Only the
controls are missing.

**Tests substitute the API client directly**, rather than intercepting network requests.
Mock Service Worker would be the canonical choice and is the next increment; setting it up
costs more than it returns for three tests.

**Types are duplicated, not generated.** The validation schemas mirror the API's by hand,
because the repositories are independent and publishing a shared package would couple their
builds. The proper resolution is to generate them: the API's schemas already produce an
OpenAPI document, and a command turns that document into types this application never edits
by hand.
