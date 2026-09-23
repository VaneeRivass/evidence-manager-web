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
| `../docs/` | Internal working notes, in Spanish. Not published |

**Do not answer from memory about requirements or decisions: read them.**

---

## Stack

| | |
|---|---|
| Framework | **Next.js**, App Router · TypeScript in strict mode |
| Server state | **TanStack Query** — the three required list states, plus invalidation |
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
  (app)/cases/page.tsx
  (app)/cases/[id]/page.tsx
  layout.tsx
components/
  ui/                    shadcn — do not lint, do not reformat
  cases/CaseTable.tsx    domain components
hooks/
  useCases.ts            TanStack Query. The only place that knows API routes
  useFileUpload.ts       the three upload steps
lib/
  api.ts                 the ONLY place that calls fetch
  schemas.ts             Zod
  messages.es.ts         error code → Spanish text
middleware.ts            route guard. AT THE PROJECT ROOT, a sibling of app/ —
                         inside app/ Next does not run it
next.config.js           the rewrite
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
an environment variable. A rewrite in `next.config.js` forwards to the API, which is what
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
await fetch(uploadUrl, {
  method: 'PUT',
  body: file,
  headers: { 'Content-Type': file.type },  // must match what was signed
  // no credentials: the session cookie must never travel to Cloudflare
})
```

**`lib/api.ts` is the only place that calls `fetch` to the API**, and the only place that
turns an RFC 9457 response into a typed error.

**Validate size and MIME type in the browser before requesting anything.** That is for the
honest user: instant feedback, no upload that fails. The server validation is for everyone
else and cannot be skipped.

**The list always renders one of three states: empty, loading, error.** Loading is a
skeleton, not the word "loading", so the page does not jump when data arrives.

**Two kinds of error, two placements.** Validation errors render next to the field that
caused them. Operation errors — failed upload, expired link, network down — render as a
floating notice carrying the API code and, when the action can be repeated, a retry button.

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

Few and well chosen: the list in its three states, and that the file input rejects a wrong
type or an oversized file **without calling the API**.

The API client is substituted with `vi.mock()`. MSW would be the canonical choice and is
noted in the README as the next increment; setting it up costs more than it returns for
three tests.
