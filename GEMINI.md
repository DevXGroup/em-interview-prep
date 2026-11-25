<!-- BEGIN POWERKIT: SUBSCRIPTION ROUTING -->
## Assistant subscription routing (Max, 2026-11-25)

Detail and verified state: `~/Desktop/CODE/powerkit/docs/TOOL-ROUTING-AND-SESSION-STATUS.md`. This block is the newest routing rule; older routing lines that disagree with it are superseded.

- **Each assistant runs on its own signed-in subscription CLI.** Claude Code: Max's Claude subscription. Codex: the ChatGPT subscription `codex` CLI. "Gemini" means the official Antigravity CLI `agy` on Max's Google subscription. `agy` is the normal, primary Gemini route: use it without asking each time. A stale T3 Antigravity adapter does not make Gemini unavailable; call `agy` directly.
- **Cross-audit.** Code Claude builds gets independent audits from both Codex and `agy`. Code Codex builds gets Claude's review; the reciprocal Claude and Codex review stays. The builder checks every finding against code and tests before applying it.
- **Research.** `agy` for research and routine lookups. Perplexity in Max's signed-in browser for substantive research, Deep Research when the question warrants it.
- **Gemini in the browser** is an alternative to `agy`: Max's signed-in Google Pro account, the Task tab, and the Neon model only if it actually appears there. Attach only the project folder context the task needs. Otherwise use `agy`. Do not assume a Neon alias in `agy`; pick a model that `agy models` lists.
- **Keep existing pins and failovers.** Do not change a review script's pinned model or any product's ordered provider failover. These rules govern assistant tools, not a product's cloud providers.
- **No paid fallbacks.** Never fall back to a pay-per-use API key, Vertex, ADC, a billing account or new credits. If auth, quota or a tool fails, report the exact gap. Another approved subscription route may be used, and is named in the report.
- **Gates stay.** Routine reviews, research and audits on these subscriptions need no new approval. Production deploys, production database changes, store submissions, publishing, payments and messages to people keep their approval gates. Production database changes still require a backup and verified isolated restore first.
<!-- END POWERKIT: SUBSCRIPTION ROUTING -->
