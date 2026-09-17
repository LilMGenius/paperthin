---
name: re0-order
disable-model-invocation: true
description: "Move items only, reword nothing; realign a listing whose order has gone arbitrary (a list, table, catalog, sections, an enum) into a logical sequence under one stated principle. Nothing is added or removed. Use when the order no longer helps a reader follow the set."
---

Put a listing back into an order that carries meaning, moving items only.

## Goal

A listing conveys meaning when related items sit together and follow one clear axis. Appending items where they were written can obscure that order. `re0-order` quickly realigns the set under one nameable principle, moving items and changing nothing else.

## Workflow

1. Pin the listing and its items: the ordered set in focus.
2. Name the principle that makes the order most meaningful: workflow or lifecycle sequence, dependency, grouping by kind, severity, frequency, or alphabetical. If a latent order exists, surface and complete it rather than imposing a new one.
3. Cluster kin adjacent, then sequence the clusters by that one principle.
4. Move items into the new order in place. Reword nothing; add and remove nothing.
5. Apply the identical order wherever the set is mirrored, including translated copies and second surfaces.

## Rules

- Reorder only. Never reword, add, remove, split, or merge an item; those are other reflexes.
- Use one principle a reader can name. Do not blend incompatible sorts into one listing.
- Respect a deliberate order. If the current sequence already encodes a real principle, complete and tidy it rather than replacing it; surface the call when it is unclear.
- Give mirrored copies of the same set the same order.
- Mutate with edit-safety: assert each item exists before moving it (report a MISS, never a silent drop), edit unicode-safe, and script a large structural move rather than sweeping by hand.

## Verification

1. A reader can name the ordering principle from the result alone.
2. Every original item remains; only positions changed. Nothing was reworded, added, or removed.
3. Kin are adjacent and the sequence follows the one principle end to end.
4. Every mirrored copy of the set carries the identical order.
