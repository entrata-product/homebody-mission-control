# Homebody War Room

This repo is the **Homebody War Room** for Homebody and Homebody Guaranty (HBG). HBG is a Homebody product, so it lives here. There is no separate HBG war room.

New to this operating model? Read the canonical playbook at [Entrata-Collab/operating-playbooks — `mission-control.md`](https://github.com/Entrata-Collab/operating-playbooks/blob/main/mission-control.md).

**Mission:** One surface for Homebody and HBG. Every hot client thread has an owner and a next step.

**Cadence:** Twice weekly. We are setting this up because of elevated client concerns going into and coming out of Summit.

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
# edit src/data/tracks.json
git add -A
git commit -m "update hbg renewals: eligibility list confirmed"
git push
```

This repo is the working copy. Labs publishes from [entrata-product/homebody-mission-control](https://github.com/entrata-product/homebody-mission-control). After you push here, push the same `main` to that remote so the live page updates.

---

## Where to edit

| What | File |
| --- | --- |
| Tracks, heat, owners, next steps | `src/data/tracks.json` |
| Roster | `src/data/team.json` |
| Decisions | `src/data/decisions.json` |
| Why this program exists | `docs/strategy.md` |

Tracks are the source of truth. Do not paste the track list into this README.

---

## For agents

Read `docs/strategy.md` and the playbook before changing language. When you update a track, add an `updates` entry with a date and a source. Do not write resident names or resident IDs into this repo. Do not invent client status. If the source does not say it, leave it out and mark the next step as unconfirmed.

---

## Need help

1. New to the model: [Collab Spec Kit](https://github.com/Entrata-Collab/collab-spec-kit)
2. Git questions: open Cursor and type `/git-coach`
3. Stuck: ask in the war room huddle, or DM Zack Melton
