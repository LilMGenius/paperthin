<div align="center">

# Skills For Fake Engineers

**The agent skills I actually use, shared so you can too.**

</div>

> [!NOTE]
> Plain-Markdown skills that run on **any** agent — Claude Code, Codex, Cursor, and friends. Each turns a piece of old engineering wisdom into something your agent reaches for on its own.

## Quickstart (15 seconds)

1. **Install** for every agent you use:
   ```bash
   npx skills@latest add LilMGenius/skills --global --agent '*'
   ```
2. **Run it elevated** so the skills are symlinked (they auto-update), not copied.
3. **Use them** — model-invoked, so your agent reaches for them on its own; or call one by name, like `/re0`.

**Not sure?** Paste that command into whatever agent you're using and just say "set this up for me" — it'll do the rest.

## Why these skills exist

Each is a well-worn principle, made automatic.

### #1 — Artifacts rot
Edit a doc one piece at a time across a session and it bloats: stale deltas, duplicated noise, changelog scars. Patching on top just preserves the rot.

**The fix → `re0`:** rewrite the target as a clean v0, as if it were the first version.

> *Prior art: the Boy Scout Rule — "leave it cleaner than you found it" (Robert C. Martin, [Clean Code](https://www.informit.com/articles/article.aspx?p=1235624&seqNum=6), 2008). `re0` goes further: rewrite, don't just tidy.*

### #2 — The same fact ends up everywhere
A timeout value, a decision, a status — copied into a README, a doc, a ticket, and a Slack thread. The copies drift, and now no one knows which is true.

**The fix → `ssotchk` + `ssotize`:** find the scatter, name the canonical source, then consolidate and point the rest at it.

> *Prior art: [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) — one fact, one authoritative home (Hunt & Thomas, The Pragmatic Programmer, 1999).*

### #3 — You go blind to your own work
After a long session you're the one person who *can't* read your own work straight: you know too much, so your brain quietly fills every gap and the holes turn invisible.

**The fix → `shower`:** hand a stranger who never saw your session only the artifact, and ask "does this actually make sense?"

> *Prior art: [egoless programming](https://en.wikipedia.org/wiki/Egoless_programming) — you can't review your own work objectively; someone else must (Gerald Weinberg, 1971). Here, that someone is a context-free sub-session.*

<details>
<summary><b>Proof — the skill caught its own bugs</b></summary>

We aimed `shower` at its own spec. The stranger tore back three bugs in minutes:
- a step that **whispered the answer while pretending to hide it**,
- a **leak** that let the reviewer sneak a peek at spoiler files,
- a **job so vaguely described it just shrugged**.

All fixed before launch. A skill that catches its own bugs can catch yours.
</details>

### #4 — "Remember to verify" never fires
A guideline buried in docs won't trigger in a brand-new session — exactly when author bias is highest.

**The fix → `tasting`:** the moment you finish something, it runs `shower`, `ssotchk`, and `re0` on your output, automatically.

> *Prior art: [dogfooding](https://en.wikipedia.org/wiki/Eating_your_own_dog_food) — eat your own dog food (Microsoft, 1988). Taste your own cooking before you serve it.*

## Reference

All model-invoked — your agent reaches for them on its own; you can also call one by name.

| Skill | Scope | What it does |
|---|---|---|
| ♻️ **[re0](./skills/single/re0/SKILL.md)** | one artifact | Rewrite a drifted artifact into a clean v0 — not another patch |
| 🚿 **[shower](./skills/single/shower/SKILL.md)** | one artifact | Cold-read it with fresh, zero-context eyes — does it stand on its own? *(read-only)* |
| 🍴 **[tasting](./skills/single/tasting/SKILL.md)** | your output | After any change, auto-runs `shower` + `ssotchk` + `re0` on it |
| 🔎 **[ssotchk](./skills/cross/ssotchk/SKILL.md)** | many artifacts | Find where one fact is scattered or duplicated; name the canonical source *(read-only)* |
| 🧲 **[ssotize](./skills/cross/ssotize/SKILL.md)** | many artifacts | Consolidate it into one home and point the rest at it |

## Credits

Built on the architecture and philosophy of [mattpocock/skills](https://github.com/mattpocock/skills) (MIT) — these are [LilMGenius](https://github.com/LilMGenius)'s own, non-overlapping workflows, **not a fork**. A few shared building blocks are vendored verbatim; see [NOTICE](./NOTICE). Authoring conventions: [CLAUDE.md](./CLAUDE.md).
