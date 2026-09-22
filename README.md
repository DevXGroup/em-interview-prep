# Loop Ready

A free, open-source study tool for Engineering Manager and SDM interview loops at Meta, Amazon, Apple, Netflix, Google and Microsoft. Six topic tracks, an eight-week roadmap, six per-company guides, quizzes, and three "around the loop" pages (mock loop day, negotiation, debrief). Progress lives in the reader's browser. No account, no server.

Live: https://interviewprep.devxgroup.io

## What is inside

| Track / page | Route | Contains |
|---|---|---|
| Behavioral | `/behavioral` | 16 STAR questions (weak/borderline/strong answer tiers), Amazon's 16 Leadership Principles with example hooks |
| System Design | `/system-design` | 11 manager-level scenarios, each with a request-flow diagram and a scoring rubric |
| Coding | `/coding` | 10 DSA patterns, 9 core data structures, a Big-O reference chart, an algorithm visualizer, plus 3 JS, 4 TS and 5 React concept cards |
| Coding challenges | `/coding/challenges` | 16 challenges |
| Coding SDM guide | `/coding/sdm-guide` | Manager-track guidance for the coding round |
| Technical Leadership | `/technical-leadership` | 21 items: tech debt, ADRs, make vs buy, on-call, incident stepper |
| Team Management | `/team-management` | 20 items: hiring rubrics, performance conversations, 1:1s, career ladders |
| AI Interview | `/ai-interview` | 17 answered questions (agents, evaluation, cost and latency, team policy) and 19 key concepts, current to 2026 models |
| Companies | `/companies/[company]` | 6 company profiles (Amazon, Meta, Google, Apple, Netflix, Microsoft): loop timeline, compensation medians, top questions |
| Roadmap | `/roadmap` | 8-week plan, 43 daily tasks, ticked independently of topic coverage |
| Negotiation | `/negotiation` | Offer calculator and negotiation guide |
| Mock Loop | `/mock-loop` | A timed mock interview day with a score sheet |
| Debrief | `/debrief` | A structured post-interview debrief workbench |
| Quizzes | (embedded per track) | 14 behavioral, 12 system design, 12 coding, 11 team management, 11 technical leadership, 12 AI interview questions |

Counts above come from reading the id and question arrays in `src/data/` directly, not from comments or prior documentation.

## How progress works

Every readable item (a question, a pattern, a challenge, a leadership topic) carries an id, listed in `src/data/tracks.ts` as that track's `itemIds`. A `CoveredToggle` button (`src/components/CoveredToggle.tsx`) sits at the end of the item and calls `toggleCovered(track, itemId)` on the Zustand store in `src/store/progressStore.ts`.

The store persists one key, `interview-prep-progress`, to `localStorage` (via `zustand/middleware`'s `persist`) and holds two things: `covered` (item ids marked per track) and `quizResults` (pass/fail per quiz). `useCoveredCount` filters a track's covered ids against that track's current `itemIds`, so a renamed or removed item can never inflate a count (docs/DECISIONS.md D-001). `ProgressTracker` (the home page coverage panel) reads this store directly and renders a bar per track plus an overall percentage; nothing is computed on a server.

Roadmap task ticks on `/roadmap` are deliberately not part of this store. They read and write a separate `localStorage` key, `roadmap-progress` (docs/DECISIONS.md D-004), so finishing a study-plan chore never counts as covering a topic. Both keys stay entirely in the browser: no network call writes progress anywhere, and clearing site data resets both.

## Design system

The app runs on "Evening Desk," a token set defined in `tailwind.config.ts`: `ink` (a near-neutral OKLCH ramp for surfaces and text, light and dark), `clay` (the single accent, used only for primary actions and current state), `teal` (charts and informational chips), and `moss`/`amber`/`rust` for success, caution and error/hard semantics respectively. `src/app/globals.css` layers a small component vocabulary on top so every page reads as one system rather than a pile of ad hoc classes: `.surface-card` for the one card style, `.page-shell` for the shared content width, `.btn-primary`/`.btn-secondary` for actions, `.chip` for tags, and `.prose-column` for long-form reading. The sticky nav keeps the app's only backdrop blur, on a 95% opaque surface (docs/DECISIONS.md D-003); nothing else in the app blurs.

Motion is Framer Motion throughout: state changes (a toggle marked covered, a coverage bar filling) animate; page load does not choreograph anything, in keeping with PRODUCT.md's "motion reports state changes" principle. `globals.css` includes a `prefers-reduced-motion: reduce` block that collapses all animation and transition durations to near zero and turns off smooth scrolling, and components that animate on mount (`CoveredToggle`, `ProgressTracker`, `LoopTimeline`) read `useReducedMotion()` from Framer Motion and skip their initial transform when it is set.

## How to add content

Each track's questions, scenarios or items live in their own module under `src/data/tracks/` (for example `behavioral.ts`, `system-design.ts`, `team.ts`). Adding an item there and giving it an `id` is enough: `src/data/tracks.ts` re-exports each module's `*ItemIds` array as that track's `itemIds`, which both the coverage chart's totals and the `CoveredToggle` wiring read automatically, and `src/data/searchIndex.ts` builds the search index from the same data modules, so a new item is searchable without a second edit.

Copy follows PRODUCT.md's voice: composed, specific, no hype, no em-dashes, written like someone who has sat on the other side of the table rather than a course landing page.

Amazon content is limited to what Amazon publishes itself: amazon.jobs, aboutamazon.com, and the public Leadership Principles page. Internal performance, calibration, rating, quota, promotion or offer-approval mechanics are never described, even when third-party sites report them, because the owner is bound by confidentiality toward Amazon (docs/DECISIONS.md D-008). Every Amazon-specific claim in `src/data/companies.ts`, `src/data/tracks/team.ts`, `src/data/compensation.ts` and `src/data/negotiation.ts` either carries a comment pointing at an amazon.jobs source or stays generic.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14.2 (App Router) |
| UI | React 18 |
| Styling | Tailwind CSS 3.4 |
| Motion | Framer Motion 11 |
| Icons | lucide-react |
| State | Zustand 4.5 (with `persist` middleware) |
| Dialogs | @radix-ui/react-dialog |
| Utilities | clsx |
| Analytics | @vercel/analytics |
| Language | TypeScript 5.3 |

The Next.js major version is pinned at 14.2 deliberately for now; upgrading to 15 is the top open item in BACKLOG.md, tracked separately so it gets its own verification pass.

## Getting started

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run start   # serve the production build
npm run lint
```

## Project structure

```
src/
  app/                        # Next.js App Router routes
    page.tsx                  # home: ranked tracks + coverage panel
    behavioral/
    system-design/
    coding/
      challenges/
      sdm-guide/
    technical-leadership/
    team-management/
    ai-interview/
    companies/[company]/
    roadmap/
    negotiation/
    mock-loop/
    debrief/
    globals.css
    layout.tsx
    sitemap.ts
    robots.ts
    opengraph-image.tsx
    apple-icon.tsx
    icon.svg
  components/
    brand/Mark.tsx             # the brand mark, an SVG coverage-bar icon
    companies/LoopTimeline.tsx # proportional interview-day timeline
    system-design/ArchitectureFlow.tsx  # request-flow diagram component
    CoveredToggle.tsx
    ProgressTracker.tsx
    TrackRow.tsx
    Navigation.tsx
    SearchModal.tsx
    Quiz.tsx / QuizLauncher.tsx
    Footer.tsx
  data/
    tracks.ts                 # track registry, itemIds aggregation
    tracks/                   # one module per track's content
    quizzes/                  # one quiz module per track
    companies.ts
    compensation.ts
    roadmap.ts
    negotiation.ts
    mockLoop.ts
    debrief.ts
    diagrams.ts
    searchIndex.ts
  store/
    progressStore.ts           # the one localStorage-backed Zustand store
  lib/
    site.ts                   # SITE_URL / SITE_NAME / SITE_TAGLINE, single source
    searchNavigation.ts
```

## Deployment

Deployed on Vercel. `vercel.json` sets the build/dev/install commands and a fixed response header set on every route (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy: strict-origin-when-cross-origin`). `src/lib/site.ts` holds the single `SITE_URL` constant that `src/app/sitemap.ts` and `src/app/robots.ts` both read, so the sitemap, the robots rules and any metadata that needs the site origin stay in sync from one place.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-module`)
3. Make your changes following the existing patterns
4. Run `npm run lint` to check for issues
5. Submit a pull request

## License

MIT License - feel free to use this for your interview preparation!
