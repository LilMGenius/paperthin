---
name: nba
description: "Read the live cycle state and return the single highest-leverage next best action, not a menu. Use when a project is between phases, the author asks what to do next, too many valid threads are open, or the work needs re-entry into frame, build, drive, retro, hate, re0-work, or ship."
---

Find the next best action from state, not from vibes.

## Goal

`nba` is the manual re-entry point for a stalled cycle. It reads the current state and returns one action: the cheapest move that clears the binding constraint. It does not execute the action and it does not offer a menu, because a menu recreates the paralysis it exists to resolve.

## Workflow

1. Read the live cycle state: plan gates, retro anti-patterns, priority notes, recent git/file changes, QA evidence, and the current workflow phase.
2. Locate the project in the cycle: FRAME, BUILD, DRIVE, RETRO, HATE, RE0-WORK, BUILD AGAIN, or SHIP.
3. Diagnose the blank-out cause: too many open threads, lost thread, unnamed blocker, closed-loop fatigue, avoidance of the hard step, or a phase that is already done.
4. Return one action: the cheapest move that clears the most. It may name the right skill for the human to fire, the external input needed, the first nail to test, or the phase transition that is already due.
5. Frame it as: where you are, next best action, why now, and done when.

## Rules

- One action, not a checklist.
- State-grounded, never generic. Cite the gate, doc, evidence, or file state that drives the pick.
- Return the avoided move, not the easy busywork.
- If no outside truth is entering, the next action is external input, not another internal lap.
- If the gate is already met, the action is to move phase or ship, not add another surface.
- Read-only on the project. `nba` recommends; it does not execute.
- Do not auto-invoke user-only skills. Tell the human when one is the next move.

## Verification

Before finishing:

1. The recommendation cites the state it read.
2. There is exactly one next action.
3. The action has a clear "done when" observable.
4. A reader can tell why this action beats the other visible options.
