# ADR-0007 · Front-end architecture: client components, no BFF

**Status:** accepted · **Date:** 2026-09-22
**Scope:** this decision belongs to the web repository. The other six describe the system
and live in the API repository.

## Context

Next.js provides routing — folders are routes — and a set of conventions. **It does not
provide an architecture**: that has to be decided.

Its App Router makes every component a Server Component by default. Interactivity requires
opting out per file. So the first decision is where the line falls, and the second is
whether this application should do any work of its own on the server beyond rendering.

The application sits behind a login: forms, tables, dialogs and file uploads. No public
pages, nothing to index.

## Decision

**Almost everything is a Client Component**, and data is fetched from the browser through a
server-state library. Only two things run on the server: the route guard in `middleware.ts`
and the rewrite that proxies API calls.

Responsibilities are layered:

| Layer | Knows about | Does not know about |
|---|---|---|
| Page | Composing the screen | HTTP, API routes |
| Components | Rendering and emitting events | Where data comes from |
| Hooks | What to request and when to refresh | How a request is made |
| API client | HTTP, headers, translating errors | Anything about the domain |

**This is not a BFF.** Nothing runs on this server on the application's behalf: the rewrite
forwards requests without transforming them, and holds no logic.

## Alternatives considered

**Vite instead of Next.** The obvious question: this is a single-page application behind a
login, which is exactly what Vite is for, and it would have been simpler. Two things
decided against it. The team this is written for works with Next, so the choice carries
value beyond this project. And Next provides a route guard that runs on the server, so a
private page is never sent to a browser without a session — with Vite the whole bundle
ships and the redirect happens in the browser, after the fact.

**Using Next the way Next wants: Server Components fetching the data.** That is the
framework's default and the reason its App Router exists. It was rejected because the API
requires an `httpOnly` cookie, which a Server Component does not forward on its own: it
would have to be read from the request and attached by hand on every call. Add Next's
caching layers on top and the result is a fight with the framework, for a page nobody will
index and where nothing is gained by rendering it on a server.

## Consequences

**In favour.** The mental model is small: a screen composes, a hook fetches, a client
speaks HTTP. The route guard still runs on the server, so no protected content flashes
before a redirect. And the proxy delivers the only benefit a BFF would have provided here —
the browser never learns the API's real origin — without its weight.

**Against.** Nothing renders until JavaScript loads, which behind a login is acceptable and
for a public page would not be. The data-fetching pattern is fixed: moving part of it to
the server later would mean revisiting the cookie handling deliberately, not as an
afterthought.
