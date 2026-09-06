# Editorial Authentication

`src/utils/editorialAuth.ts` defines the `EditorialAuthProvider` abstraction with current-user, authentication, role, sign-in and sign-out capabilities.

The included adapter is explicitly:

`DEVELOPMENT ONLY - NOT PRODUCTION SECURITY`

It provides a local editor identity for testing UI flows. It does not protect a deployed site. Do not add credentials to frontend JavaScript, Markdown, localStorage or source control. Production editorial access requires a server-backed identity provider, authorization checks and protected persistence, while the public site can remain static.
