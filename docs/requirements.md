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
| **RF-13** | Registration and login screens showing errors **next to the field that caused them**, with the message from the API. Registering **does not sign the person in**: they sign in themselves |
| **RF-14** | Private routes: with no session, redirect to login **before the page is served**. No flash of protected content. Everything is private except the login and registration screens. An address that does not exist shows a not-found page **inside** the private layout |
| **RF-15** | The list renders one of **three distinct states**: **empty**, **loading**, **error** |
| **RF-16** | Create, edit, change status and delete from the interface |
| **RF-17** | Attach evidence by dropping a file or picking it, and download it. A chosen file is **shown for confirmation before anything is sent**, because evidence cannot be replaced once attached. The upload is **one action with one progress bar**: the three calls behind it (request link → upload → confirm) are never shown as steps |
| **RF-18** | **Validation errors** appear next to the field that caused them |
| **RF-19** | **Operation errors** — failed upload, expired link, network down — appear as a floating notice carrying the API error code and, when the action can be repeated, a retry button. Success notices dismiss themselves; error notices wait to be dismissed |
| **RF-20** | Every destructive action requires explicit confirmation. The dialog **names what is lost** — the case and its evidence — and warns it cannot be undone. A generic "are you sure?" is not enough |

---

## 2. What each requirement means in practice

### RF-13 · Registering does not sign you in

The API's registration answers `201` without a session; only login sets the cookie. After
registering, the person lands on the login screen with a notice that the account was
created, and signs in themselves.

Signing them in straight away would save typing the password twice, but the login screen
could then only be tried after signing out. Keeping the two steps apart keeps each one
testable on its own, and the client never sends the password more than once per submit.

### RF-14 · The guard runs on the server

Next's `proxy.ts` runs before the page is sent. With no session cookie the browser gets a
redirect and never downloads the protected page.

Next 16 renamed this file, formerly `middleware.ts`. Despite the name, it is the route
guard — not the rewrite in section 4, which is what this project calls "the proxy".

It is **not a security boundary** — that lives in the API, which checks session and
ownership on every request. It is better behaviour: no flash of content that should not
have been shown.

`proxy.ts` lives at the project root, a sibling of `app/`. Placed inside `app/` Next
does not run it, the page loads, everything appears to work, and the guard protects
nothing.

**Everything is private except `/login` and `/register`.** The guard lists what is public,
not what is private, so a route added later is protected without anyone remembering to
add it.

| Address | With a session | Without one |
|---|---|---|
| `/` | `/cases` | `/login` |
| `/login`, `/register` | `/cases` — to see them, sign out first | The form |
| An address that does not exist | The not-found page, inside the private layout | `/login` |

**The not-found page keeps the top bar** — email and sign-out — so the person sees their
session is intact and the application is not broken. It says what happened in plain words,
offers **Back to my cases** as the main way out and **Back** as the second. It is never a
redirect without warning, which leaves the person unsure whether the link failed or they
did something wrong. Without a session there is no such page: the guard does not know who is
asking, and telling a stranger which addresses exist is already telling them something.

**The guard can only see that a cookie exists, not that it is valid.** Verifying the token
needs the API's secret, which must not leave the API; asking the API on every navigation
would add a request to every page for everyone. So on private pages the guard only checks
that the cookie is there. A cookie that no longer holds — the secret was rotated, or the
cookie was made up — gets past it: the page's frame is served, the request for the current
user (`/auth/me`) answers `401`, and the person is sent to the login. What shows for that
moment is the empty frame, never data: every request for data answers `401` too.
Accepted: a normal session expires together with its cookie, which the browser then deletes
by itself.

**On `/login` and `/register` the guard does ask the API**, and only there, only when a
cookie is present. Redirecting a signed-in person to `/cases` on the strength of a cookie
alone would loop with the rule above: `/cases` sends a rejected cookie to the login, the
login sends the cookie back to `/cases`. The client cannot break the loop — the cookie is
`httpOnly` — and the API's sign-out needs a valid session. So the guard calls `/auth/me`:
valid, it redirects to `/cases`; rejected, it **deletes the cookie** and serves the form.
It can, because it runs on Next's server, where `httpOnly` does not apply. The extra request
happens only when someone holding a cookie opens those two screens.

**Signing out** (`RF-04`) asks the API to clear the cookie, empties the client's cache so
the next person on the same browser never sees the previous one's data, and returns to the
login.

### RF-15 · The three states

| State | What is rendered |
|---|---|
| **Loading** | A skeleton occupying the same space the data will, so the page does not jump when it arrives. Not the word "loading" |
| **Empty** | A message explaining there is nothing yet and a button to create the first case. Not a blank table |
| **Error** | The API error code and a retry button. Not a blank screen |

### RF-17 · The upload, from the client's side

What the person sees: drop a file on the evidence area, or pick it with the button; the
file is shown with its name and size and a warning that it cannot be changed later; they
press **Attach**, and a single progress bar runs until the file is attached. Nothing is
sent until they press it — evidence is never replaced (`RF-10`), so choosing the wrong
file must be cheap to undo. The calls below happen inside `useFileUpload` and never
appear on screen.

```
1. The person drops or picks a file
   → validate type and size IN THE BROWSER, before any request
   → show it for confirmation; "Choose another" discards it, "Attach" continues

2. POST /api/cases/:id/file/upload-url
   → returns { uploadUrl, key, expiresIn }

3. PUT uploadUrl
   → straight to storage, never through the API
   → Content-Type identical to the one that was signed
   → WITHOUT credentials: the session cookie must never travel to storage
   → sent with axios, whose onUploadProgress reports a real percentage; fetch
     cannot report upload progress in every browser

4. POST /api/cases/:id/file/complete { key }
   → the API verifies against storage and persists the reference
   → the bar is full and reads "Finishing…" until this answers
```

Client-side validation is **for the honest user**: instant feedback, nothing uploaded that
will be rejected. The server validation is for everyone else and cannot be skipped
(`RNF-04`).

If any step fails, the notice says **what went wrong in the person's terms**, not which
step: the upload could not start, it was interrupted, or the file could not be verified.
Each has its own message because the fix differs — retry, check the connection, or pick
another file — but none of them mentions links or confirmations.

### RF-18 and RF-19 · Two kinds of error, two placements

| Kind | Where it appears |
|---|---|
| **Validation** — `400` with fields | Next to the field, through the form library's error API |
| **About the whole form** — wrong credentials (`INVALID_CREDENTIALS`) | Inside the form, above its button. The message only, without the code, like field errors. The API does not say which field failed, on purpose (`RF-02`), so it cannot sit under one |
| **Operation** — upload failed, link expired, network down | A floating notice with the code and, where it applies, a retry button |

A duplicate email (`EMAIL_TAKEN`, `409`) is a top-level code in the API, but it is about one
field, so it renders under the email field.

The API emits stable codes with parameters (`RF-23`); this application turns them into
sentences. That mapping lives in one file.

Two failures never reach the API's error format, yet `RF-19` still requires a code on the
notice. For those, this application assigns its own, in `lib/api.ts`:

| Code | When | Why the API cannot provide it |
|---|---|---|
| `NETWORK_ERROR` | A request gets **no response from the API** — no connection, or the proxy answering for an API it cannot reach (a `500` with no problem body) | Either nothing arrives, or what arrives comes from Next, not the API: there is no code to read |
| `UPLOAD_FAILED` | The `PUT` to storage fails — the connection drops, or storage answers with an error such as `403` or `5xx` | Storage is not this system's API: it answers in XML, not RFC 9457, and knows nothing of these codes |

A `500` from the API is **not** one of these: it arrives in RFC 9457 with its own code
(`INTERNAL_ERROR`) and is shown as is.

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

Every API call is relative — the axios instance uses `baseURL: '/api'` — and a rewrite forwards it:

```js
// next.config.ts
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
