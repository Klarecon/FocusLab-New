# How I Stopped Reviewing Half-Finished Work From Claude Code

*Notes for people getting used to vibe coding with Claude Code*

A few days ago I changed the way I work with Claude — specifically around how it uses agents and how it tests things — so I'd stop being handed incomplete work and having to play QA myself. Here's the whole thing in plain language.

## The problem I was solving

Before, the loop looked like this: I'd ask for something, Claude would say "done," and then *I* became the QA department. I'd open the app, click around, find the thing it missed, send it back, repeat. I was reviewing incomplete work — and worse, I often couldn't tell *what* was incomplete until I'd already wasted time trusting a "done" that wasn't.

The fix has two parts that work together.

## Part 1: "Done" now has to survive three checkpoints, not one

I stopped letting Claude be the only judge of its own work. Now there are three layers, and it's not allowed to say "done" until all three pass:

1. **An automatic gate** — a script that runs before any commit and *hard-blocks* it if something's wrong (wrong colors, banned fonts, broken logic). It's not a suggestion; the commit literally won't go through. This catches the dumb, repeatable mistakes so neither of us has to think about them.

2. **A growing list of "I already paid for this" tests** — every time I give feedback and it gets fixed, that fix becomes a permanent test. So if it accidentally undoes the fix three sessions later, it screams. The test count only goes *up*, never down. This is the part that stops the "didn't we already fix this?" frustration.

3. **A separate QA agent with fresh eyes** — after Claude finishes, a *different* agent checks the work. The rule that makes this actually work: it's not allowed to say "PASS" without showing the evidence — the actual line of code, the actual search result. It can't just vibe-approve. And if it finds problems, the work gets fixed and a *brand new* QA agent is spawned, not the same one — because the same agent gets attached to its earlier judgment.

The key mindset shift: **the agent doing the work is never the agent approving the work.** That single rule is why I stopped getting handed half-finished things.

## Part 2: The E2E tests — splitting "the code is right" from "it looks right"

This is the part most people get wrong, and it's the most important.

There are two completely different questions:

- **"Does the code say the right thing?"** — e.g., is the button color set to pink in the file?
- **"Does it actually look right on the screen?"** — e.g., is the button overlapping another element, is text cut off, are there two counters showing by accident?

A simple code check can answer the first one. It *cannot* answer the second. The code can be 100% "correct" and the screen can still be broken.

So I split every piece of feedback into two buckets:

- **CODE items** — verifiable by reading the file. The agent must show the proof and can say PASS.
- **VISUAL items** — the agent is *forbidden* from saying PASS. The most it can say is "code change is verified, but a human needs to look at the live app."

That's where the **E2E (end-to-end) screenshot step** comes in. Instead of trusting that "the code looks fine so the page is fine," Claude now drives a real browser, takes actual screenshots of the actual pages, and then has to *open those images and look at them* before declaring anything visual done. A code search is not allowed to stand in for eyes.

The honest part: even this doesn't fully replace *my* eyes on the deployed site. What it does is shrink my job from "find everything that's broken" down to "glance at the 2-3 things flagged as needing a human." I went from full QA department to final sign-off.

## The one-sentence version

> I stopped treating "done" as something the AI gets to declare. I made it a thing that has to survive automated gates, a growing pile of regression tests, and a second AI that has to show its evidence — and I forced a hard line between "the code is correct" (a machine can prove it) and "it looks right" (only a screenshot, and ultimately a human, can prove it).
