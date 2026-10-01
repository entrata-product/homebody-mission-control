import { useState } from "react"
import tracksFile from "./data/tracks.json"
import teamFile from "./data/team.json"
import decisionsFile from "./data/decisions.json"
import kpisFile from "./data/kpis.json"
import { Roadmap } from "./components/Roadmap"
import { StateOfTheUnion } from "./components/StateOfTheUnion"

type Heat = "burning" | "active" | "steady" | "idle"
type Status = "not_started" | "in_progress" | "blocked" | "complete"
type NoteTone = "neutral" | "alert"

type Update = { date: string; text: string; source: string }

type Workstream = {
  id: string
  title: string
  owners: string[]
  status: Status
  eta: string | null
  nextStep: string
}

type Track = {
  number: number
  id: string
  title: string
  owners: string[]
  description: string
  heat: Heat
  status: Status
  eta: string | null
  summary: string
  nextStep: string
  successMeasure?: string | null
  note?: string | null
  noteTone?: NoteTone | null
  workstreams?: Workstream[]
  updates: Update[]
}

type Decision = {
  date: string
  title: string
  detail: string
  owner: string
  source?: string
}

type RosterMember = {
  name: string
  seat: string
}

const tracks = (tracksFile.tracks as Track[]).slice().sort((a, b) => a.number - b.number)
const decisions = decisionsFile.decisions as Decision[]
const roster = teamFile.roster as RosterMember[]

const heatMeta: Record<Heat, { label: string; pill: string; card: string }> = {
  burning: {
    label: "Burning",
    pill: "bg-[#F6CFCB] text-[#000000]",
    card: "border-[#F6CFCB] bg-[#FFF8F7]",
  },
  active: {
    label: "Active",
    pill: "bg-[#BCF0C8] text-[#004B37]",
    card: "border-[#E5E7EB] bg-white",
  },
  steady: {
    label: "Steady",
    pill: "bg-[#F3F4F6] text-[#4A4A4A]",
    card: "border-[#E5E7EB] bg-white",
  },
  idle: {
    label: "Idle",
    pill: "bg-[#F3F4F6] text-[#737373]",
    card: "border-[#E5E7EB] bg-white",
  },
}

const statusLabel: Record<Status, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  complete: "Complete",
}

const statusPill: Record<Status, string> = {
  not_started: "bg-[#F3F4F6] text-[#737373]",
  in_progress: "bg-[#DBEAFE] text-[#1E40AF]",
  blocked: "bg-[#FEE2E2] text-[#991B1B]",
  complete: "bg-[#BCF0C8] text-[#004B37]",
}

type Tab = "briefing" | "tracks" | "decisions" | "roadmap" | "contribute"

export default function App() {
  const [tab, setTab] = useState<Tab>("briefing")
  const [openId, setOpenId] = useState<string | null>(tracks[0]?.id ?? null)

  const burning = tracks.filter((track) => track.heat === "burning")

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#000000]">
      <header className="sticky top-0 z-20 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "#004B37" }}
              aria-hidden="true"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#6FFB8C" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11 12 3l9 8" />
                <path d="M5 10v10h14V10" />
                <path d="M9 20v-6h6v6" />
              </svg>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-bold tracking-tight">
                Homebody
                <span className="font-medium text-[#737373]"> · War Room</span>
              </span>
              <span className="hidden h-4 w-px bg-[#E5E7EB] sm:block" />
              <span className="rounded-full bg-[#BCF0C8] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#004B37]">
                Homebody + HBG
              </span>
            </div>
          </div>
          <p className="hidden text-[11px] text-[#737373] sm:block">Slate as of {tracksFile.asOf}</p>
        </div>
        <div className="mx-auto max-w-[1100px] px-6 pb-3">
          <p className="text-[12px] text-[#4A4A4A]">
            <span className="font-semibold text-[#004B37]">Mission:</span> One surface for Homebody and Homebody Guaranty. HBG is a Homebody product. Every hot thread has an owner and a next step.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 py-6">
        <nav className="mb-6 flex flex-wrap gap-1 rounded-lg border border-[#E5E7EB] bg-white p-1" aria-label="Sections">
          {(
            [
              ["briefing", "Briefing"],
              ["tracks", "Tracks"],
              ["decisions", "Decisions"],
              ["roadmap", "Roadmap"],
              ["contribute", "How to update"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${
                tab === id ? "bg-[#004B37] text-white" : "text-[#737373] hover:bg-[#F3F4F6]"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {tab === "briefing" && (
          <div className="space-y-6">
            <StateOfTheUnion data={kpisFile} />

            <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
              <h2 className="text-sm font-semibold">Why this exists</h2>
              <p className="mt-2 text-sm leading-6 text-[#4A4A4A]">
                We are setting this up because of elevated client concerns going into and coming out of Summit. Homebody and Homebody Guaranty need one place where those concerns have an owner and a next step.
              </p>
              <p className="mt-3 text-sm leading-6 text-[#4A4A4A]">
                This is that surface. The standing huddle runs against it. If a track is not here, it is not in the war room.
              </p>
              <dl className="mt-4 grid gap-3 sm:grid-cols-3">
                <Fact label="Cadence" value="Twice weekly" />
                <Fact label="Scope" value="Homebody, including HBG" />
                <Fact label="Strategy sibling" value="Homebody Quarter Brief" />
              </dl>
            </section>

            <section>
              <h2 className="text-sm font-semibold">Burning now</h2>
              <p className="mt-1 text-xs text-[#737373]">{burning.length} tracks need a move this week. Open a card for the latest update.</p>
              <ul className="mt-3 space-y-2">
                {burning.map((track) => (
                  <li key={track.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setTab("tracks")
                        setOpenId(track.id)
                      }}
                      className="flex w-full items-start justify-between gap-4 rounded-lg border border-[#F6CFCB] bg-[#FFF8F7] px-4 py-3 text-left"
                    >
                      <span>
                        <span className="flex items-center gap-2">
                          <span className="rounded bg-[#004B37] px-1.5 py-0.5 text-[10px] font-bold text-white">#{track.number}</span>
                          <span className="text-sm font-semibold">{track.title}</span>
                        </span>
                        <span className="mt-1 block text-xs text-[#4A4A4A]">{track.nextStep}</span>
                      </span>
                      <span className="shrink-0 text-[11px] font-medium text-[#737373]">{track.owners.join(", ")}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-sm font-semibold">Who is in the room</h2>
              <p className="mt-1 text-xs text-[#737373]">
                Standing roster from Cal on {teamFile.asOf}. Sponsors: {teamFile.sponsors.map((person) => person.name).join(" and ")}.
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {roster.map((person) => (
                  <li
                    key={person.name}
                    title={person.seat}
                    className={`rounded-full border px-2.5 py-1 text-xs font-medium ${person.seat === "Standing" ? "border-[#BCF0C8] bg-[#F0FBF3] text-[#004B37]" : "border-[#FFE797] bg-[#FFFBEA] text-[#4A4A4A]"}`}
                  >
                    {person.name}
                    {person.seat !== "Standing" ? <span className="ml-1 text-[10px] text-[#737373]">({person.seat.toLowerCase()})</span> : null}
                  </li>
                ))}
              </ul>
              <ul className="mt-3 space-y-1">
                {teamFile.openSeats.map((seat) => (
                  <li key={seat} className="text-xs text-[#737373]">{seat}</li>
                ))}
              </ul>
            </section>
          </div>
        )}

        {tab === "tracks" && (
          <div>
            <div className="mb-4">
              <p className="text-xs text-[#737373]">{tracksFile.sourceNote}</p>
            </div>

            <ul className="space-y-3">
              {tracks.map((track) => {
                const open = openId === track.id
                const meta = heatMeta[track.heat]
                return (
                  <li key={track.id} className={`rounded-xl border ${meta.card}`}>
                    <button
                      type="button"
                      onClick={() => setOpenId(open ? null : track.id)}
                      className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left"
                      aria-expanded={open}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-[#004B37] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            #{track.number}
                          </span>
                          <span className="text-sm font-semibold">{track.title}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${meta.pill}`}>
                            {meta.label}
                          </span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusPill[track.status]}`}>
                            {statusLabel[track.status]}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-[#4A4A4A]">{track.summary}</span>
                      </span>
                      <span className="shrink-0 text-right text-[11px] text-[#737373]">
                        <span className="block font-medium text-[#000000]">{track.owners.join(", ")}</span>
                        {track.eta ? <span className="mt-1 block">ETA {track.eta}</span> : null}
                      </span>
                    </button>
                    {open && (
                      <div className="space-y-4 border-t border-[#E5E7EB] px-4 py-4">
                        {track.note && track.noteTone === "alert" ? (
                          <div className="rounded-lg border border-[#F6CFCB] bg-[#FFF8F7] px-3 py-2 text-xs text-[#000000]">
                            <span className="font-semibold text-[#B91C1C]">Alert · </span>
                            {track.note}
                          </div>
                        ) : track.note ? (
                          <div className="rounded-lg bg-[#F3F4F6] px-3 py-2 text-xs text-[#4A4A4A]">
                            {track.note}
                          </div>
                        ) : null}

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#737373]">Description</p>
                          <p className="mt-1 text-sm leading-6 text-[#000000]">{track.description}</p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#737373]">Next step</p>
                            <p className="mt-1 text-sm text-[#000000]">{track.nextStep}</p>
                          </div>
                          {track.successMeasure ? (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#737373]">Success measure</p>
                              <p className="mt-1 text-sm text-[#000000]">{track.successMeasure}</p>
                            </div>
                          ) : null}
                        </div>

                        {track.workstreams && track.workstreams.length > 0 ? (
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-[#737373]">
                              Workstreams ({track.workstreams.length})
                            </p>
                            <ul className="mt-2 divide-y divide-[#F3F4F6] rounded-lg border border-[#E5E7EB] bg-white">
                              {track.workstreams.map((workstream) => (
                                <li key={workstream.id} className="px-3 py-2">
                                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                                    <span className="text-sm font-semibold text-[#000000]">{workstream.title}</span>
                                    <span className="flex items-center gap-2 text-[11px] text-[#737373]">
                                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusPill[workstream.status]}`}>
                                        {statusLabel[workstream.status]}
                                      </span>
                                      {workstream.eta ? <span>ETA {workstream.eta}</span> : null}
                                    </span>
                                  </div>
                                  <p className="mt-1 text-xs text-[#4A4A4A]">{workstream.nextStep}</p>
                                  <p className="mt-1 text-[11px] text-[#737373]">Owner: {workstream.owners.join(", ")}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#737373]">
                            Updates ({track.updates.length})
                          </p>
                          <ol className="mt-2 space-y-2">
                            {track.updates.map((update, index) => (
                              <li key={`${track.id}-${update.date}-${index}`} className="text-xs leading-5 text-[#4A4A4A]">
                                <span className="font-semibold text-[#000000]">{update.date}</span>
                                {" · "}
                                {update.text}
                                <span className="text-[#737373]"> ({update.source})</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )}

        {tab === "decisions" && (
          <ol className="space-y-3">
            {decisions.map((decision) => (
              <li key={decision.title} className="rounded-xl border border-[#E5E7EB] bg-white px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-sm font-semibold">{decision.title}</h2>
                  <span className="text-[11px] text-[#737373]">{decision.date}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[#4A4A4A]">{decision.detail}</p>
                <p className="mt-2 text-xs text-[#737373]">
                  {decision.owner}
                  {decision.source ? ` · ${decision.source}` : ""}
                </p>
              </li>
            ))}
          </ol>
        )}

        {tab === "roadmap" && <Roadmap />}

        {tab === "contribute" && <Contribute />}
      </main>
    </div>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#FAFAFA] px-3 py-2">
      <dt className="text-[10px] font-semibold uppercase tracking-wide text-[#737373]">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value}</dd>
    </div>
  )
}

function Contribute() {
  return (
    <div className="space-y-4 text-sm leading-6 text-[#4A4A4A]">
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#000000]">Update your track</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Pull latest.</li>
          <li>Edit <code className="text-[#004B37]">src/data/tracks.json</code>. Change your summary, heat, ETA, next step, and add an update with the date and where it came from. If it&apos;s a workstream under an existing track, add or edit the entry under that track&apos;s <code className="text-[#004B37]">workstreams</code>.</li>
          <li>Commit with the track name in the message. Push to <code className="text-[#004B37]">main</code>.</li>
        </ol>
        <p className="mt-3 text-xs text-[#737373]">
          Or open Cursor in this repo and say: update my track to show [what changed]. ETA is [date]. Source is [Slack channel or meeting].
        </p>
      </section>
      <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#000000]">What belongs on a track</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>A number and a title. Program-level scope, not a single ticket.</li>
          <li>An owner. Ambiguous ownership does not count.</li>
          <li>A description of what the track is about at program level, and a success measure.</li>
          <li>A next step someone can do before the next huddle.</li>
          <li>The source of every update. A Slack channel, a ticket, or a meeting date.</li>
        </ul>
        <p className="mt-3">
          Leave resident names and resident IDs out of this repo. Name the client, the property, and the ticket.
        </p>
      </section>
    </div>
  )
}
