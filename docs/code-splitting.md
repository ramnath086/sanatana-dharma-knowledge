# Code Splitting

`App.tsx` lazy-loads `EditorialRoutes` with `React.lazy` and an accessible Suspense fallback. Vite creates a separate editorial chunk, so public navigation does not download editorial route code initially.

This does not secure editorial routes. Hidden navigation, lazy loading and noindex are not authorization. Until a future protected server boundary exists, editorial routes remain appropriate only for the current static/development architecture.
