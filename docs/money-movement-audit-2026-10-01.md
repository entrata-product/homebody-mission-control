# Homebody Billing / Money-Movement Audit — Jira Scan

**Date:** 2026-10-01
**Author:** Cal Harris (agent-assisted scan)
**Window:** Tickets created in the last 180 days (~2026-04-04 → 2026-10-01)
**Source:** Jira project `DEV`, live API query (not Domo)

## Scope & Method

Components scanned (confirmed list from `context/memory.md`, 2026-10-01):
`HB-B2B`, `HB-B2C`, `HB-Deposit Alternative`, `HB-Resident Growth`, `HBS-App`, `HBS-Web`, `RXP-Capricorn`, `RXP-Capricorn-Mobile`. Obsolete HB-Mobile / HB-Platform / HB-Rent Reporting excluded.

JQL (summary-level match, Bug/Tech/Task/Vulnerability only):

```
project = DEV AND component in ("HB-B2B","HB-B2C","HB-Deposit Alternative","HB-Resident Growth","HBS-App","HBS-Web","RXP-Capricorn","RXP-Capricorn-Mobile")
AND created >= -180d AND issuetype in (Bug, Tech, Task, Vulnerability)
AND (summary ~ "billing" OR summary ~ "charge*" OR summary ~ "refund*" OR summary ~ "payment*" OR summary ~ "invoice*" OR summary ~ "ledger" OR summary ~ "autopay" OR summary ~ "ACH" OR summary ~ "chargeback*" OR summary ~ "datafix" OR summary ~ "data fix" OR summary ~ "fee" OR summary ~ "fees" OR summary ~ "credit*" OR summary ~ "premium*" OR summary ~ "prorate*" OR summary ~ "remittance" OR summary ~ "money" OR summary ~ "pricing" OR summary ~ "reversal")
```

**Result: 368 tickets.**

Scoping notes / caveats:
- A full-text version of this query (matching descriptions + comments) returns 4,687 issues — too noisy to audit. Summary-level matching is the auditable set; a ticket whose summary never mentions money terms would be missed.
- Feature Stories/Epics (e.g., Payment SDK build-out, TransferMate, amenity payments) were deliberately excluded; this scan targets defects, data fixes, and money-movement incidents. The same query with all issue types returns 877.

## Counts by component

| Component | Count |
|---|---|
| HB-Deposit Alternative | 124 |
| HB-B2B (insurance operator / Master Policy) | 85 |
| RXP-Capricorn-Mobile | 60 |
| HB-B2C (ResidentInsure / policyholder) | 56 |
| RXP-Capricorn (web) | 33 |
| HBS-Web + HBS-App + HB-Resident Growth | 10 |
| **Total** | **368** |

## Breakdown by work type — ISSUES ONLY (updated 2026-10-01)

The 368-ticket scan included non-issue work (verification passes, scoping/spike tickets, feature and platform-migration tasks, test-environment failures). Those are removed below. **Issue set: 285 tickets.**

Classification rules:
- **Data fix** = summary contains datafix / data fix / data-fix (any issue type). Verification-of-datafix and datafix-process tickets removed.
- **Issue-related Tech/Task** = describes an actual money incident, correction, reversal, or cleanup (e.g., "Reverse incorrect refunds issued to past residents", "Clean up duplicate charges", the Sev3 $495K invoice gap).
- **Removed (83 tickets):** 16 verification/QA tasks (incl. the Sept-25 convenience-fee verification set), 22 scoping/spike/review tickets, 35 feature/instrumentation/refactor/platform-migration tasks, 6 test/stage/dev-environment bugs (Blitz testing, stage perf test, dev-env payment-method errors), 4 datafix-verification/process tickets.

| Bucket | Count | Components |
|---|---|---|
| Bugs (production money issues) | 198 | DA 67 · B2B 52 · B2C 35 · Capricorn 22 · Mobile 18 · HBS-Web 4 |
| Data fixes (manual money corrections) | 49 | DA 25 · B2B 19 · B2C 5 |
| Issue-related Tech/Task (incidents, reversals, cleanups) | 32 | DA 18 · B2C 6 · B2B 5 · Capricorn 2 · Mobile 1 |
| Vulnerabilities (payment/money data exposure) | 6 | B2C 4 · HBS-Web 1 · Mobile 1 |
| **Total issues** | **285** | DA 110 · B2B 76 · B2C 50 · Capricorn 24 · Mobile 20 · HBS-Web 5 |

**Open data fixes (10)** — every one of these is pending manual money correction:

| Ticket | Status | Component | Summary |
|---|---|---|---|
| DEV-343022 | Not Started | HB-B2B | Data Fix - MPDP wrong 'Fee Based On' → wrong resident charges (Trinity) |
| DEV-340992 | New | HB-Deposit Alternative | DA: update policy coverage/term, refresh export pricing |
| DEV-338722 | New | HB-Deposit Alternative | HBG: complete interrupted PDM issued-policy writes after Leap success |
| DEV-336268 | New | HB-Deposit Alternative | HBG: reverse unreversed AR after cancel date-gate fix |
| DEV-328566 | In Refinement | HB-Deposit Alternative | DA: client premium adjustment when state default is 13% |
| DEV-319740 | In Refinement | HB-Deposit Alternative | DA/HBG: refund exports billed after claim closure (Leap lag) |
| DEV-316383 | New | HB-B2C | Array ID Theft policies — correct under-tiered carrier liability |
| DEV-308882 | Not Started | HB-Deposit Alternative | TDD: DA data fix for orphaned Rentsense scheduled charges |
| DEV-297182 | Dev - In Development | HB-B2B | Refund Gap Fee not refunding full amount |
| DEV-280926 | Not Started | HB-Deposit Alternative | Backfill missing policy fee fields from March audit |

## Red flags (act on these first)

| Ticket | Why it matters | Status |
|---|---|---|
| DEV-280586 | **Sev3: Deposit Alternative — $495K Leap Invoice Gap + DA policy record failures.** P1, created 2026-04-10. | **Not Started after ~6 months** |
| DEV-343156 / DEV-343158 / DEV-343161 / DEV-343162 | Sept-30 vulnerability cluster: payment/tokenization APIs (SecureConnect / TokenEx / Payments API) callable **without authenticated, client-scoped requests** across Resident Insure, Homebody Services, and Mobile Payments SDK. One is P1. | Pending Assignment |
| DEV-289237 / DEV-289240 / DEV-323238 / DEV-332634 | Earlier money-data exposure vulns: `getPaymentInfo` returning **full PAN + ACH routing** for arbitrary accountIds; cross-tenant saved payment methods; IDOR on insurance upcoming payment. | Closed/Done (verify remediation) |
| DEV-320158 | P1: Master Policy fees **incorrectly reversed for past residents** on July 23 — created credits on zero-balance accounts (money out the door). | Closed |
| DEV-331839 | P1: Master Policy Content-Only AR charges not posting — **~$4K unposted** on CID 10406. | Done |
| DEV-343022 / DEV-343021 | P1 pair (Sept 29): MPDP referencing wrong "Fee Based On" → **wrong resident charges for Trinity** (data fix + code fix). | Not Started |
| DEV-343411 | P1: Payment request attached to a **different lease**, causing payment failure. | Not Started |

## Theme clusters

### 1. HBG / Deposit Alternative charge lifecycle (the biggest cluster, ~124 tickets)
Recurring failure modes:
- **Duplicate / double charges:** DEV-335646 (double bill September), DEV-331223 (double billing on transfers), DEV-323420, DEV-320681, DEV-301314, DEV-296608, DEV-290040s-era, DEV-287711 (E2E migration duplicate charges), DEV-319893 (duplicate scheduled charges).
- **Charges not reversed on cancel / move-out / pre-move-in:** DEV-336247, DEV-338642 (charges after move-out), DEV-324268 (charged after move-out), DEV-286132 (charged after cancellation), DEV-283755 (former residents), DEV-280279, DEV-286241, DEV-320653.
- **Wrong amounts / pricing-vs-charge mismatch:** DEV-325356, DEV-338393 (pricing error), DEV-341542 (L2E incorrect charge amount), DEV-282844, DEV-284619, DEV-280856 (enrollment pricing differs from pricing table AND Leap invoice), DEV-285890.
- **Leap-to-Entrata (L2E) migration fallout:** DEV-287560, DEV-300609, DEV-323430, DEV-321714, DEV-338721/DEV-338722 (partial writes after Leap success).
- **Client-facing refund requests** (Cardinal Group repeatedly): DEV-338108, DEV-340308, DEV-342396, DEV-341562, DEV-308749, DEV-311397.

### 2. Master Policy / insurance operator billing (HB-B2B, ~85 tickets)
- Double / duplicate charges: DEV-328123 (July incremental), DEV-327507 (concurrent MPs), DEV-319344, DEV-342523, DEV-331802 (daily-renewal double charges), DEV-331878 (duplicate Sept MPC/FPP rows).
- Fees not reversed or reversed wrongly: DEV-328137, DEV-326314, DEV-298296, DEV-342519 (auto reversal), DEV-335619 (gap-period charges), DEV-320158 (mass incorrect reversal), DEV-297182 (gap fee refund shortfall).
- Charging residents who shouldn't be charged: DEV-332574 (verified insurance, charged non-compliance fee), DEV-322265 (MP fee despite active HB policy), DEV-303109 (charges while custom coverage active), DEV-337194 (Trinity script force-placing insured residents), DEV-338080 (force-placed with paid verification OFF).
- Under/over-charging: DEV-324554 (prorated premium copied to all months — carrier export AND client billing undercharged), DEV-340306 (prorate-by-day ignored), DEV-290843.
- Notable mitigation shipped: DEV-331799 (pre-execution **circuit breakers** on MP renewal/billing/export scripts) and DEV-329566 (unify resident fee calculation into a single formula).

### 3. Standing datafix machine (Tech tickets, both DA and MP)
A steady drumbeat of manual AR corrections — this is the clearest audit signal that automated billing is not trustworthy yet:
- DEV-303116 + DEV-323032 ("Datafix" and "Datafix II" — identify and reverse duplicate Apr/May/Jun charges from **recovery-script fallout**).
- DEV-319161 (13% state premium overcharges — client debit/credit applied incorrectly), DEV-328566, DEV-316828.
- DEV-282422 (refund premiums billed **after property termination**), DEV-319740 (refunds exported after claim closure — Leap claim-status lag), DEV-321393.
- DEV-293847 (reverse all charges created by the **May 6 datafix script** — a datafix needing its own datafix).
- DEV-283670 (revert AR transactions created by the Apr 17 datafix task).
- DEV-290644 ("Data fix changes to be considered for billing prior to execution" — process guardrail).

### 4. Resident payment rails (RXP Capricorn web + mobile, ~93 tickets)
- Money-routing errors: DEV-296720 (**Greystar: rent routed to wrong property** for multi-property residents), DEV-343411 (payment tied to wrong lease).
- Duplicate-payment vectors: DEV-333522 (double-click double payment on web), DEV-333983 (Apple Pay duplicate warning lacks actionable checkbox).
- Autopay correctness: DEV-302570 ("last day of month" uses day 31), DEV-305638 (autopay dates in the past), DEV-303747 / DEV-303567 (delete auto-payment race conditions), DEV-331351 (autopayment error).
- Fee correctness on mobile: DEV-331595 / DEV-334381 (state tax fee missing in enroll-policy API, iOS + Android), the Sept convenience-fee verification backlog (DEV-341113–341121 — all Not Started).
- Refund account management bugs: DEV-308834, DEV-294586 (Greystar show/hide logic), DEV-303074.

### 5. ResidentInsure / B2C premium & payment integrity (~56 tickets)
- Premium mismatches at scale: DEV-326782 (MSI stored premium ≠ bind API premium, **~2,351 of 90,204 enrollments**), DEV-326772 (~160 tax-state policies missing down payment/tax), DEV-298725 (policyholder charged more than monthly premium, duplicate payment attempts).
- Policy/payment state desync: DEV-297584 (policies stay "Enrolled" after successful payment), DEV-303363 (policy lapsed despite payment made), DEV-328796 (failed payment creates orphaned policy blocking retry).
- Rogue ledger artifacts: DEV-334432 (Markel HO4 paid-through mismatch, rogue $40.64 charge, $-15.95 ledger credit).

## Action items

- [ ] **HB Billing issues working session** — JT (CTO), Manish Ranjan, Levi Howa, Zack Melton, Jae Lee, Cal Harris, Dan Bullock. Agenda: the open incidents (INC 1497, 1551, 1557), DEV-342481, and the root-cause question in next step #3 below. **Levi owns scheduling.** (Added 2026-10-01.)

## Trend analysis (added 2026-10-02)

Failure-mode distribution across the 285-issue set, with monthly trend (Apr → Sep):

| Failure mode | Total | Open | Trend |
|---|---|---|---|
| Wrong amounts / pricing-charge mismatch | 37 | 9 | 2→5→7→8→4→**10** (rising; Sept worst) |
| Charged when shouldn't / reversal failures | 27 | 6 | steady 5–7/mo |
| Duplicate/double charges | 26 | 6 | peaked Aug (8), Sept 6 |
| Refund problems/requests | 15 | 5 | steady |
| Migration fallout (Leap/L2E/E2E) | 15 | 7 | every month; 15/15 in Deposit Alternative |
| Charges/policies missing or stuck | 12 | 1 | episodic |
| Payment data/auth vulnerabilities | 6 | 3 | 3 of 6 in Sept |
| Autopay/recurring defects | 6 | 0 | resolved cluster (June) |

Issue creation by month: Apr 30 · May 40 · Jun 65 · Jul 40 · Aug 56 · Sep 52 — flat-to-worsening; no failure mode is declining. **54 issues open total; 35 of them created in Sept alone** (triage gap, not capacity gap). 12 P1s open, oldest Apr 10 ($495K invoice gap).

## Systemic assessment (added 2026-10-02)

Five systemic failures explain the distribution; they compound:

1. **Charges are side-effects, not a managed state machine.** Charge create/reverse logic is distributed across event handlers (enroll, cancel, move-out, transfer, renewal, screening, recalc) — every lifecycle transition has its own bug in the data. The DEV-340618–627 story set (standardized charge codes, unified recurring billing, no direct AR posting) is the rewrite of this model and is the real fix.
2. **Four sources of truth for one price** (policy table, scheduled charges, resident ledger, Leap/carrier exports) reconciled only forensically, after complaints. Wrong-amounts is the one rising failure mode. The $495K gap is the same disease at enterprise scale.
3. **No transactional discipline on the Entrata↔Leap boundary.** Partial writes after Leap success, policies bound at Leap with no Entrata record, claim-status lag billing. No idempotency, no completion verification → migration fallout every month for six months.
4. **The correction mechanism causes incidents.** Datafixes needing datafixes (DEV-293847, DEV-283670, DEV-323032 "Datafix II"); money scripts run with no dry-run or blast-radius control; MP got circuit breakers Aug 28, DA/HBG has none. Locked charge codes force all corrections through engineering (~2 datafixes/week), consuming the capacity needed for the engine fix — a doom loop. Slack support volume grew 6x while Jira stayed flat: same issues recycling.
5. **Detection is resident-driven; ownership is nobody's.** Issues surface via client complaints (Cardinal, Preiss, Trinity, Greystar on ticket titles). No invariant monitoring. 35 Sept issues unassigned; vulns Pending Assignment; billing correctness falls between the DA/HBG, insurance, and payments teams.

## October plan — zero resident-detected billing errors (added 2026-10-02)

Honest framing: ticket-zero in 30 days is not achievable (54 open, ~50/mo arrival, nothing trending down). The reachable, meaningful target: **zero NEW P1 money incidents, zero resident-DETECTED billing errors, new-issue rate halved.** Metric: mismatches detected internally vs reported by residents, and days-to-correct.

**Week 1 — stop active bleeding + name an owner**
- Fix DEV-343022/343021 (Trinity wrong fee basis — creating new wrong charges daily) and DEV-343411 (payments on wrong lease)
- Assign Sept-30 tokenization vulns (DEV-343156/158/161); owner + date on DEV-280586 ($495K)
- Name a single **billing-correctness owner** with authority to gate script runs and billing cycles; 48h assignment SLA on money tickets

**Weeks 1–2 — detection before correction**
- Build the **daily reconciliation/invariant job** (premium = scheduled charge = posted AR; one charge per active policy per period; every cancel has a reversal). Run across the whole book → complete mismatch worklist → correct in ONE guarded bulk run, replacing the 10 open artisanal datafixes. Job stays on permanently.

**Weeks 2–3 — break the doom loop, gate the hazards**
- Ship **DEV-343499 (self-serve charge reversal)** — reallocates ~2 datafixes/week of engineering capacity to the engine rewrite
- Extend **circuit breakers + mandatory dry-run** to all DA/HBG money scripts; add **Leap completion verification** (write confirmed or transaction self-flags)

**Week 4 — gated billing run**
- Nov 1 billing run executes only after a clean reconciliation pass. That's the October exit gate.

**Parallel track (starts now, lands Q4):** the charge-model rewrite (DEV-340618–627). Do NOT individually patch lifecycle bugs in code the rewrite deletes (gap-period reversal, cancel-before-start, future-interval charges) — fold them in as acceptance criteria. Patch only active bleeders.

**Deprioritized:** one-off root-causing of P2s the rewrite obsoletes; one-off mismatch investigations (superseded by the reconciliation job); historical forensics beyond the bulk correction run.

## Suggested next steps

1. **Chase DEV-280586 ($495K Leap invoice gap)** — P1, Not Started, ~6 months old. Owner: Dan Bullock's area (HB-Deposit Alternative).
2. **Get the Sept-30 payment-auth vulnerability cluster assigned** (DEV-343156/158/161/162) — unauthenticated money-movement APIs are both a security and a financial-integrity exposure.
3. Ask for a **root-cause rollup on DA/HBG charge lifecycle** — duplicates, missed reversals, and L2E fallout account for the plurality of all 368 tickets; the datafix cadence (~2-3/month) says the underlying engine, not the data, is the problem.
4. Track whether **MP circuit breakers (DEV-331799)** actually reduced the double-charge/mass-reversal class after Aug 28.
5. If a deeper pass is needed: re-run with full-text matching per component, or pull Zendesk-linked tickets via Domo to find customer-reported money issues that never got a money-term summary.

## Cross-reference: Homebody Slack Audit (Apr 1 – Oct 1, 2026)

Compared against the Slack audit of #ask-homebody, #ask-insurance, #sme-homebody-team, and #voice-of-the-customer (same six-month window; source: `Homebody_Slack_Audit.pdf` / `Homebody_Slack_Audit.xlsx`).

### Corroborations

- **Same #1 problem from both lenses.** Slack's biggest driver — ~45 Support/CS questions on DA/HBG duplicate, back-dated, or post-move-out charges needing manual credits — maps to this audit's largest cluster (DA/HBG: 110 of 285 issues; 24 explicitly duplicate/double-charge, plus the missed-reversal family).
- **"Manual credits" is the demand side of the datafix drumbeat.** Slack: charge codes are locked, so support can't correct wrong charges — everything becomes a manual credit or datafix. That's why this audit shows 49 datafixes (~2/week). DEV-343499 (HBG charge-reversal functionality, created 2026-10-01) is the product response and matches the Slack audit's "self-serve reversal tool" recommendation.
- **Incident-level matches:**

| Slack signal | Jira counterpart |
|---|---|
| MSI state tax fee (~9 Sept questions) | DEV-331595 / DEV-334381 — state tax fee missing in enroll-policy API (both P1) |
| Force-placed / non-compliance fees despite coverage (29 compliance questions) | DEV-332574, DEV-322265, DEV-308020, DEV-298296, DEV-328137, DEV-337194, DEV-338080 |
| HBG enrollments stuck, "heavily Preiss and Cardinal" | DEV-339897 + six Cardinal Group refund-request tickets |
| Leap/RentSense/E2E migration fallout (35 config questions) | L2E datafix family; orphaned RentSense charges (DEV-303204/308882); E2E duplicate charges (DEV-287711) |
| UPM residents charged for DA with no active policy (VOC) | DEV-286132, DEV-283755, DEV-324268 (charged after cancellation/move-out) |

### Divergence: support volume exploding, Jira creation flat

#ask-insurance questions grew 23 → 138 (Apr → Sep, 6x). Jira money-issue creation by month (this audit's 285-issue set): Apr 30, May 40, Jun 65, Jul 40, Aug 56, Sep 52 — no September spike. Likely explanations (all probably partly true): support repeatedly fields the *same* known issues without new tickets; manual credits are handled in Zendesk/Slack and never reach Jira; the 26% no-reply rate for Support posts means some issues die in-channel. **The Jira backlog understates the operational cost of these issues.**

### Blind spots (each direction)

- **Slack sees, Jira scan missed:** DEV-319267 (insurance email auto-login links expose resident portals, P2, no mitigation — no money terms in summary, so outside this scan); plain-text resident passwords in three threads; unfilled reporting requests (force-placed vs opt-in counts, DA claim rates); Fair Housing/FCRA questions answered in-channel instead of routed to legal.
- **Jira sees, Slack doesn't:** the Sev3 $495K Leap invoice gap (DEV-280586), the Sept-30 payment-tokenization vulnerability cluster, and carrier-export undercharging (DEV-324554) — client-invoicing and security exposures generate no resident-facing support questions. **The highest-dollar risks are invisible to support channels.**

### Combined takeaway

Two independent datasets converge: the DA/HBG and Master Policy billing engines are the problem, the current fix path (manual credits through locked charge codes) is burning support at a growing rate (6x in six months), and the biggest financial exposures (invoice gap, tokenization vulns) live only in Jira where support never sees them.

## Removed from issue set (83 tickets, for traceability)

- **Verification/QA (16):** DEV-341121, 341120, 341119, 341117, 341115, 341114, 341113, 336007, 335962, 327056, 316682, 316950, 316949, 309626, 299223, 299222
- **Scoping / spike / review (22):** DEV-336430, 331521, 328980, 328979, 328978, 328960, 328957, 328953, 324173, 322791, 320840, 317574, 311007, 309492, 298333, 294050, 288688, 288340, 283202, 281790, 280973, 300599
- **Feature / instrumentation / refactor / platform migration (35):** DEV-343499, 331799, 329566, 324133, 318312, 316944, 316943, 316942, 316939, 311395, 311273, 310104, 308438, 308284, 304682, 302457, 301597, 301510, 300877, 298728, 294295, 294288, 293541, 292911, 291298, 291101, 290838, 289909, 289905, 288379, 287952, 286964, 284685, 283607, 280091
- **Test / stage / dev-environment bugs (6):** DEV-342390, 302216, 302215, 300483, 299539, 299500
- **Datafix verification / process (4):** DEV-317040, 318276, 299033, 290644

## Full inventory (368 tickets)

Format: `KEY | Type | Priority | Status | Created | Component(s) | Summary`

```
DEV-343668|Bug|P2|Not Started|2026-10-01|HB-B2B|Homebody Guaranty Fee
DEV-343499|Task|P2|Not Started|2026-10-01|HB-Deposit Alternative|HBG : define and implement HBG recurring + enrolment charge reversal functionality
DEV-343411|Bug|P1|Not Started|2026-10-01|RXP-Capricorn|HB Payment request from Resident associated to different lease resulting to payment failure.
DEV-343161|Vulnerability|P2|Pending Assignment|2026-09-30|HBS-Web|Homebody Services Payments Call SecureConnect / TokenEx Without Authenticated, Client-Scoped Requests
DEV-343158|Vulnerability|P2|Pending Assignment|2026-09-30|RXP-Capricorn-Mobile|Mobile Payments SDK and Capricorn Call SecureConnect Tokenization Without Authenticated, Client-Scoped Requests
DEV-343156|Vulnerability|P1|Pending Assignment|2026-09-30|HB-B2C|Resident Insure / Insurance Portal Payment Flows Call the Payments API Without Authenticated, Client-Scoped Requests
DEV-343022|Bug|P1|Not Started|2026-09-29|HB-B2B|Data Fix - MPDP is referring wrong 'Fee Based On' causing wrong resident charges for trinity
DEV-343021|Bug|P1|Not Started|2026-09-29|HB-B2B|Code Fix - MPDP is referring wrong 'Fee Based On' causing wrong resident charges for trinity
DEV-342624|Bug|P2|Done|2026-09-28|HB-Deposit Alternative|Error messages seen during Payments monitoring
DEV-342609|Task|P1|In Review|2026-09-28|HB-Deposit Alternative|Bulk Renew HBG Residents from 9/28/2026 Enrollment Sheet (Waive $25 Enrollment Fee)
DEV-342590|Bug|P2|Done|2026-09-28|HB-B2C|Need to revert Billing Address change
DEV-342545|Bug|P1|Done|2026-09-28|HB-Deposit Alternative|New Relic 500 — TypeError in ledgerxxx/view_ledger_container
DEV-342530|Bug|P2|Reassigned|2026-09-28|HB-B2C|Re: Ticket 803943 is waiting for your response Homebody Guaranty Fees Not Showing in Renewal Transfers
DEV-342523|Bug|P2|Not Started|2026-09-28|HB-B2B|Limited liability charges on accounts twice but only one scheduled charge
DEV-342519|Bug|P2|Not Started|2026-09-28|HB-B2B|Insurance fee auto reversal
DEV-342396|Bug|P1|Review to Close|2026-09-28|HB-Deposit Alternative|HBG Refund Request - Cardinal Group: Lapis
DEV-342390|Bug|P2|Done|2026-09-28|RXP-Capricorn|R3 2026 - Performance Test - Unable to process Payments in Stage (HB Dev)
DEV-341757|Bug|P2|Not Started|2026-09-25|HB-B2C|Diagnostic : Get payment time-out policies from the last 30 days - ID: 2905 failed ( N Virginia )
DEV-341562|Bug|P1|Reassigned|2026-09-25|HB-Deposit Alternative|HBG charge and refund request
DEV-341542|Tech|P2|New|2026-09-25|HB-Deposit Alternative|HBG : Update billing of HBG L2E Incorrect Charge Amount
DEV-341121|Task|P2|Not Started|2026-09-25|RXP-Capricorn-Mobile|[Android] Insurance Admin Fee Verification and Remaining Convenience-Fee Restructuring Across RP Mobile
DEV-341120|Task|P2|Not Started|2026-09-25|RXP-Capricorn-Mobile|[Android] Verification: Convenience Fee Propagation for One-Time, 3DS, Amenities, and Events
DEV-341119|Task|P2|Not Started|2026-09-25|RXP-Capricorn-Mobile|[Android] Verification: Convenience Fee for Other Payment Methods (SEPA, Stripe, Cash App Pay, MoneyGram, IBT, UnionPay)
DEV-341117|Task|P2|Not Started|2026-09-25|RXP-Capricorn-Mobile|[iOS] Insurance Admin Fee Verification and Remaining Convenience-Fee Restructuring Across RP Mobile
DEV-341115|Task|P2|Not Started|2026-09-25|RXP-Capricorn-Mobile|[iOS] Verification: Convenience Fee Propagation for One-Time, 3DS, Amenities, and Events
DEV-341114|Task|P2|Not Started|2026-09-25|RXP-Capricorn-Mobile|[iOS] Verification: Convenience Fee for Other Payment Methods (SEPA, Stripe, Cash App Pay, MoneyGram, IBT, UnionPay)
DEV-341113|Task|P2|Not Started|2026-09-25|RXP-Capricorn-Mobile|[iOS] Verification: Convenience Fee for Card Payments - OTP
DEV-340992|Tech|P2|New|2026-09-24|HB-Deposit Alternative|DA: Datafix — update policy coverage and term, then refresh export pricing from policy_confirm
DEV-340983|Tech|P2|New|2026-09-24|HB-Deposit Alternative|HBG: E2E scheduled charge dates and destination ids
DEV-340308|Bug|P1|Not Started|2026-09-23|HB-Deposit Alternative|HBG Refund Request - Cardinal Group: LIV+ Arlington Watley, Allyiah (16050431)
DEV-340306|Bug|P2|Ready for Dev|2026-09-23|HB-B2B|Master Policy: "Prorate By Day" preference not applied to mid-month move-in charges
DEV-339897|Bug|P1|Code Review|2026-09-22|HB-Deposit Alternative|HBG Preiss & Cardinal - HBG Recurring Charge Reinstatement Request
DEV-339816|Bug|P2|Done|2026-09-22|HB-B2C|Policy billing-frequency history displays incorrect date due to timezone discrepancy
DEV-339543|Bug|P2|Ready for Dev|2026-09-22|HB-B2C|Property Setup syncing Payment Address instead of Physical/Primary Address (Regression on DEV-316508)
DEV-338722|Tech|P1|New|2026-09-18|HB-Deposit Alternative|HBG: Datafix — complete interrupted PDM issued-policy writes after Leap success (Four Star 2026-09-18)
DEV-338710|Tech|P1|Done|2026-09-18|HB-B2B|MP: Datafix September MPC premiums so resident portal shows liability + content (not $0 / content-only)
DEV-338642|Bug|P2|Review to Close|2026-09-18|HB-Deposit Alternative|DA : Deposite Alternative Charges After Moveout
DEV-338463|Bug|P2|Done|2026-09-17|HB-Deposit Alternative|HBG: Enrollment email not persisted or linked; missing old/new amounts on price change
DEV-338393|Bug|P2|Need More Info|2026-09-17|HB-Deposit Alternative|Homebody Guaranty pricing error
DEV-338108|Bug|P1|Closed|2026-09-16|HB-Deposit Alternative|HBG Refund Request - Cardinal Group: The Yards at Old State
DEV-336584|Tech|P2|New|2026-09-11|HB-Deposit Alternative|HBG: Incorrect scheduled charge created for future Lease Interval
DEV-336430|Task|P2|Closed|2026-09-11|RXP-Capricorn-Mobile|Scoping : Convenience Fees and TransferMate Reference Number epics for RP Mobile
DEV-336311|Task|P2|Not Started|2026-09-10|HB-B2B|Master Policy: Clean up duplicate charges for Michaels Student Living (Oasis, Avalon Place)
DEV-336283|Bug|P2|Ready for Dev|2026-09-10|HB-B2B|Master Policy: enrollment notification email displays stale fee after property pricing update
DEV-336268|Tech|P2|New|2026-09-10|HB-Deposit Alternative|HBG: Datafix — reverse unreversed AR after cancel date-gate fix
DEV-336247|Bug|P2|Not Started|2026-09-10|HB-Deposit Alternative|HBG: Cancel before policy start does not reverse posted resident charges
DEV-336138|Tech|P2|New|2026-09-10|HB-B2C|[NR Rollup] Investigate undefined $fltProviderLiabilityAmount in resident_insurance.process_payments
DEV-336007|Task|P2|Not Started|2026-09-10|RXP-Capricorn-Mobile|[iOS] Verification: Convenience Fee for Card Payments – OTP
DEV-335962|Task|P2|Not Started|2026-09-10|RXP-Capricorn-Mobile|[Android] Verification: Convenience fee for Card payments - Recurring
DEV-335646|Bug|P2|Ready for Dev|2026-09-09|HB-Deposit Alternative|HBG Homebody Guaranty - double bill September
DEV-335619|Bug|P2|Ready for Dev|2026-09-09|HB-B2B|Master Policy: Gap-period charges not reversed when resident obtains qualifying coverage within refund window
DEV-335612|Bug|P2|Need More Info|2026-09-09|HB-Deposit Alternative|HBG Homebody Guaranty Update Monthly Charge
DEV-335609|Bug|P2|Investigating|2026-09-09|HB-Deposit Alternative|HBG #265163 - Homebody Charges added incorrectly
DEV-334937|Bug|P2|Dev - In Development|2026-09-08|HB-B2B|Bank Lofts "Insurance Exception" issue on Tax Credit
DEV-334582|Bug|P2|Done|2026-09-07|RXP-Capricorn-Mobile|[iOS] Monthly Recurring Payment displays the selected payment date one day earlier on the UI
DEV-334432|Bug|P2|Closed|2026-09-07|HB-B2C|Markel HO4: semi-annual payment paid-through mismatch, rogue $40.64 charge, ledger credit $-15.95 (RTH13069287)
DEV-334381|Bug|P1|Done|2026-09-07|RXP-Capricorn-Mobile|Android - RP Mobile APP - State tax fee missing in the enroll policy API
DEV-333983|Bug|P2|Done|2026-09-03|RXP-Capricorn-Mobile|Mobile - Apple Pay duplicate-payment warning shows no actionable checkbox; scheduled payment banner missing in Homebody
DEV-333902|Bug|P2|Done|2026-09-03|HB-Deposit Alternative|DA: Homebody Deposit Alternative didn't get charged for this month.
DEV-333812|Bug|P2|Done|2026-09-03|RXP-Capricorn-Mobile|[iOS] Balance Due / Payment Amount fails to update on Payment Home Screen card after a successful transaction
DEV-333786|Bug|P2|Closed|2026-09-03|RXP-Capricorn-Mobile|Resident Portal does not display Make a Payment option for CID 14432
DEV-333522|Bug|P2|Done|2026-09-02|RXP-Capricorn|Remove the ability to double click make a payment on other browsers
DEV-333510|Bug|P2|Ready for Dev|2026-09-02|HB-Deposit Alternative|DA: Nightly create skips policy when type-13 charges already exist
DEV-333399|Bug|P2|Closed|2026-09-02|HB-Deposit Alternative|HBG Homebody charge
DEV-333325|Tech|P2|Done|2026-09-02|HB-B2B|Data fixes: duplicate and orhaned records
DEV-333111|Bug|P2|Not Started|2026-09-01|HB-B2C|Diagnostic : IP Poston dates from failed payment section. - ID: 2872 failed ( N Virginia )
DEV-332634|Vulnerability|P2|Closed|2026-08-31|HB-B2C|IDOR in Insurance Upcoming Payment — Financial Data Exposure via entityId Enumeration
DEV-332574|Bug|P2|Closed|2026-08-31|HB-B2B|Resident with verified insurance being charged non compliance fee
DEV-332525|Bug|P2|Closed|2026-08-31|HB-B2B|Master Policy charged late
DEV-331878|Tech|P1|New|2026-08-29|HB-B2B|MP: Disable duplicate September 2026 MPC and FPP rows so only one record exports/bills per policy
DEV-331864|Bug|P2|Reassigned|2026-08-28|HB-B2C|Diagnostic : Insurance policy premium amount is NULL or 0 - ID: 1313 failed ( N Virginia )
DEV-331839|Bug|P1|Done|2026-08-28|HB-B2B|Master Policy: Content-Only AR charges not posting — ~$4K unposted on CID 10406
DEV-331802|Tech|P2|Done|2026-08-28|HB-B2B|Data-fix: Double charges due to daily renewals
DEV-331799|Tech|P2|Done|2026-08-28|HB-B2B|Add pre-execution circuit breakers to Master Policy scripts (renewal, billing, export)
DEV-331730|Bug|P2|Closed|2026-08-28|HB-B2C|Forced Place Insurance Charges
DEV-331643|Tech|P2|Done|2026-08-28|HB-B2B|Data fix for DEV-324554
DEV-331595|Bug|P1|Done|2026-08-28|RXP-Capricorn-Mobile|RP Mobile APP(iOS) - State tax fee missing in the enroll policy API
DEV-331521|Task|P2|Closed|2026-08-28|RXP-Capricorn-Mobile|Scoping: Homebody: Canada Payment EPICs
DEV-331351|Bug|P2|Done|2026-08-27|RXP-Capricorn|Autopayment Error
DEV-331326|Bug|P2|Closed|2026-08-27|HB-Deposit Alternative|HBG: Homebody Guaranty Merge Fields Not Matching Scheduled charges
DEV-331223|Bug|P2|Closed|2026-08-27|HB-Deposit Alternative|Homebody Guarantee double billing transferring residents
DEV-330788|Bug|P2|Done|2026-08-26|HB-Deposit Alternative|HBG: Fail L2E when calculated client fee is over $100
DEV-330328|Tech|P2|Done|2026-08-25|HB-Deposit Alternative|HBG: Reverse charges created before policy start
DEV-330318|Bug|P2|Done|2026-08-25|HB-Deposit Alternative|HBG: Set starts_with_lease false so enrollment charges stay on policy dates, not move-in cleanup
DEV-330268|Tech|P2|Closed|2026-08-25|HB-B2C|Data fix for failed payment processing
DEV-329937|Bug|P2|Done|2026-08-24|HB-Deposit Alternative|DA/HBG: Dashboard resident name opens Financial Ledger instead of product sidetab
DEV-329566|Tech|P2|New|2026-08-21|HB-B2B|Refactor: Unify resident fee calculation into single formula across MP variants
DEV-329157|Bug|P2|Closed|2026-08-20|HB-B2B|Insurance Charges
DEV-329053|Tech|P2|Closed|2026-08-20|HB-Deposit Alternative|DA: investigate why Westland > DA also automatically post standard security deposit charges based on property pricing
DEV-328980|Task|P2|Closed|2026-08-20|RXP-Capricorn-Mobile|Scoping: HB RXP - TransferMate - Card Payments and eBank Transfer Payment (Mobile)
DEV-328979|Task|P2|In Progress|2026-08-20|RXP-Capricorn-Mobile|Scoping: HB RXP - TransferMate - eBank Transfer Ledger, Banner, and Instructions (Mobile)
DEV-328978|Task|P2|Resolved|2026-08-20|RXP-Capricorn-Mobile|Scoping: TransferMate - Card Payments
DEV-328960|Task|P2|Not Started|2026-08-20|RXP-Capricorn-Mobile|Scoping: International Refund Accounts
DEV-328957|Task|P2|Not Started|2026-08-20|RXP-Capricorn-Mobile|Scoping: Canada Refunds method
DEV-328953|Task|P2|Closed|2026-08-20|RXP-Capricorn-Mobile|Scoping: Amenities Native Payments
DEV-328915|Bug|P2|Closed|2026-08-19|HB-B2C|"Failed to update payment details" error while update payment details on HB1.0 site
DEV-328796|Bug|P2|Done|2026-08-19|HB-B2C|RI purchase: payment failure (insufficient funds) creates orphaned policy record, blocking retry with 'multiple policies' error
DEV-328566|Tech|P2|In Refinement|2026-08-18|HB-Deposit Alternative|DA: data-fix for client premium adjustment when state default is 13%
DEV-328408|Bug|P2|Done|2026-08-18|RXP-Capricorn|Order the installment billing correctly
DEV-328379|Bug|P2|Closed|2026-08-18|HB-B2B|insurance Lapse fee charge
DEV-328137|Bug|P2|Done|2026-08-17|HB-B2B|Master Policy fee not being reversed
DEV-328123|Bug|P2|Dev - In Development|2026-08-17|HB-B2B|Investigate and resolve incremental July double charges for Master Policy
DEV-327507|Bug|P2|Code Review|2026-08-15|HB-B2B|Investigate and resolve concurrent Master Policies causing unreversed double charges
DEV-327056|Tech|P2|Done|2026-08-14|HB-B2B|Cancellations and refund verifications
DEV-326937|Tech|P2|Done|2026-08-13|HB-Deposit Alternative|HBG: Data fix for cancel leases fields set NULL from CHomeBodyGurantyScript cancel interval function
DEV-326897|Bug|P2|Closed|2026-08-13|HB-B2C|Diagnostic : Get payment time-out policies from the last 30 days - ID: 2905 failed ( N Virginia )
DEV-326851|Task|P2|In Progress|2026-08-13|HB-B2B|Reverse incorrect refunds issued to past residents
DEV-326782|Bug|P2|Closed|2026-08-13|HB-B2C|RI: MSI stored premium differs from bind API premium on new enrollments (~2,351 of 90,204)
DEV-326772|Bug|P2|Closed|2026-08-13|HB-B2C|RI: MSI tax-state policies missing down payment / tax amounts after tax-state release (~160 of 3,454)
DEV-326659|Bug|P2|Closed|2026-08-13|HBS-Web|New Relic 500 — NoticedError in ledgerxxx/view_full_ledger
DEV-326468|Task|P2|In Progress|2026-08-13|HB-B2C|Add manual refund for brock green and two more users
DEV-326314|Bug|P3|Closed|2026-08-12|HB-B2B|Homebody - not reversing a compliance fee
DEV-326136|Bug|P2|Closed|2026-08-12|HBS-Web|ISSUE: unable to create Entrata Bill Pay payment, "The Reference ID is Required (and 1 more error)"
DEV-326095|Bug|P2|Closed|2026-08-12|HBS-Web|Bulk insert AR transactions fails with empty IN () on ar_payments when ar_payment_id is null (ct-bulk-insert-ar-transactions)
DEV-325738|Tech|P2|Done|2026-08-11|HB-Deposit Alternative|DA : data-fix to reverse charges for lease id 800045
DEV-325370|Bug|P3|Closed|2026-08-10|HB-Deposit Alternative|CLONE - Deposit Alternative Fees
DEV-325362|Bug|P2|Reassigned|2026-08-10|HB-Deposit Alternative|New Relic 500 — N/A in ledgerxxx/view_ledger_container
DEV-325356|Bug|P2|Done|2026-08-10|HB-Deposit Alternative|Homebody Guaranty Incorrect Charge Amount
DEV-325307|Bug|P2|Closed|2026-08-10|HB-Deposit Alternative|Homebody Guaranty Fee
DEV-325123|Bug|P2|Closed|2026-08-10|HB-B2C|CLONE - Spike: B2C conversion technical investigation — duplicate email/policy errors and premium validation failures
DEV-324623|Bug|P2|Done|2026-08-06|HB-Deposit Alternative|HBG: Flat-cancelled policies still included in property billing batch
DEV-324554|Bug|P2|Done|2026-08-06|HB-B2B|Master Policy renewal: prorated premium amounts copied to all subsequent months — carrier export AND client billing undercharged
DEV-324525|Bug|P2|Done|2026-08-06|HB-B2C|Unable to Change Allowed Payment Type
DEV-324268|Bug|P2|Closed|2026-08-05|HB-Deposit Alternative|Deposit Alternative Fee Charged After Mone out.
DEV-324173|Tech|P1|Closed|2026-08-05|HB-B2C|Spike: B2C conversion technical investigation — duplicate email/policy errors and premium validation failures
DEV-324146|Bug|P2|Done|2026-08-05|HB-B2B|Datafix:Content Optional Policies not renew after change coverages
DEV-324133|Tech|P2|Done|2026-08-05|HB-Deposit Alternative|DA-HBG: add newrelic event with exact message on scheduled charge creation failed
DEV-323885|Bug|P2|Done|2026-08-04|HB-B2B|Missing Master Policy Charge
DEV-323733|Task|P2|Closed|2026-08-04|RXP-Capricorn|Zod Bugs for Payments
DEV-323480|Bug|P2|Closed|2026-08-03|HB-Deposit Alternative|Reverse Homebody Guaranty Charge
DEV-323430|Tech|P1|New|2026-08-03|HB-Deposit Alternative|DA/HBG: Correct policy premiums and client fees after L2E migration charge correction
DEV-323420|Bug|P2|Closed|2026-08-03|HB-Deposit Alternative|Homebody Duplicate Charges
DEV-323238|Tech|P2|Done|2026-08-03|HB-B2C|CRIAdminServiceHandler::getPaymentInfo returns full PAN + ACH routing for arbitrary accountIds (no tenant fence)
DEV-323032|Tech|P2|Done|2026-08-02|HB-Deposit Alternative|DA: Datafix II— identify and reverse duplicate past-month charges posted Apr/May/Jun 2026 (recovery script fallout)
DEV-322791|Task|P2|Resolved|2026-07-31|RXP-Capricorn-Mobile|Scoping: Stripe Payments For HB Mobile for make a payment
DEV-322265|Bug|P2|Closed|2026-07-30|HB-B2B|Master Policy Fee Generated Despite Active HB Policy and Policy Match Cannot Be Restored
DEV-321714|Tech|P1|Done|2026-07-29|HB-Deposit Alternative|HBG L2E: Modify Logic For Deleting Scheduled Charges
DEV-321540|Bug|P3|Done|2026-07-29|HB-B2C|Fix premium display discrepancy for policy RTH12681722
DEV-321393|Tech|P2|Done|2026-07-29|HB-Deposit Alternative|DA: Reverse DA charges that were created due to non synchronised claim status
DEV-321064|Bug|P2|Done|2026-07-28|HB-B2B|Incorrect Master Policy Charges
DEV-320840|Task|P2|Closed|2026-07-27|RXP-Capricorn-Mobile|Scoping: Stripe Payments For HB Mobile
DEV-320833|Bug|P2|Done|2026-07-27|RXP-Capricorn-Mobile|Android Task: Update Refund Account Confirmation Button Text
DEV-320830|Tech|P2|Done|2026-07-27|HB-Deposit Alternative|Data fix for data set as NULL from CHomeBodyGurantyScript cancel interval function
DEV-320827|Bug|P2|Done|2026-07-27|RXP-Capricorn-Mobile|iOS Task: Align Manage Refund Account Screen with Android
DEV-320681|Bug|P2|Closed|2026-07-27|HB-B2B|Investigate and resolve duplicate insurance policy charges for units 1155 and 3156
DEV-320653|Bug|P2|Closed|2026-07-27|HB-Deposit Alternative|Deposit alternative charges are not getting reversed.
DEV-320600|Bug|P2|Closed|2026-07-27|HB-B2B|Sec Dep credit reversal
DEV-320360|Bug|P2|Closed|2026-07-25|HB-B2C|Diagnostic : IP Poston dates from failed payment section. - ID: 2872 failed ( N Virginia )
DEV-320158|Bug|P1|Closed|2026-07-23|HB-B2B|Master Policy fees incorrectly reversed for past residents on July 23, creating credits on zero-balance accounts
DEV-319893|Tech|P2|Done|2026-07-23|HB-Deposit Alternative|HBG : Data fix for duplicate schedule charges
DEV-319791|Bug|P2|Closed|2026-07-22|HB-B2B|Payment Not Allocated to Renters Insurance Charges Causing Late Fees
DEV-319778|Bug|P2|Closed|2026-07-22|HB-Deposit Alternative|Incorrect GL Code Showing On Ledger
DEV-319763|Bug|P2|Closed|2026-07-22|HB-B2B|Master Policy Charges
DEV-319740|Tech|P2|In Refinement|2026-07-22|HB-Deposit Alternative|DA/HBG: Datafix — refund exports billed after claim closure (Leap claim status lag)
DEV-319512|Bug|P1|Closed|2026-07-21|HB-B2B|Unable to perform Reverse Move-in and Perform Move-out Request fails with 500 Internal Server Error
DEV-319344|Bug|P2|Done|2026-07-21|HB-B2B|Double Charged Renters Insurance Default 07/01/26
DEV-319161|Tech|P2|Closed|2026-07-20|HB-Deposit Alternative|DA: Datafix — correct 13% state premium overcharges (client debit/credit applied incorrectly)
DEV-318604|Bug|P2|Done|2026-07-17|RXP-Capricorn|Residents can't pay with ACH on Homebody App
DEV-318312|Tech|P2|New|2026-07-17|HB-Deposit Alternative|DA : UT for pricing calculation
DEV-318276|Tech|P2|Done|2026-07-17|HB-B2B|Data fix verification for Renewals
DEV-318081|Tech|P2|Closed|2026-07-17|HB-Deposit Alternative|DA : Data fix for move-in charge mismatch after manual Enhanced enrollment
DEV-317574|Task|P2|Closed|2026-07-16|RXP-Capricorn-Mobile|Scoping - Canadian Payment Support: PAD Integration via External APIs
DEV-317345|Tech|P2|Done|2026-07-15|RXP-Capricorn-Mobile|iOS : App is crashing when init Payment Kit
DEV-317190|Bug|P2|Closed|2026-07-15|HB-Deposit Alternative|Homebody Guaranty - Invoice Questions
DEV-317156|Bug|P2|Closed|2026-07-15|HB-B2B|Renter's Insurance and Rent Plus Fees
DEV-317142|Task|P2|Closed|2026-07-15|RXP-Capricorn|INvestigate add payment account errors
DEV-317040|Task|P2|Closed|2026-07-15|HB-B2B|Verification of billed and exports data fixes
DEV-317033|Bug|P2|Done|2026-07-15|RXP-Capricorn-Mobile|iOS : Bug fixes for Payments
DEV-317017|Bug|P2|Done|2026-07-15|RXP-Capricorn-Mobile|Android : Bug fixes for Payments
DEV-316950|Tech|P2|Done|2026-07-15|RXP-Capricorn-Mobile|Android: End to End testing for updated Payments SDK
DEV-316949|Tech|P2|Done|2026-07-15|RXP-Capricorn-Mobile|iOS: End to End testing for updated Payments SDK
DEV-316944|Tech|P2|Done|2026-07-15|RXP-Capricorn-Mobile|Android: Move Payment screens from Capricorn to Payment SDK - API
DEV-316943|Tech|P2|Done|2026-07-15|RXP-Capricorn-Mobile|iOS: Move Payment screens from Capricorn to Payment SDK - API
DEV-316942|Tech|P2|Done|2026-07-15|RXP-Capricorn-Mobile|Android: Move Payment screens from Capricorn to Payment SDK - UI
DEV-316939|Tech|P2|Done|2026-07-15|RXP-Capricorn-Mobile|iOS: Move Payment screens from Capricorn to Payment SDK - UI
DEV-316828|Tech|P2|Done|2026-07-14|HB-Deposit Alternative|DA: Skip client premium adjustment when state default is 13%
DEV-316682|Task|P1|Closed|2026-07-14|HB-B2C|QBE cancellation refund verification & monitoring
DEV-316383|Tech|P2|New|2026-07-13|HB-B2C|Datafix existing Array ID Theft policies — correct under-tiered carrier liability to Tier 1 amounts
DEV-316283|Bug|P2|Done|2026-07-13|HB-B2B|[datafix] IVS-denied and IVS-verified policies remain on client Insurance Dashboard Verify queue
DEV-316177|Bug|P2|Done|2026-07-12|HB-Deposit Alternative|DA: Policy issue is not correcting scheduled charge
DEV-312266|Bug|P2|Done|2026-07-09|HB-Deposit Alternative|Deposit Alternative Fees
DEV-312160|Bug|P2|Done|2026-07-09|HB-B2B|Content-optional master policy rewrite data fix (content_optional_policy_rewrite)
DEV-312152|Bug|P2|Done|2026-07-09|HB-B2C|Fix null premium amount crash in /homebody/v3/view_policies (CHomebodyViewPolicies.php)
DEV-311904|Bug|P2|Done|2026-07-08|HB-Deposit Alternative|HBG: Policy issuing fails when scheduled charge end date is last day of current month
DEV-311749|Tech|P2|Done|2026-07-08|HB-B2C|Investigate: RI_RETURN_ADJUSTMENT Ledger Posting Reference
DEV-311397|Bug|P2|Closed|2026-07-07|HB-Deposit Alternative|Request for Removing Charges - Lapis | Cardinal Group Mgmt
DEV-311395|Task|P2|Resolved|2026-07-07|HB-B2C|Renter Insurance: Add JCB and China UnionPay card brand icons to payment page
DEV-311273|Tech|P2|New|2026-07-06|HB-Deposit Alternative|DA: Display daMetadata eligibility warnings and pricing labels in Review Results React
DEV-311007|Task|P3|Closed|2026-07-06|RXP-Capricorn|RXP Web – Apple Pay: Review Terraform and Wrapper for Make a Payment
DEV-310242|Tech|P2|Done|2026-07-03|HB-Deposit Alternative|DA : Fix move-in charge mismatch after manual Enhanced enrollment
DEV-310104|Tech|P2|Done|2026-07-02|HB-Deposit Alternative|DA/HBG: Monthly scheduled script to sync open claim status from LEAP before billing
DEV-309626|Task|P2|Resolved|2026-07-02|RXP-Capricorn-Mobile|Verification of Card Pre-Selection in Add Payment Method with API
DEV-309492|Task|P2|Closed|2026-07-02|RXP-Capricorn-Mobile|Scoping Ticket for Payments Parity EPICs
DEV-308882|Task|P2|Not Started|2026-06-30|HB-Deposit Alternative|TDD: DA: Data fix for Orphaned Rentsense scheduled charges
DEV-308834|Bug|P2|Closed|2026-06-30|RXP-Capricorn|Failed to Update Refund Account error
DEV-308749|Bug|P2|Done|2026-06-30|HB-Deposit Alternative|HBG Charge Reversal Request - Cardinal Group Lease ID 16039637
DEV-308438|Tech|P2|Done|2026-06-30|HB-Deposit Alternative|DA-HBG: Policy tool > Billing Gap Enhancement
DEV-308284|Tech|P2|Done|2026-06-29|RXP-Capricorn-Mobile|iOS : Implement the logs and breadcrums for the firebase crashlytics - Payments SDK
DEV-308037|Bug|P2|Closed|2026-06-29|HB-Deposit Alternative|Homebody Pricing Unavailable
DEV-308020|Bug|P2|Done|2026-06-29|HB-B2B|Master Policy Fee Charged With Active Policy
DEV-307834|Tech|P2|Done|2026-06-29|HB-Deposit Alternative|HBG - Identify and do datafix for new columns quote_id and lease_term_id for existing records
DEV-306985|Tech|P2|Done|2026-06-25|HB-B2C|Update plans table for Device Protection Max (plan_id 9) premium amounts
DEV-306984|Tech|P2|Done|2026-06-25|HB-B2C|Datafix existing Device Protection Max policies — update admin_fee on coverage details
DEV-306428|Tech|P2|Done|2026-06-24|HB-B2B|MP: Datafix for Renaissance Management - Flat cancel bulk policies
DEV-306334|Bug|P2|Closed|2026-06-24|HB-B2B|MasterPolicy Monthly Fee Not Charging Residents
DEV-305997|Bug|P2|Done|2026-06-23|HB-B2B|Investigate failed MP reversal for Passco - Ali Schnauber (15765608)
DEV-305945|Bug|P2|Done|2026-06-23|RXP-Capricorn-Mobile|iOS: Prevent Past Start Dates for Auto, Bi-Weekly, and Monthly Payments
DEV-305944|Bug|P2|Done|2026-06-23|RXP-Capricorn-Mobile|Android: Prevent Past Start Dates for Auto, Bi-Weekly, and Monthly Payments
DEV-305910|Tech|P2|New|2026-06-23|HB-Deposit Alternative|DA: charge is not get posted before move-in if charge posting time has passed
DEV-305808|Bug|P2|Closed|2026-06-22|HB-Deposit Alternative|DA: Active policies with no export or resident charge for June
DEV-305800|Bug|P2|Closed|2026-06-22|HB-Deposit Alternative|HBG: Active policies with no export or resident charge for June
DEV-305641|Bug|P2|Done|2026-06-22|RXP-Capricorn|PAYMENT: Don't call payment api's if payment is disabled
DEV-305638|Bug|P2|Done|2026-06-22|RXP-Capricorn|PAYMENT: Auto payment dates in the past.
DEV-305020|Bug|P2|Closed|2026-06-20|HB-B2C|Diagnostic : Get payment time-out policies from the last 30 days - ID: 2905 failed ( N Virginia )
DEV-304682|Task|P2|Resolved|2026-06-19|HB-B2C|Icon and UI corrections — Payment step visual fixes and copy correction
DEV-304215|Bug|P2|Closed|2026-06-18|HB-B2B|Personal Contents Policy Details document displays incorrect limits and premium values
DEV-304050|Bug|P2|Closed|2026-06-18|HB-B2B|RE: [Entrata] Re: 722819 - Refund Master Policy Gap Fees to Resident
DEV-303747|Bug|P1|Done|2026-06-17|RXP-Capricorn|Payment Delete with auto payment
DEV-303597|Bug|P2|Done|2026-06-17|HB-B2B|code fix MP: Cancel MPC admin_fee and billing batch_total mismatch - flat-cancel rule applied inconsistently
DEV-303567|Bug|P2|Done|2026-06-17|RXP-Capricorn|Delete auto-payment and payment account race condition bug
DEV-303363|Bug|P2|Done|2026-06-17|HB-B2C|Policy canceled/lapsed even though payment was made
DEV-303204|Tech|P2|Done|2026-06-16|HB-Deposit Alternative|DA: Data fix for Orphaned Rentsense scheduled charges
DEV-303178|Bug|P2|Closed|2026-06-16|HB-Deposit Alternative|Deposit Alternative Being Charged on Wrong Database
DEV-303120|Bug|P2|Done|2026-06-16|RXP-Capricorn|Payments: Roommate Split Payment - On notice Resident missing
DEV-303116|Tech|P2|Done|2026-06-16|HB-Deposit Alternative|DA: Datafix — identify and reverse duplicate past-month charges posted Apr/May/Jun 2026 (recovery script fallout)
DEV-303109|Bug|P2|Closed|2026-06-16|HB-B2B|Master Policy enrolls and charges residents while custom coverage is still active — FPP effective date backdated on expiring-policy notice
DEV-303095|Bug|P2|Done|2026-06-16|RXP-Capricorn|Add Payment Method popup – security code validation error shows: {%s}
DEV-303089|Bug|P2|Done|2026-06-16|RXP-Capricorn|Make Payment with 0 payment amount
DEV-303074|Bug|P2|Done|2026-06-16|RXP-Capricorn|Add Refund Account - Reroute Dialog Logic
DEV-302774|Bug|P2|Closed|2026-06-16|HB-B2C|EasyEnroll 2.0 displays incorrect Identity Protection price ($10.48/mo)
DEV-302660|Bug|P2|Closed|2026-06-15|HB-B2B|MP enrollment displays incorrect fee for content-included master policy — shows $17.44 instead of $15
DEV-302570|Bug|P2|Done|2026-06-15|RXP-Capricorn|Auto-payment "last day of month" options use day 31 instead of the month's actual last day
DEV-302555|Bug|P2|Done|2026-06-15|HB-Deposit Alternative|DA: Posted AR charges not reversed when deposit preference removed during application edit
DEV-302516|Bug|P2|Closed|2026-06-15|HB-B2B|Defect: Policy Document Download – Premium Amount and Insured Location Display Incorrect Static Values
DEV-302457|Tech|P2|Done|2026-06-15|RXP-Capricorn-Mobile|Android: Remove sensitive logs from Payment-SDK
DEV-302216|Bug|P2|Done|2026-06-14|RXP-Capricorn-Mobile|iOS - Payment Blitz testing issue
DEV-302215|Bug|P2|Done|2026-06-14|RXP-Capricorn-Mobile|Android - Payment Blitz testing issue
DEV-301637|Tech|P2|Done|2026-06-11|HB-B2B|MP: Datafix for Morgan flat cancel or update MP end dates
DEV-301597|Task|P2|Closed|2026-06-11|RXP-Capricorn|Update getRepaymentDetails payment_history field
DEV-301510|Tech|P2|New|2026-06-11|HB-Deposit Alternative|DI and DA code segration from Ledger And Transactions Controller
DEV-301482|Bug|P2|Closed|2026-06-11|RXP-Capricorn-Mobile|Android: Resolve DatePicker Timezone Issues Across Capricorn and Payment SDK
DEV-301457|Bug|P2|Closed|2026-06-11|RXP-Capricorn-Mobile|iOS - Bulk Payment displays surplus amount as negative value for multi-lease payments instead of 0
DEV-301455|Bug|P2|Closed|2026-06-11|RXP-Capricorn-Mobile|Android - Bulk Payment displays surplus amount as negative value for multi-lease payments instead of 0
DEV-301380|Bug|P2|Done|2026-06-10|HB-B2B|Master Policy Charges
DEV-301367|Tech|P2|Done|2026-06-10|HB-B2B|MP: Datafix Flat cancel all MP records for Platform Residential - Campus Edge
DEV-301314|Bug|P2|Closed|2026-06-10|HB-Deposit Alternative|duplicate deposit alternative fees
DEV-300895|Bug|P2|Closed|2026-06-09|HB-Deposit Alternative|Deposit Reversed on Lease Modification
DEV-300890|Bug|P2|Done|2026-06-09|RXP-Capricorn|Rewards Points Payment issue
DEV-300877|Task|P2|Closed|2026-06-09|RXP-Capricorn|Add payment Requests in logs
DEV-300620|Bug|P2|Done|2026-06-08|HB-B2B|Coverage change on active policy generates new policy without flat-cancel-and-rewrite — charge not posted, policy displays as inactive
DEV-300609|Bug|P2|Done|2026-06-08|HB-Deposit Alternative|HBG: [Datafix] L2E migration - missed Homestead lease recurring charge correction (lease 15975313)
DEV-300599|Task|P2|Closed|2026-06-08|RXP-Capricorn|Review NR payment errors.
DEV-300484|Bug|P2|Done|2026-06-08|HB-B2C|Device Protection: lapsed due to non-payment email not found (policy H6IPHBKI — Matthew Vericker)
DEV-300483|Bug|P2|Closed|2026-06-08|RXP-Capricorn|Payment method change fails with error in dev environment (Homebody 2.0 / RxP)
DEV-299539|Bug|P2|Done|2026-06-05|RXP-Capricorn|RxP: Change payment method fails with error in Dev environment
DEV-299537|Bug|P2|Done|2026-06-05|HB-B2C|Amex card logo displayed as accepted but Amex payments rejected on app.homebody.com
DEV-299500|Bug|P2|Closed|2026-06-05|HB-B2B|Unable to access Master Policy Insurance Pricing in Standard Stage — module name mismatch
DEV-299486|Bug|P2|Closed|2026-06-05|HB-B2B|Master Policy enrollments stuck in "Future" status — not activating on start date, no charges posted
DEV-299395|Bug|P2|Closed|2026-06-05|HB-Deposit Alternative|Deposit Alternative Fee
DEV-299223|Task|P2|Closed|2026-06-05|RXP-Capricorn-Mobile|Android: Perform R2 verification - Payments
DEV-299222|Task|P2|Closed|2026-06-05|RXP-Capricorn-Mobile|iOS: Perform R2 verification - Payments
DEV-299033|Task|P2|Closed|2026-06-05|HB-B2B|Optional content data fix verification
DEV-298840|Bug|P2|Closed|2026-06-04|HB-B2B|Master Policy Bulk Dynamic Pricing Editor not available in production
DEV-298728|Tech|P1|Closed|2026-06-04|RXP-Capricorn-Mobile|iOS: Show exact error message on API failure comes from Payment SDK
DEV-298725|Bug|P2|Closed|2026-06-04|HB-B2C|Policyholder charged more than monthly premium with no policy changes — duplicate payment attempts observed
DEV-298333|Task|P2|Closed|2026-06-03|RXP-Capricorn-Mobile|Scoping: Installment Billing Display - Mobile
DEV-298327|Bug|P2|Done|2026-06-03|RXP-Capricorn-Mobile|PaymentKit.NetworkError when trying to make a payment in Homebody
DEV-298313|Bug|P2|Done|2026-06-03|RXP-Capricorn|"termsAcceptedOn must be a valid ISO 8601 date string" error when attempting to make a payment.
DEV-298296|Bug|P2|Done|2026-06-03|HB-B2B|Insurance non-compliance fee not auto reversed
DEV-298268|Bug|P2|Closed|2026-06-03|HB-Deposit Alternative|Deposit Alternative - Charge Amount Incorrect
DEV-298190|Bug|P2|Closed|2026-06-03|HB-Deposit Alternative|HBG- Charge Code Groups
DEV-297584|Bug|P2|Dev - In Development|2026-06-02|HB-B2C|Renters Insurance: Policies remain Enrolled after successful payment instead of transitioning to Active
DEV-297583|Bug|P2|Done|2026-06-02|HB-B2C|[Data Fix] Policies stuck in enrolled status — RTH12045122, 92598446
DEV-297184|Bug|P2|Closed|2026-06-01|HB-B2B|[datafix] Investigate non-compliance fee discrepancies for Park7 residents (MP is charging post cancellation)
DEV-297182|Tech|P2|Dev - In Development|2026-06-01|HB-B2B|[datafix] Refund Gap Fee not refunding full amount
DEV-297177|Bug|P2|Done|2026-06-01|HB-B2B|Non-Compliance Fee Billed Twice After Move Out
DEV-296812|Bug|P2|Done|2026-05-29|RXP-Capricorn|Homebody Payments
DEV-296720|Bug|P2|Done|2026-05-28|RXP-Capricorn|[Greystar issue] Homebody links resident to wrong property when they have leases at multiple properties (routes rent payment to wrong location)
DEV-296608|Bug|P2|Closed|2026-05-28|HB-Deposit Alternative|Double Charged for Deposit Alternative
DEV-296599|Bug|P2|Closed|2026-05-28|HB-Deposit Alternative|Issue with Deposit Alternative Enrollment Charges - Element at East North, Uptown, and TR
DEV-296556|Tech|P2|Done|2026-05-28|HB-Deposit Alternative|Update env variables and Charges should add, deleted right after option selected on HBGUI and RP
DEV-296311|Bug|P2|Closed|2026-05-27|HB-B2C|Diagnostic : Get payment time-out policies from the last 30 days - ID: 2905 failed ( N Virginia )
DEV-296309|Bug|P2|Done|2026-05-27|HB-B2B|[Datafix] Content Optional Master Policy renewals only charge Master Policy Rate fee — missing content coverage rate + tax
DEV-296296|Bug|P2|Closed|2026-05-27|HB-B2B|[codefix] Content Optional Master Policy renewals only charge Master Policy Rate fee — missing content coverage rate + tax
DEV-296246|Tech|P2|Done|2026-05-27|HB-Deposit Alternative|DA: Renewal recovery datafix — cancel old policy when creating renewal
DEV-296045|Bug|P2|Closed|2026-05-27|HB-Deposit Alternative|CLONE - HBG: Continue cancel flow if scheduled charges are deleted/cancelled already
DEV-296037|Bug|P2|Closed|2026-05-27|HB-Deposit Alternative|HBG: Price recalculation is not removing posted charges for initial HBG charges with DEV inputs
DEV-295511|Bug|P2|Closed|2026-05-25|HB-Deposit Alternative|HBG: Continue cancel flow if scheduled charges are deleted/cancelled already
DEV-294731|Bug|P2|Done|2026-05-22|HB-Deposit Alternative|DA: Orphaned DI scheduled charge blocks "Switch to Deposit Alternative" re-enrollment
DEV-294619|Bug|P2|Closed|2026-05-22|HB-Deposit Alternative|DA-ENHANCED FEE
DEV-294586|Bug|P2|Done|2026-05-22|RXP-Capricorn|Greystar: Refund account show/hide logic error
DEV-294387|Bug|P2|Closed|2026-05-21|RXP-Capricorn|Canyon View Payment Issue
DEV-294295|Task|P2|Not Started|2026-05-21|RXP-Capricorn-Mobile|Integrate Ads in Payment Processing Screen and Thanks Payment Screen
DEV-294288|Task|P2|Not Started|2026-05-21|RXP-Capricorn-Mobile|Design the payment processing screen without ad shelf — activity indicator only
DEV-294115|Task|P2|Resolved|2026-05-21|HB-B2B|Data fix for content optional policies to get the export corrected
DEV-294114|Task|P2|Not Started|2026-05-21|HB-B2B|Fix the client rate setup and export premium rate calculation issues for content optional
DEV-294050|Tech|P2|Closed|2026-05-21|HB-B2C|Spike: Analyze how to get the saved payments in hbComponent
DEV-293847|Tech|P2|Done|2026-05-20|HB-B2B|MP: Reverse all charges created from May 6th 2026 datafix script
DEV-293541|Task|P2|Resolved|2026-05-20|HB-B2C|Replace Amex Banners on Insurance/Payment Pages with New Warmly Welcomed Dark Blue Assets
DEV-293451|Bug|P2|Done|2026-05-19|RXP-Capricorn-Mobile|Submit Payment Button Disabled for $0 Balance Prepayments When Homebody Rewards Auto-Selected
DEV-293379|Bug|P2|Closed|2026-05-19|HB-B2C|Diagnostic : Get payment time-out policies from the last 30 days - ID: 2905 failed ( N Virginia )
DEV-292911|Tech|P1|Done|2026-05-18|HB-Deposit Alternative|HBG: Create new HBG scheduled charge for charge codes (same as L2E process)
DEV-292837|Bug|P2|Done|2026-05-18|HB-B2B|Master policy charged after lease end date.
DEV-292774|Bug|P2|Closed|2026-05-18|HB-Deposit Alternative|Deposit Alternative Charges
DEV-292444|Bug|P2|Closed|2026-05-15|HB-B2C|Diagnostic : Incorrect premium amount - ID: 1185 failed ( N Virginia )
DEV-292328|Bug|P2|Done|2026-05-15|HB-Deposit Alternative|DA- Charge Code - Deposit Alternative Error
DEV-292252|Bug|P2|Closed|2026-05-14|HB-B2C|Diagnostic : IP Poston dates from failed payment section. - ID: 2872 failed ( N Virginia )
DEV-291891|Bug|P2|Done|2026-05-13|HB-B2B|[codefix] Master Policy: Premium does not reflect Personal Contents Coverage selection
DEV-291888|Bug|P2|Done|2026-05-13|HB-B2B|Master Policy billing export generating cancellation charges on terminated/expired policies
DEV-291789|Bug|P2|Closed|2026-05-13|HB-B2B|Data fix: Correct MP coverage start date for property 951960 (should be 5/9/2026)
DEV-291298|Tech|P2|Done|2026-05-12|HB-Deposit Alternative|DA: Do not allow null values (monthly_client_fee, leap_fee)
DEV-291101|Tech|P2|Closed|2026-05-12|HB-Deposit Alternative|Cross-Functional Task: DA Charge Removal in Unit Transfer Process
DEV-290843|Bug|P2|Done|2026-05-11|HB-B2B|Prorated Non-Insured Fees
DEV-290838|Task|P2|Closed|2026-05-11|HBS-Web|Fully Deactivate Homebody Rewards & Exclude Property from Points Bank Billing
DEV-290644|Tech|P2|Done|2026-05-11|HB-B2B|Data fix changes to be considered for billing prior to execution
DEV-290041|Bug|P2|Closed|2026-05-08|HB-Deposit Alternative|DA Double Charge on Resident Ledger
DEV-289929|Bug|P2|Closed|2026-05-07|HB-B2C|Diagnostic : Insurance policy premium amount is NULL or 0 - ID: 1313 failed ( N Virginia )
DEV-289909|Task|P2|Closed|2026-05-07|HBS-Web|Amenify 2.0: Welcome / Move-In Email with $50 Credit Messaging
DEV-289905|Task|P2|Closed|2026-05-07|HBS-Web|Amenify 2.0: Monthly Push Notifications for Recurring Credit Reminder
DEV-289338|Tech|P1|Done|2026-05-06|HB-B2C|RI: Datafix restore property settings wiped during key 7794 edit events
DEV-289240|Vulnerability|P2|Closed|2026-05-06|HB-B2C|CRIServiceHandler::getCustomersSavedPaymentMethods cross-tenant payment data read
DEV-289237|Vulnerability|P2|Closed|2026-05-06|HB-B2C|CRIAdminServiceHandler::getPaymentInfo returns full PAN + ACH routing for arbitrary accountIds (no tenant fence)
DEV-288688|Task|P2|Closed|2026-05-05|HBS-App|Scoping: HB App: ResidentInsure: Plaid ACH
DEV-288617|Bug|P2|Closed|2026-05-05|HB-B2B|Master Policy deactivation logic for month-to-month leases [datafix]
DEV-288379|Tech|P2|Done|2026-05-05|HBS-App|iOS: Fix branding feature image overflows payment widget layout
DEV-288340|Task|P2|Closed|2026-05-04|RXP-Capricorn-Mobile|Scoping: HB App: Payment Processing Screen — Rent Payment — ads/offers
DEV-288101|Bug|P2|Closed|2026-05-04|HB-Deposit Alternative|INT2 bug - Could not locate Deposit Alternative radio button & Side tab under ledger(due to missing radio button to select option)
DEV-287952|Tech|P2|Done|2026-05-04|HB-Deposit Alternative|HBG: Remove start with lease flag for HBG charge, update charge start based on confirmation call
DEV-287948|Bug|P2|Closed|2026-05-04|HB-Deposit Alternative|HBG: Price recalculation is not removing posted charges for initial HBG charges
DEV-287711|Tech|P2|Closed|2026-05-01|HB-Deposit Alternative|[Cardinal HBG] E2E migration: duplicate resident charges from legacy charge migration
DEV-287560|Bug|P2|Done|2026-05-01|HB-Deposit Alternative|[Datafix] Homebody Guaranty — Leap-to-Entrata migration: incorrect recurring charges on renewal lease
DEV-287227|Bug|P2|Closed|2026-04-30|RXP-Capricorn-Mobile|[HB Mobile] "Get Credit for Paying Rent on Time" Section Missing in Mobile Apps (iOS & Android)
DEV-287213|Bug|P2|Done|2026-04-30|HBS-Web|[HB Web] "Enroll Today" CTA for Rent Credit Reporting Fails Everytime
DEV-286964|Tech|P2|New|2026-04-29|HB-Deposit Alternative|Restrict Homebody insurance charge codes from being migrated for scheduled charges
DEV-286963|Tech|P2|Closed|2026-04-29|HB-Deposit Alternative|HBG: Datafix Remove ledger charges and duplicate scheduled charge for E2E
DEV-286950|Bug|P1|Done|2026-04-29|HB-Deposit Alternative|HBG: L2E blocking/error when scheduled charge is = to policy premium
DEV-286947|Bug|P2|Closed|2026-04-29|HB-B2B|Refund Master Policy Gap Fees to Resident
DEV-286935|Bug|P2|Closed|2026-04-29|HB-Deposit Alternative|DA Charges not posting
DEV-286241|Tech|P2|New|2026-04-27|HB-Deposit Alternative|HBG: on policy cancellation reverse future charges
DEV-286132|Bug|P2|Closed|2026-04-27|HB-Deposit Alternative|DepAlt Account Charged after policy cancellation
DEV-285890|Tech|P2|Done|2026-04-27|HB-Deposit Alternative|HBG : Data fix for the policies for which schedule charge amount is not correct due to rent charge
DEV-284823|Bug|P2|Closed|2026-04-23|HB-B2C|Diagnostic : IP Poston dates from failed payment section. - ID: 2872 failed ( N Virginia )
DEV-284685|Task|P2|Closed|2026-04-23|RXP-Capricorn|Remove caching for getBalance, Ledger and getAvailablePaymentTypes api's
DEV-284619|Tech|P2|Done|2026-04-23|HB-Deposit Alternative|HBG - Identify mismatch in pricing in policy table and scheduled charges
DEV-284155|Tech|P2|Closed|2026-04-22|HB-B2C|Display a negative amount in the payment history on HB1.0 Web when payment returned from CA
DEV-283755|Bug|P2|Closed|2026-04-21|HB-Deposit Alternative|Issue with Deposit Alternative Charges for Former Residents
DEV-283670|Bug|P2|Closed|2026-04-21|HB-Deposit Alternative|Revert Ar transactions created by datafix task on 17/04/2026
DEV-283607|Tech|P2|New|2026-04-20|HB-Deposit Alternative|DA: Active policy with no monthly renewal charge alert
DEV-283202|Tech|P2|Closed|2026-04-20|HB-Deposit Alternative|Redshift access for DA and HBG team to verify LEAP Billing discrepancy
DEV-282844|Bug|P2|Done|2026-04-16|HB-Deposit Alternative|HBG scheduled charge amount mismatches issued policy premium
DEV-282422|Tech|P2|Done|2026-04-15|HB-Deposit Alternative|DA: DataFix refund premiums billed after property termination date
DEV-282296|Bug|P2|Closed|2026-04-15|HB-B2C|MSI Renters Insurance - Payment Reminder Emails Not Being Triggered
DEV-281825|Bug|P2|Done|2026-04-14|HB-B2B|Force place coverage not ended and missing premium charge for IDM 14481665
DEV-281790|Task|P2|Closed|2026-04-14|RXP-Capricorn|SPIKE: Look into the responses for ledger current and this new api
DEV-281581|Tech|P2|Done|2026-04-13|HB-Deposit Alternative|DA: Datafix - Correct ide records where policy_premium and ide breakdown amounts do not match
DEV-280973|Task|P2|Closed|2026-04-12|RXP-Capricorn-Mobile|Scoping: Event and Amenties Payments
DEV-280926|Task|P2|Not Started|2026-04-12|HB-Deposit Alternative|DA: Data fix — backfill missing policy fee fields from March audit (null client fee with Leap fee present)
DEV-280856|Bug|P2|Closed|2026-04-12|HB-Deposit Alternative|DA: Policy enrollment pricing differs from pricing table and Leap invoiced amount
DEV-280750|Bug|P2|Done|2026-04-11|HB-B2C|policy_management/add_payment_info_Call to a member function setAccountCreatedOn() on array
DEV-280725|Bug|P2|Done|2026-04-10|HB-Deposit Alternative|DA: Carrier policy-issue API returns null; policy binds at Leap but Entrata has no active policy, billing, or resident charges
DEV-280696|Bug|P2|Closed|2026-04-10|HB-B2B|Duplicate Master Policy Charges
DEV-280586|Task|P1|Not Started|2026-04-10|HB-Deposit Alternative|Sev3: Deposit Alternative — $495K Leap Invoice Gap + DA Policy Record Failures
DEV-280416|Tech|P2|Done|2026-04-10|HB-B2B|Datafix - In Lease Master Policy is enrolling residents with a MP start date prior to lease start date
DEV-280279|Tech|P2|Done|2026-04-10|HB-Deposit Alternative|HBG: Pre-move-in reversal of charges is not working in case of screening
DEV-280170|Bug|P2|Done|2026-04-09|RXP-Capricorn|Greystar Homebody App — MoneyGram getMoneygramAccount API returns 503, blocks payment screen loading
DEV-280091|Task|P2|Not Started|2026-04-09|HB-B2B|Update Master Policy prorate setting to "Prorate First Month by Day"
DEV-279196|Task|P2|Closed|2026-04-07|HB-B2B|Investigate timing of move-out and LLIP charge reversal at move-out (Trinity)
DEV-278368|Bug|P2|Done|2026-04-06|HB-B2C|Undefined array key "paymentAccountId"
```

*Note: the inventory above lists every ticket returned by the scan in reverse-chronological order. Four low-signal rows from the paginated pull (RXP-Capricorn Checklist epics misfiled as duplicates, HBS-App/Web items with no money movement) were retained for completeness where they matched the query. Timestamps truncated to dates.*
