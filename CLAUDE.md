# Evidence Manager Web

Next.js App Router front end for the evidence manager. A private application behind a
login: no public pages, no SEO.

---

## Specification

The system specification lives in the **API repository**, because requirements and
architecture decisions span both:

| Where | What |
|---|---|
| `docs/requirements.md` | `RF-13`…`RF-20` — this app's requirements live here |
| `evidence-manager-api/docs/requirements.md` | The API contract: endpoints, error format (`RF-21`…`RF-23`) |
| `evidence-manager-api/docs/adr/` | The six system decisions |
| `docs/adr/0007-front-architecture.md` | This app's own decision: client components, no BFF |
| `docs/mockup.html` | The mockup: every screen, numbered. «Mockup screen 12» in code and requirements means its screen 12. Open it in a browser |
| `../docs/` | Internal working notes, in Spanish. Not published |

**Do not answer from memory about requirements or decisions: read them.**

In code and comments, `RF-xx` / `RNF-xx` point at those requirements and «mockup screen N» points
at `docs/mockup.html`. A sentence around an id must stand on its own: the id is a pointer, never
the explanation. Prose first, the id as a trailing reference.

---

## Stack

| | |
|---|---|
| Framework | **Next.js**, App Router · TypeScript in strict mode |
| Server state | **TanStack Query** — the three required list states, plus invalidation |
| HTTP client | **axios** — one instance in `lib/api.ts`; `onUploadProgress` gives the upload bar a real percentage |
| Forms | **React Hook Form** + `zodResolver` |
| Validation | **Zod**, duplicated from the API on purpose (separate repositories) |
| Styling | **Tailwind** + **shadcn/ui** — components are copied into this repo, not imported |
| Icons | **lucide-react**, shadcn's default |
| Notices | **sonner** |
| Tests | **Vitest** + **Testing Library** |

---

## Structure

```
app/
  (auth)/login/page.tsx
  (auth)/register/page.tsx
  (app)/layout.tsx       the top bar over every private page
  (app)/cases/page.tsx
  (app)/cases/[id]/page.tsx
  layout.tsx
  not-found.tsx          any other address. Wraps itself in (app)/layout to keep the top bar
  providers.tsx          TanStack Query client and the notices' Toaster. Its opening comment
                         maps where every failed request ends up (RF-14, RF-19)
components/
  ui/                    shadcn — do not lint, do not reformat
  common/                FormField, StatePanel, LoadError, SkeletonBar, BackButton, Brand
  app/                   TopBar
  auth/ cases/           domain components
hooks/
  useSession.ts          TanStack Query. Auth routes: who is signed in, sign in and out
  useCase.ts             one case
  useCases.ts            the list and every change to a case
  useFileUpload.ts       the three upload steps
lib/
  api.ts                 the ONLY place that makes HTTP requests (axios), and the only
                         place that unwraps `.data`: hooks get the body, not AxiosResponse
  cases.ts               the Case type and the list envelope (the domain, not a hook)
  schemas.ts             Zod
  files.ts               the evidence's allowed types and size, copied from the API (RF-17)
  messages.es.ts         error code → Spanish text
  notify.tsx             the floating notices, error and success (RF-19)
  session.ts             goToLogin: a full page load, which drops the cache (RF-04)
  formErrors.ts          showFieldErrors: an API's field errors on a form's own fields (RF-18)
  caseFilters.ts         the list's filter and ordering, to and from the address
  format.ts              dates and sizes in Spanish, with Intl
proxy.ts                 route guard (Next 16 renamed middleware.ts to proxy.ts).
                         AT THE PROJECT ROOT, a sibling of app/ — inside app/ Next
                         does not run it. Not to be confused with the rewrite
next.config.ts           the rewrite
```

| Layer | Knows about | Does not know about |
|---|---|---|
| `page.tsx` | Composing the screen | HTTP, API routes |
| `components/` | Rendering and emitting events | Where data comes from |
| `hooks/` | What to request and when to refresh | How a request is made |
| `lib/api.ts` | HTTP, headers, translating errors | Anything about the domain |

**Almost everything is a Client Component.** This is a private application behind a login,
made of forms and tables — a client application by definition. Server Components fetching
from an external API that requires an httpOnly cookie means forwarding the cookie by hand
and fighting Next's cache, complexity with no return here. Only two things run on the
server: the route guard and the proxy.

---

## Rules that must not be broken

**The front never touches the token.** There is no `saveToken()` or `readToken()`. The
browser stores the httpOnly cookie and attaches it automatically on same-origin requests.
That is the entire point of `httpOnly`.

**All API calls are relative: `/api/cases`.** Never an absolute URL, never a base URL from
an environment variable. A rewrite in `next.config.ts` forwards to the API, which is what
makes the cookie first-party and removes CORS entirely.

```js
async rewrites() {
  return [{ source: '/api/:path*', destination: `${process.env.API_URL}/:path*` }]
}
```

**`API_URL`, never `NEXT_PUBLIC_API_URL`.** Anything prefixed `NEXT_PUBLIC_` is inlined
into the bundle the browser downloads, and anyone can read it. The rewrite runs on Next's
server, so the variable must stay server-side. Using the public prefix would expose the
API origin in the client bundle — exactly what the proxy exists to avoid.

**The upload goes straight to storage, without credentials.**

```ts
await axios.put(uploadUrl, file, {         // plain axios, NOT the `api` instance: R2 is not our API
  headers: { 'Content-Type': file.type },   // must match what was signed
  onUploadProgress: (e) => onProgress(e.progress ?? 0),
})
// withCredentials stays false: the session cookie must never travel to Cloudflare
```

To the person it is one action — choose a file, confirm it, watch one bar — never three
steps (`RF-17`). Nothing is sent before they press **Attach**: evidence cannot be replaced.

**`lib/api.ts` is the only place that makes HTTP requests** — the axios instance for the
API, and the plain `axios.put` to storage — and the only place that turns an RFC 9457
response into a typed error, in a response interceptor. Hooks say what to request and
when; they never build a request.

**Validate size and MIME type in the browser before requesting anything.** That is for the
honest user: instant feedback, no upload that fails. The server validation is for everyone
else and cannot be skipped.

**The list always renders one of three states: empty, loading, error.** Loading is a
skeleton, not the word "loading", so the page does not jump when data arrives.

**Two kinds of error, two placements.** Validation errors render next to the field that
caused them. Operation errors — failed upload, expired link, network down — render as a
floating notice carrying the API code. The notice has no retry button: the action's own
button is still on screen and is the retry. Only the error screens, where the error is the
whole page, carry one (RF-15, RF-19).

**`components/ui/` is not linted and not reformatted.** It is shadcn's code, copied in.
Fighting its style produces diff noise for nothing.

**User-facing text is composed here, in Spanish.** The API emits stable codes with
parameters; `lib/messages.es.ts` turns them into sentences. Everything else in this
repository is in English.

**Destructive actions require confirmation that names what is lost** — the case and its
evidence — and warns it cannot be undone. Not a generic "are you sure?".

**Real `<button>`, `<a href>` and `<input>` with their `<label>`.** Never `onClick` on a
`div`: the keyboard skips it.

---

## Commands

```bash
npm run dev                    # port 3000. The API must be running on 3001
npm run build                  # a build that fails here would fail on Vercel
npm start

npm test
npm run lint
npx tsc --noEmit

npx shadcn@latest add button dialog input   # copies the component into components/ui/
```

To exercise a full vertical slice, three terminals:

```
docker compose up -d                       (in the API repository)
npm run dev                                (in the API repository, port 3001)
npm run dev                                (here, port 3000)
```

---

## Testing

Few and well chosen, on what a person sees and on rules that are cheap to break:

| What | Where |
|---|---|
| The list: loading, empty, error, and with cases | `CaseList.test.tsx` |
| The file input rejects a wrong type or an oversized file **without calling the API** | `EvidencePanel.test.tsx` |
| An action without a form gets a notice; a 401 signs out with none | `app/providers.test.tsx` |
| A form shows a field error under its field and anything else as a notice, and cannot be closed while saving | `CaseFormDialog.test.tsx` |
| The rules copied from the API: file type and size at the limit, title and description lengths, password bytes | `lib/files.test.ts`, `lib/schemas.test.ts` |
| Sizes and dates as a person reads them | `lib/format.test.ts` |
| The API client returns the body and names its failures | `lib/api.test.ts` |
| The address is the filters' home: read and written back | `lib/caseFilters.test.ts` |
| A validation error lands on the form's own field, and nowhere else | `lib/formErrors.test.ts` |
| The guard's redirects, seen from a bare request | `proxy.test.ts` |
| The upload's three steps and the case they leave in the cache | `hooks/useFileUpload.test.tsx` |
| The case page: loading, the case, not found and an error | `CaseDetail.test.tsx` |
| Sign in and registration, and where each failure lands | `AuthForm.test.tsx` |
| A notice carries the code, and a 401 gets none | `lib/notify.test.ts` |

The API client is substituted with `vi.mock()`. MSW would be the canonical choice and is
noted in the README as the next increment; setting it up costs more than it returns here.
