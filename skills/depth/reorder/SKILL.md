---
name: reorder
disable-model-invocation: true
description: "Realign a listing whose order has gone arbitrary — a list, table, catalog, sections, an enum — into a logical sequence under one stated principle. Move items only: nothing is reworded, added, or removed. Use when the order no longer helps a reader follow the set."
---

Put a listing back into an order that carries meaning, moving items only.

## Goal

A listing's order is information: kin sit together, and the sequence follows one axis a reader can feel. Order drifts — items get appended where they were written, not where they belong — until the sequence tells the reader nothing. `reorder` realigns the set under a single, nameable principle so the order reads as intentional again. It is fast and single-purpose: it moves items, and changes nothing else.

## Workflow

1. Pin the listing and its items — the ordered set in focus.
2. Name the principle that makes the order carry the most meaning: workflow or lifecycle sequence, dependency, grouping by kind, severity, frequency, or plain alphabetical. If the set already has a latent order, surface and finish it rather than imposing a new one.
3. Cluster kin adjacent, then sequence the clusters by that one principle.
4. Move items into the new order in place. Reword nothing; add and remove nothing.
5. If the same set is mirrored elsewhere — a translated copy, a second surface — apply the identical order to each.

## Rules

- Reorder only. Never reword, add, remove, split, or merge an item; those are other reflexes.
- One principle, and a reader can name it. Do not blend incompatible sorts into one listing.
- Respect a deliberate order. If the current sequence already encodes a real principle, complete and tidy it rather than replacing it; surface the call when it is unclear.
- Keep mirrored copies in lockstep — the same set on different surfaces gets the same order.
- Mutate with edit-safety: assert each item exists before moving it (report a MISS, never a silent drop), edit unicode-safe, and script a large structural move rather than sweeping by hand.

## Verification

1. A reader can name the ordering principle from the result alone.
2. Every item that was there is still there — only positions changed; nothing reworded, added, or removed.
3. Kin are adjacent and the sequence follows the one principle end to end.
4. Every mirrored copy of the set carries the identical order.
