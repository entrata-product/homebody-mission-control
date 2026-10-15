# Homebody War Room

This repo is the **Homebody War Room** for Homebody and Homebody Guaranty (HBG). HBG is a Homebody product, so it lives here. There is no separate HBG war room.

New to this operating model? Read the canonical playbook at [Entrata-Collab/operating-playbooks — `mission-control.md`](https://github.com/Entrata-Collab/operating-playbooks/blob/main/mission-control.md).

**Mission:** Increase Homebody revenue growth by 10% in Q1 2027 (final target to be confirmed). One surface for Homebody and HBG. Every track is a deliverable one person can finish; every hot client thread has one owner and a next step, because hot clients are where friction against the goal shows up.

**Model:** Homebody is a portfolio of offerings for residents: the Customer sponsors them, the Resident enrolls in them (required lines can be met with an alternative rather than skipped), and Homebody teams, partners, or the Customer's own vendors fulfill them. Residents reach them through Sign (Entrata's lease flow), Pay (Homebody's rent experience), and Live (everything else in the app). Fulfill is where the service is delivered. Tracks are grouped by surface. Canonical reference, diagram, and the three delivery patterns: `docs/homebody-model.md`.

**Cadence:** Twice weekly. Elevated client concerns going into and coming out of Summit were the trigger; the goal is revenue growth.

**Strategy sibling:** The [Homebody Quarter Brief](https://github.com/Entrata-Collab/rxp) stays the strategic surface (bets, measurement, quarter narrative). This repo is the operating surface for customer heat and cross-team delivery. Do not copy the quarter bets into tracks here.

**Live surface:** https://entrata-labs.dev-eg.entrata.io/homebody-mission-control/ (VPN). It is also on the [Entrata Labs hub](https://entrata-labs.dev-eg.entrata.io/).

**Source repo:** https://github.com/Entrata-Collab/homebody-mission-control

---

## Quick start

1. Get set up with [Entrata-Collab/collab-spec-kit](https://github.com/Entrata-Collab/collab-spec-kit).
2. Clone:

```bash
cd ~/Developer/Entrata-Collab
git clone git@github.com:Entrata-Collab/homebody-mission-control.git
cd homebody-mission-control
```

3. Run:

```bash
npm install
npm run dev
```

Opens at http://localhost:5173/homebody-mission-control/

### Daily update

```bash
git pull
# edit src/data/tracks.json (your track) and src/data/pages/<your-page>.json (your page)
git add -A
git commit -m "track 2: new lock date Oct 27, block list confirmed with insurance ops"
git push
```

This repo is the working copy. Labs publishes from [entrata-product/homebody-mission-control](https://github.com/entrata-product/homebody-mission-control). After you push here, push the same `main` to that remote so the live page updates.

---

## Where to edit

| What | File |
| --- | --- |
| Tracks: deliverable, owner, due, measure, page, linked clients, updates | `src/data/tracks.json` |
| Surfaces (Sign, Pay, Live, Fulfill), offerings, insurance lines, economics, Fulfillers, delivery patterns, owners, headline metrics | `src/data/areas.json` |
| Client threads: page owner (Alyssa Schroeder), CSM owner per row, next step, source, linked tracks | `src/data/clients.json` |
| Owner pages: one JSON file per page, auto-discovered | `src/data/pages/<id>.json` |
| Decisions the room owes (shown under Open action items on Tracks) and decided ones for the record | `src/data/decisions.json` |
| Action items | `src/data/actions.json` |
| Roadmap items (rendered inside owner pages by lane or key) | `src/data/roadmap.json` |
| Roster | `src/data/team.json` |
| Why this program exists, ownership rules | `docs/strategy.md` |
| The Homebody model: Sign, Pay, Live, Fulfill, with diagram and delivery patterns | `docs/homebody-model.md` |
| Hygiene agent rules | `docs/agents/hygiene-agent.md` |

Tracks are the source of truth. Do not paste the track list into this README.

### Tabs

One flat row, like the Leasing AI war room. Owner pages are peer tabs, not a second row.

| Tab | What it shows |
| --- | --- |
| **Tracks** (default) | Every track grouped by surface (headline-number tiles are hidden for the rollout; `SHOW_KEY_NUMBERS` in `Tracks.tsx` brings them back). Each card: deliverable, owner, status, due, next step, linked clients. Click a card to open the owner's tab. Open action items at the bottom, including decisions the room owes. |
| **Clients** | One row per client thread: one owner (the CSM), next step, source, linked tracks |
| **App Migration · HBG Renewals · Billing Integrity · Insurance Funnel · Rewards · IVS Remediation** | One tab per owner page, built from `src/data/pages/<id>.json`. Add a file, get a tab. |
| **The model** | Sign, Pay, Live, Fulfill with track numbers in place; the offerings table with types, Fulfillers, and contracts; why Homebody is not like the rest of Entrata; what the model exposes |
| **How to update** | Claim a track, build your page, add a client thread, what the hygiene agent does, roster |

---

## For agents

Read `docs/strategy.md` and the playbook before changing language. When you update a track, add an `updates` entry with a date, a source, and `by`. A track's `owner` is one person rather than a function. If you do not know who, write `Owner to confirm`. Do not write resident names or resident IDs into this repo. Do not invent client status, measures, or dates. If the source does not say it, leave it out and mark the next step as unconfirmed. Types for every data file are in `src/types.ts`. A page has no owner field: its owner is the owner of the track it belongs to (`track` in the page JSON), so change ownership in `tracks.json` only. Put new tracks under a surface from `docs/homebody-model.md` and list the offerings they move.

---

## Need help

1. New to the model: [Collab Spec Kit](https://github.com/Entrata-Collab/collab-spec-kit)
2. Git questions: open Cursor and type `/git-coach`
3. Stuck: ask in the war room huddle, or DM Zack Melton
