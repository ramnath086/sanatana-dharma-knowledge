# Phase 12

Phase 12 keeps the portal static and Markdown-first while improving public performance and evidence depth.

## Performance

Editorial routes are now loaded through `React.lazy` from `src/pages/EditorialRoutes.tsx`. Public `App.tsx` imports only public generated entities, sources, relationships and search data. Vite emits a separate editorial chunk. Lazy loading is a performance optimization only; it is not authentication, authorization or access control.

## Evidence

The phase adds conservative claim/evidence records for Vedāṅga, Nyāya, Vedānta, Dhyāna and a draft regional Dīpāvalī variation record. These are limited contextual claims, not quotes, invented editions or claims of universal agreement.

## Future boundary

The editorial module remains reachable in the static build. Real protection requires future server-backed authentication and authorization. Canonical Markdown, public generation, taxonomy and search remain static.
