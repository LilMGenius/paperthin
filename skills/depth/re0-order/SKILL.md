---
name: re0-order
description: "Move items only, reword nothing; realign a listing whose order has gone arbitrary (a list, table, catalog, sections, an enum) into a logical sequence under one stated principle. Nothing is added or removed. Use when the user names a listing, or a scope holding one, whose order no longer helps a reader follow the set, or when a pipeline the user invoked passes that scope on. Acts only inside that scope."
---

Move the items of a named listing into one order a reader can name, changing nothing but their positions.

## Goal

A listing carries meaning when related items sit together along one clear axis; items appended where they happened to be written blur that. `re0-order` realigns the set under one principle a reader can name, moving items and changing nothing else. It acts on a list, table, catalog, set of sections, or enum the human named, or one inside a scope they named or a pipeline they invoked passes on. The result lands in place: in the listing itself and in every copy that mirrors it.

## Workflow

1. Pin the listing and its items: the ordered set in focus, inside the scope the human gave.
2. Name the one principle that makes the order most meaningful, from workflow or lifecycle sequence, dependency, grouping by kind, severity, frequency, alphabetical. If a latent order already exists, surface it and complete it instead of imposing a new one. When it is unclear whether the current order is deliberate, surface that call to the human and let them decide; move nothing until they do.
3. Put kin next to each other, then sequence those clusters by that one principle.
4. Move items into the new order in place. Reword nothing; add nothing; remove nothing.
5. Apply the identical order everywhere the set is mirrored, translated copies and second surfaces included. To find the mirrors, search the repository for two or three of the set's items, by identifier where items have one and otherwise by a distinctive phrase, and for files that call themselves copies of this one, such as translations. Every hit holding the same set is a mirror and part of the listing the human named.

## Rules

- Reorder only: never reword, add, remove, split, or merge an item. Those are other reflexes.
- Use one principle a reader can name; never blend incompatible sorts in one listing.
- Respect a deliberate order: when the current sequence already encodes a real principle, complete and tidy it rather than replacing it, and surface the call when unclear.
- Act only inside the scope a human named or that a pipeline they invoked passes on. Never choose a listing yourself; its order is the human's call, and a reorder reflex choosing its own target churns what nobody asked to move.
- Mirrored copies of one set get the same order.
- Edit safely: assert each item exists before moving it and report a MISS rather than dropping it silently; edit unicode-safe; script a large structural move instead of sweeping by hand.

## Verification

Before finishing, confirm:

1. A reader can name the ordering principle from the result alone.
2. Every original item remains; only positions changed; nothing was reworded, added, or removed.
3. Kin are adjacent and the sequence follows the one principle end to end.
4. Every mirrored copy carries the identical order.
