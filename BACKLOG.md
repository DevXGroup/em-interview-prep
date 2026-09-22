---
project: em-interview-prep
name: Interview Prep
status: live
updated: 2026-09-12
health: active
todos:
  - id: concepts-deep-dive-track
    priority: P2
    title: "Concepts deep-dive track (caching, consistency/CAP, queues, indexing, concurrency, networking) framed as interview questions"
    why: "Rename to SWE Interview Prep broadened the pitch to software engineers; content is still EM-heavy and needs a track that covers core CS/systems concepts the way interviewers actually ask about them."
    owner: claude
  - id: next-15-upgrade
    priority: P1
    title: "Upgrade Next.js 14.2 to 15 and re-run the audit"
    why: "npm audit flags the whole 14.x line with a critical advisory (RSC deserialization DoS, request smuggling via rewrites). Vercel hosting and zero rewrites make exposure low, but the fix is a major bump that needs its own pass with the E2E sweep."
    owner: claude
  - id: roadmap-in-store
    priority: P3
    title: "Consider folding roadmap task ticks into the progress store"
    why: "Roadmap ticks live in their own localStorage key by design (DECISIONS D-004). Revisit only if readers ask for one reset button."
    owner: claude
completed:
  - id: reconcile-dirty-file
    done: 2026-09-12
    outcome: "No dirty file remained; tree was clean at the start of the design pass."
    docs: docs/DECISIONS.md
  - id: dependency-refresh
    done: 2026-09-12
    outcome: "Removed seven unused packages (d3, recharts, prismjs, react-syntax-highlighter, four Radix primitives). Next upgrade split out as next-15-upgrade."
    docs: docs/DECISIONS.md
  - id: design-content-pass
    done: 2026-09-12
    outcome: "Evening Desk applied to every route; coverage tracking wired; diagrams, timelines, compensation, tiers, AI refresh, new pages; Amazon content limited to public sources."
    docs: docs/DECISIONS.md
shipped_recently:
  - "2026-09-12 full design and content pass (see BRIEF.md)."
---

# Interview Prep backlog

Machine-readable state is the front matter above; the dashboard reads that.

## Where things stand

Live at `interviewprep.devxgroup.io`. The 2026-09-12 pass touched every route; BRIEF.md carries the summary and docs/DECISIONS.md the deliberate choices. The one open engineering item is the Next.js major upgrade, kept separate so it can be verified on its own.
