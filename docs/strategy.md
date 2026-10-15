# Homebody War Room — strategy

> Status: restructured 2026-10-15. Every surface has a Surface Area Coordinator (Sign: Zack Melton; Pay and Live: Joe Wilson; Fulfill: Chris Finken) and every track has an owner as of 2026-10-15; confirm them at the next huddle. Offering owners other than insurance (Josh Tebbs) and Rewards (Britton Pederson) are still "Owner to confirm".

## What this program is

A twice-weekly war room for Homebody, including Homebody Guaranty (HBG). It exists to drive Homebody revenue growth (target: +10% in Q1 2027, final number to be confirmed). Elevated client concerns going into and coming out of Summit were the trigger and are the signal of friction against that goal. The [Homebody Quarter Brief](https://github.com/Entrata-Collab/rxp) stays the strategic surface (bets, measurement, quarter narrative). This repo is the operating surface: the finite work that removes the friction.

## The model: Sign, Pay, Live, Fulfill

Homebody is a portfolio of **offerings** for residents, sponsored by the Customer (owner or PMC) and delivered by Fulfillers. The app is how residents reach the offerings, not the value itself. The full reference, with the diagram and the three delivery patterns, is [`docs/homebody-model.md`](./homebody-model.md). In short:

| # | Surface | Whose | What it is | Headline number |
|---|---|---|---|---|
| 1 | **Sign** | Entrata's | Lease checkout: sign, renew, transfer, move-in. Offers featured on the Customer's behalf, some **required** (insurance proof, deposit or HBG), some optional. Homebody is a guest in the leasing product's flow. | Insurance conversion at signing |
| 2 | **Pay** | Homebody's | Rent paid every month in the app; Resident Portal is being retired into it. Optional services featured with the Customer's permission. Twelve visits a year. | Residents logged in, 30d (225.5K → 3M MAU) |
| 3 | **Live** | Homebody's | Everything else in the app: policy documents, claims, policy status after move-out, Rewards, surveys, parking and clubhouse reservations, bulletin board, laundry links. The Customer buys or provides most of it. | Rewards revenue |
| 4 | **Fulfill** | Homebody teams and partners | Where offerings are delivered: the insurance agency, the Logan rent reporting team, embedded and integration partners, the Customer's vendors, plus billing integrity, IVS, documentation, rev share. When it fails the Customer is exposed. | Open billing incidents |

Offerings are what the Customer, in its role as Sponsor, puts in front of residents: resident-paid services (Insurance and Guaranty, Rent credit reporting, Partner offers), Sponsor-paid programs (Rewards, Resident Pulse), and Sponsor-provided links (community features, linked services). The Sponsor sponsors; the Resident enrolls (required lines are met with the default or an alternative); distribution (doors sponsored) comes before attach and enrollment. Each is delivered by a Fulfiller: a Homebody team, an embedded partner, an integration partner, Homebody R&D, or the Customer's vendor. Each track names its surface (`area`) and the offerings it moves (`offerings`). The Tracks tab groups by surface; the model tab shows the whole picture with track numbers in place.

Five of seven offerings have no track today and there is no fulfillment metric. That is visible on purpose. Either someone claims the work or the room decides it is out of scope.

## What a track is

A track is a **finite deliverable one person can finish**. It has:

- exactly one `owner` (a person rather than a function; write `Owner to confirm` until a person is named)
- an `area` (surface) and `offerings` from the model above
- a `due` date and a `measure` of done
- a `page` where the owner's work lives (optional at first, expected within two weeks)
- linked `clients` it will de-escalate
- dated `updates`, each with a source

"HBG" is an area. "HBG renewal requirements locked and renewals shipped" is a track. Complete tracks stay on the list; the list is the record of what the room shipped.

## What an owner page is

Each track owner builds the page where their work lives: `src/data/pages/<id>.json`. The page's owner is the track's owner, read from `tracks.json`, so there is one place to change it. It is theirs, and it shows up as its own tab in the top row, the way Leasing AI's analysis tabs do. Clicking a track card opens it. A first version that is one table is fine. The point is that updating it is the owner's job, not the scribe's. Sections available: `stats`, `table`, `checklist`, `text`, `roadmap` (by lane or Jira keys), `clients`, `links`.

## What the Clients board is

One row per client thread, one owner (the CSM who drives the outcome: de-escalation), one next step, a source, and the tracks that will de-escalate it. Hot clients are where friction against the revenue goal shows up; this board makes sure each one has exactly one name on it. Most rows read `Owner to confirm` for the CSM today because the slates never named one; Cal said CSMs get added when a client is hot. They are hot.

## Ownership rules

1. One person per track, per client thread, per decision, per action item.
2. If you do not know who, write `Owner to confirm`. It renders gold (`#8A6B00`, the marketing palette's "Offers & rewards" tone) everywhere so the gap is a visible to-do. Surface colors come from the same palette (homebody.com/pm): Sign emerald, Pay violet, Live terracotta, Fulfill brand gray; they are defined once in `src/components/surface.ts`.
3. Owners update their own tracks and pages in git. The huddle debates and decides; it does not read status aloud. Decisions the room owes sit in Open action items on the Tracks tab with a decider and a date; decided ones stay in `decisions.json` for the record.
4. The hygiene agent (`docs/agents/hygiene-agent.md`) drafts a DM to owners of past-due, undated, or stale items twice a week. It sends only with approval.

## Cadence

- Twice weekly huddle, run against this surface.
- Continuous: update your track and page when the fact changes, not at the meeting.
- Working rule: if it is not in Mission Control, it did not happen.

## How we know the restructure worked

Measured four weeks from 2026-10-15:

- Distinct committers in the trailing 14 days against a roster of 21. Baseline: 0. Target: 8 or more.
- Tracks with a named person as owner. Baseline: 5 of 8. Target: 8 of 8.
- Headline numbers with a value (3 program metrics plus 4 surface metrics). Baseline: 2 of 7. Target: 7 of 7. (The tiles are hidden on Tracks during the rollout while the room settles on which numbers drive the right behavior; the data and the owners still live in `areas.json`.)
- Median days since last update per track. Baseline: 14. Target: under 4.

## Roster

Standing names are in `src/data/team.json` and shown on the How to update tab.

## Sibling surface

[Entrata-Collab/rxp](https://github.com/Entrata-Collab/rxp) is the Homebody Quarter Brief. It holds the quarter bets and the two program metrics (Active Resident Rate, Resident Revenue per Door). This repo holds the live operating tracks. Link out. Do not duplicate.
