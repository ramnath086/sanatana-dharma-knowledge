# Editorial Workbench

The internal workbench is available at `/editorial/review`, `/editorial/sources`, `/editorial/content/:type/:id` and `/editorial/preview/:type/:id`. These routes are not in public navigation and are not publication APIs.

The current adapter is development-only and session-based. Actions demonstrate controlled transitions and explain publication blockers, but they do not persist changes. A production deployment needs a server-backed authenticated provider and append-only persistence before editors can modify content.

The workbench separates public generated data from editorial entity data. Public search, sitemap and entity routes receive only publishable records.
