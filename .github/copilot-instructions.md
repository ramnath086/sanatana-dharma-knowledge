\# Sanatana Dharma Knowledge Portal — Copilot Instructions



\## Project

This is a scholarly, source-aware Sanatana Dharma knowledge portal.



Existing architecture:

\- React + Vite

\- Markdown is the canonical knowledge source

\- Content is validated and compiled into public artifacts

\- Supabase = editorial persistence/auth only

\- Cloudflare = public hosting/deployment

\- GitHub = source control

\- Public site contains published content only

\- Editorial system is private and separate

\- Phase 12 lazy-loading/code-splitting must be preserved



\## Core rules

\- Inspect existing code before changing anything.

\- Reuse existing architecture and components.

\- Make the smallest necessary change.

\- Do not redo completed work.

\- Do not redesign the UI unless explicitly requested.

\- Do not refactor unrelated code.

\- Do not migrate the knowledge corpus from Markdown into Supabase.

\- Markdown remains canonical.



\## Content integrity

Never:

\- invent sources, evidence, dates, licenses, manuscripts, history, or citations

\- fabricate doctrinal claims

\- scrape copyrighted material

\- reproduce copyrighted translations

\- present one sampradaya interpretation as universally authoritative

\- expose unpublished editorial content



Preserve distinctions between:

\- textual

\- traditional

\- scholarly

\- modern

\- regional

\- sampradaya-specific perspectives



Preserve uncertainty when evidence is insufficient.



\## Supabase

Use Supabase for:

\- Auth

\- PostgreSQL

\- Row Level Security

\- persistent editorial workflow



Required roles:

\- ADMIN

\- SENIOR\_EDITOR

\- EDITOR

\- TRADITIONAL\_REVIEWER



Security:

\- RLS must be authoritative.

\- Default deny.

\- Prevent privilege escalation.

\- Editors cannot bypass approval/publication gates.

\- Public users cannot access editorial data.

\- Never expose Supabase service-role keys in client code.



\## Editorial workflow

Preserve:



DISCOVERED

→ RESEARCHING

→ DRAFT

→ SOURCE-CHECK

→ EDITORIAL-REVIEW

→ TRADITIONAL-REVIEW when appropriate

→ APPROVED

→ PUBLISHED

→ ARCHIVED



Persist reviews, assignments, source verification, evidence review, revisions and audit events.



\## Publication

Publication must be controlled.



Before publishing:

\- verify current content hash

\- verify editorial approvals

\- verify source/evidence requirements

\- verify rights

\- exclude drafts/review items



Changed content must invalidate stale approval.



Never allow an EDITOR to bypass publication gates.



\## Public/private boundary

Public artifacts may contain only:

\- published entities

\- public-safe sources

\- approved public claims/evidence

\- public relationships

\- published search documents



Never expose:

\- drafts

\- reviewer notes

\- assignments

\- private evidence

\- internal reports

\- audit data

\- unpublished claims

\- editorial metadata



\## GitHub / Cloudflare

Never put GitHub private tokens in browser code.



Preferred flow:



Markdown

→ validation

→ editorial approval

→ controlled Git change

→ validation

→ build

→ Cloudflare deployment



Do not invent insecure automation.



\## Performance

Preserve Phase 12 lazy-loaded editorial routes.



Do not eagerly import editorial code into the public bundle.



Avoid unnecessary dependencies and bundle growth.



\## Testing

During development:

\- run targeted tests only

\- do not repeatedly run the entire test suite



At phase completion, run the existing full validation/build suite.



\## Agent behavior

For every task:

1\. Inspect first.

2\. Identify what already exists.

3\. Change only what is necessary.

4\. Keep the scope narrow.

5\. Run targeted tests.

6\. Report changed files and results.

7\. If blocked, report the blocker instead of inventing a solution.



Never silently rewrite architecture.



\## Current Phase

Phase 14 is focused on persistent editorial infrastructure using:



Supabase Auth + PostgreSQL + RLS

\+

GitHub

\+

Markdown canonical source

\+

Cloudflare public deployment



Complete one logical Phase 14 task at a time.

