# Decisions

One entry per deliberate design that an auditor would read as a bug. Each says why, what it looks like in code, and what enforces it. Challenge an entry by naming its id; do not "fix" it.

| id | Decision | Why | In code | Enforced by |
|---|---|---|---|---|
| D-001 | Coverage counts only ids that still exist in the track data. A stale id in localStorage is ignored, never counted. | Items get renamed or removed; a count above the total would read as a bug and a stale id would never clear. | `useCoveredCount` and `ProgressTracker` filter `covered[track]` against `track.itemIds`. | Store version 2 migration in `src/store/progressStore.ts`; totals derive from `src/data/tracks.ts`. |
| D-002 | Compensation shows one median per level, not a range. | levels.fyi publishes medians; a spread around them would be an invented number. | `src/data/compensation.ts` strings read "median $X"; unverified rows carry `verified: false` and an "estimate" chip. | `checkedOn` date rendered on every company page. |
| D-003 | The sticky nav keeps a 2px backdrop blur on a 95% opaque surface. | Content scrolling under a fixed bar needs a hint of separation; this is the only blur in the app and it is not decoration. | `src/components/Navigation.tsx` root `<nav>`. | Restyle brief bans blur elsewhere; grep for `backdrop-blur` should return this one line. |
| D-004 | Roadmap task ticks live in their own localStorage key, not the coverage store. | Ticking a task is not the same as covering a topic; folding them in would inflate coverage with "recorded yourself" chores. | `src/app/roadmap/page.tsx` reads and writes `roadmap-progress`. | Home page coverage reads only `covered`. |
| D-005 | The Apple logo is dark ink and inverted in dark mode; the other five keep brand colour. | Apple's mark is monochrome by brand rule; a fixed grey vanished on the dark surface. | `dark:invert` applied only when `slug === 'apple'` on the home page and company page. | Nothing automated; the logo audit in `.tmp` caught it once. |
| D-006 | Coding visualizer starts from a fixed array, not a random one. | A random initial array produced a server/client hydration mismatch on every load. | `BASE_ARRAY` constant in `src/app/coding/page.tsx`. | Console must show no hydration error on `/coding`; the Playwright check in the release notes covers it. |
| D-007 | The OpenGraph image fetches Source Serif from Google Fonts at render time and falls back to sans if that fails. | No serif font file is checked in; the fallback keeps social cards rendering when the font host is unreachable. | `loadFont` in `src/app/opengraph-image.tsx`. | Route returns 200 either way. |
| D-008 | Amazon content is limited to what Amazon publishes itself (amazon.jobs, aboutamazon.com, the Leadership Principles page). Internal performance, calibration, rating, quota, promotion and offer-approval mechanics are never described, even when third-party sites report them. | The owner is bound by confidentiality toward Amazon; the site must not read as disclosing internal process. | Amazon claims in `src/data/companies.ts`, `src/data/tracks/team.ts`, `src/data/compensation.ts`, `src/data/negotiation.ts` carry an amazon.jobs URL in a comment or are generic. | Manual sweep on every content change: grep for amazon, forte, OLR, bar raiser, HV, tier, overall value. |
| D-009 | Renamed to Loop Ready, hero broadened to software engineering interview class; content still EM-heavy, Concepts deep-dive track is next (BACKLOG). | "EM Mastery" undersold the site to working engineers; the content already covers coding and system design at a level useful beyond EM roles. | `src/lib/site.ts` SITE_NAME/SITE_TAGLINE, hero in `src/app/page.tsx`, wordmark in `src/components/Navigation.tsx`. | None automated; grep for "EM Mastery"/"EM Interview" should return nothing user-facing. |

## Changelog

| Date | Change |
|---|---|
| 2026-09-12 | File created with D-001 to D-008 during the design and content pass. |
| 2026-09-22 | D-009: renamed to Loop Ready. |
