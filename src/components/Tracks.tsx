import { useEffect, useState } from "react"
import type { Area, Metric, Track } from "../types"
import { actions, areas, armForArea, clientById, clients, coordinatorLabel, decisions, isPastDue, model, offeringById, ownerUnconfirmed, pageById, tracks, tracksMeta } from "../data"
import { pageRoute, type Route } from "../routes"
import { Owner, StatusPill, TrackNumber, Updates } from "./ui"
import { armTone, surfaceTone } from "./surface"

/** Key-number tiles at the top of Tracks. Off for the rollout; see the note in Tracks(). */
const SHOW_KEY_NUMBERS = false

export function Tracks({ navigate, focusTrack }: { navigate: (r: Route) => void; focusTrack?: number }) {
  useEffect(() => {
    if (focusTrack != null) {
      requestAnimationFrame(() => document.getElementById(`track-${focusTrack}`)?.scrollIntoView({ behavior: "smooth", block: "center" }))
    }
  }, [focusTrack])

  const needOwner = tracks.filter((t) => ownerUnconfirmed(t.owner) && t.status !== "complete")
  const pastDue = tracks.filter((t) => isPastDue(t.due, t.status))
  const undated = tracks.filter((t) => !t.due && t.status !== "complete")
  const burning = clients.filter((c) => c.heat === "burning").length

  // Key-number tiles (Residents logged in, Active resident rate, Resident revenue per door, Burning client threads).
  // Hidden 2026-10-15 while the room rolls out and people start committing updates; not yet sure these are the
  // numbers that drive the behavior we want. Flip SHOW_KEY_NUMBERS to bring them back; data still lives in
  // areas.json programMetrics.
  const keyNumbers: Metric[] = [...model.programMetrics, { label: "Burning client threads", value: String(burning), source: "clients.json" }]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Homebody War Room</h2>
        <p className="mt-2 text-sm leading-6 text-[#474747]">
          {model.text.split(" Full reference")[0]}{" "}
          <button type="button" onClick={() => navigate({ tab: "model" })} className="font-semibold text-[#004B37] underline underline-offset-2">
            See the model →
          </button>
        </p>
      </div>

      {SHOW_KEY_NUMBERS ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {keyNumbers.map((m) => <KeyNumber key={m.label} m={m} />)}
        </div>
      ) : null}

      {(needOwner.length > 0 || pastDue.length > 0 || undated.length > 0) && (
        <div className="flex flex-wrap gap-2 text-[11px]">
          {needOwner.length > 0 ? (
            <span className="rounded-md border border-[#F2DEA3] bg-[#FFF3D1] px-2 py-1 text-[#8A6B00]">
              {needOwner.length} track{needOwner.length === 1 ? "" : "s"} need{needOwner.length === 1 ? "s" : ""} a named owner
            </span>
          ) : null}
          {pastDue.length > 0 ? (
            <span className="rounded-md border border-[#FFCCD5] bg-[#FFF2F4] px-2 py-1 text-[#8A2E28]">
              {pastDue.length} due date{pastDue.length === 1 ? "" : "s"} passed without an update
            </span>
          ) : null}
          {undated.length > 0 ? (
            <span className="rounded-md border border-[#E0E0E0] bg-white px-2 py-1 text-[#474747]">
              {undated.length} track{undated.length === 1 ? "" : "s"} with no date
            </span>
          ) : null}
          <span className="px-1 py-1 text-[#B8B8B8]">
            {tracksMeta.sourceNote} Slate as of {tracksMeta.asOf}.
          </span>
        </div>
      )}

      {areas.map((area, i) => {
        // Surfaces carry live work only. Completed tracks keep their record in the Completed tracks
        // section at the bottom of the page, so the board reads as "what we're working on".
        const areaTracks = tracks.filter((t) => t.area === area.id && t.status !== "complete")
        const areaDone = tracks.filter((t) => t.area === area.id && t.status === "complete").length
        const arm = armForArea(area.id)
        const firstOfArm = arm != null && areas.findIndex((a) => armForArea(a.id)?.id === arm.id) === i
        return [
          firstOfArm && arm ? (
            <div key={`arm-${arm.id}`} className="flex items-center gap-3 pt-2">
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${armTone(arm.id).solid}`}>{arm.name}</span>
              <span className="text-[11px] text-[#7A7A7A]">
                {arm.question} <span className="text-[#B8B8B8]">·</span> {arm.owns.split(". ")[0]}.
              </span>
              <span className="h-px flex-1 bg-[#E0E0E0]" />
              <button type="button" onClick={() => navigate({ tab: "model" })} className="text-[10px] text-[#7A7A7A] underline underline-offset-2 hover:text-[#161616]">
                the model
              </button>
            </div>
          ) : null,
          <section key={area.id} id={`area-${area.id}`} className={`space-y-3 rounded-2xl border-l-4 ${surfaceTone(area.id).border} ${surfaceTone(area.id).soft} p-4`}>
            <AreaRow area={area} count={areaTracks.length} doneCount={areaDone} navigate={navigate} />
            {areaTracks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#CCCCCC] bg-[#F7F7F7] px-4 py-3 text-xs text-[#474747]">
                {areaDone > 0 ? (
                  <>
                    <span className="font-semibold text-[#161616]">No live track.</span> {areaDone} completed — see Completed tracks below.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-[#161616]">No track yet.</span> Claim one in <code className="text-[#004B37]">src/data/tracks.json</code> with{" "}
                    <code className="text-[#004B37]">"area": "{area.id}"</code>.
                  </>
                )}
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {areaTracks.map((t) => (
                  <TrackCard key={t.id} track={t} navigate={navigate} highlighted={focusTrack === t.number} />
                ))}
              </div>
            )}
          </section>,
        ]
      })}

      <CompletedTracks navigate={navigate} focusTrack={focusTrack} />

      <ActionItems navigate={navigate} />
    </div>
  )
}

/**
 * Retired outcomes the room has shipped. Collapsed by default so the board above reads as live work only;
 * the record (updates, owner, measure) stays one click away. Deep links to a completed track open it.
 */
function CompletedTracks({ navigate, focusTrack }: { navigate: (r: Route) => void; focusTrack?: number }) {
  const done = tracks.filter((t) => t.status === "complete")
  const [open, setOpen] = useState(() => focusTrack != null && done.some((t) => t.number === focusTrack))
  if (done.length === 0) return null
  return (
    <section className="rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] px-4 py-3">
      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full flex-wrap items-center gap-2 text-left">
        <h3 className="text-sm font-semibold text-[#474747]">Completed tracks</h3>
        <span className="rounded-full bg-[#E0E0E0] px-1.5 py-0.5 text-[9px] font-semibold text-[#474747]">{done.length}</span>
        <span className="text-[10px] text-[#7A7A7A]">Outcomes the room has shipped. The record stays; it just stays off the live board.</span>
        <span className="ml-auto shrink-0 text-[10px] text-[#7A7A7A] underline underline-offset-2">{open ? "hide ▴" : "show ▾"}</span>
      </button>
      {open ? (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {done.map((t) => (
            <TrackCard key={t.id} track={t} navigate={navigate} highlighted={focusTrack === t.number} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function KeyNumber({ m }: { m: Metric }) {
  const missing = m.value === null || m.value === undefined
  return (
    <div className={`rounded-xl border px-3 py-3 text-center ${missing ? "border-dashed border-[#CCCCCC] bg-[#F7F7F7]" : "border-[#E0E0E0] bg-white"}`} title={m.source}>
      <p className={`text-2xl font-bold leading-tight ${missing ? "text-[#B8B8B8]" : "text-[#161616]"}`}>{missing ? "—" : m.value}</p>
      <p className="text-[10px] text-[#7A7A7A]">{m.label}</p>
      {missing ? <p className="text-[10px] text-[#8A6B00]">needs: {m.needs ?? "owner"}</p> : m.target ? <p className="text-[10px] text-[#7A7A7A]">target {m.target}</p> : null}
    </div>
  )
}

function AreaRow({ area, count, doneCount, navigate }: { area: Area; count: number; doneCount: number; navigate: (r: Route) => void }) {
  const tone = surfaceTone(area.id)
  return (
    <div className={`flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b pb-2 ${tone.border} border-opacity-30`}>
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${tone.solid}`}>{area.title}</span>
        <h3 className="text-sm font-semibold">{area.subtitle}</h3>
        <span className="text-[11px] text-[#7A7A7A]">{area.tagline}</span>
        <button type="button" onClick={() => navigate({ tab: "model" })} className="text-[10px] text-[#7A7A7A] underline underline-offset-2 hover:text-[#161616]">
          why
        </button>
      </div>
      <div className="flex items-center gap-3 text-[11px]">
        <Owner name={area.owner} prefix={`${coordinatorLabel(area.id)}:`} />
        <span className="text-[#B8B8B8]">·</span>
        <span className="text-[#7A7A7A]">
          {count} track{count === 1 ? "" : "s"}
          {doneCount > 0 ? ` · ${doneCount} done` : ""}
        </span>
      </div>
    </div>
  )
}

function TrackCard({ track, navigate, highlighted }: { track: Track; navigate: (r: Route) => void; highlighted: boolean }) {
  const [showUpdates, setShowUpdates] = useState(false)
  const page = pageById(track.page)
  const dest = pageRoute(track.page)
  const pastDue = isPastDue(track.due, track.status)
  const linkedClients = track.clients.map(clientById).filter((c): c is NonNullable<typeof c> => !!c)
  const burning = track.heat === "burning"
  const complete = track.status === "complete"
  const tone = surfaceTone(track.area)

  return (
    <div
      id={`track-${track.number}`}
      style={{ borderTopColor: tone.hex }}
      role={dest ? "link" : undefined}
      tabIndex={dest ? 0 : undefined}
      onClick={() => dest && navigate(dest)}
      onKeyDown={(e) => {
        if (dest && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault()
          navigate(dest)
        }
      }}
      className={`scroll-mt-32 rounded-xl border border-t-4 bg-white px-4 pb-3 pt-3 transition-all ${
        highlighted ? `${tone.border} shadow-md` : burning && !complete ? "border-x-[#FFCCD5] border-b-[#FFCCD5]" : "border-x-[#E0E0E0] border-b-[#E0E0E0]"
      } ${complete && !highlighted ? "opacity-60 hover:opacity-100" : ""} ${dest ? "cursor-pointer hover:shadow-sm" : ""}`}
    >
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <TrackNumber n={track.number} />
        <h4 className="min-w-0 flex-1 text-[12px] font-semibold leading-snug">{track.outcome}</h4>
        {page ? (
          <span className="shrink-0 rounded border border-[#E0E0E0] px-1.5 py-0.5 text-[9px] font-medium text-[#7A7A7A]">{page.title} →</span>
        ) : (
          <span className="shrink-0 rounded border border-dashed border-[#CCCCCC] px-1.5 py-0.5 text-[9px] font-medium text-[#B8B8B8]">no page yet</span>
        )}
      </div>
      <p className="mb-1.5 text-[10px] leading-relaxed text-[#7A7A7A]">{track.summary}</p>
      <p className="mb-2 text-[10px] leading-relaxed text-[#474747]">
        <span className="font-semibold text-[#161616]">Next:</span> {track.nextStep}
      </p>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 text-[11px]">
          <Owner name={track.owner} />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <StatusPill status={track.status} />
          {track.note ? (
            <span
              className={`max-w-full whitespace-normal rounded-sm border px-1.5 py-0.5 text-left text-[9px] font-semibold ${
                track.noteTone === "alert" ? "border-[#FFCCD5] bg-[#FFF2F4] text-[#8A2E28]" : "border-[#F2DEA3] bg-[#FFF3D1] text-[#8A6B00]"
              }`}
            >
              {track.note}
            </span>
          ) : null}
          {track.due ? (
            <span className={`rounded-sm border px-1.5 py-0.5 text-[9px] font-semibold ${pastDue ? "border-[#F5B5B5] bg-[#FFF5F5] text-[#B42318]" : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF]"}`}>
              {pastDue ? `Due ${track.due} · passed` : `Due ${track.due}`}
            </span>
          ) : track.status !== "complete" ? (
            <span className="rounded-sm border border-[#F5B5B5] bg-[#FFF5F5] px-1.5 py-0.5 text-[9px] font-semibold text-[#B42318]">Date needed</span>
          ) : null}
        </div>
      </div>

      {(linkedClients.length > 0 || track.offerings.length > 0 || track.updates.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-[#F2F2F2] pt-2 text-[10px]">
          {track.offerings.map((id) => {
            const p = offeringById(id)
            return p ? (
              <span key={id} className="rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-2 py-0.5 text-[#474747]">
                {p.name}
              </span>
            ) : null
          })}
          {linkedClients.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                navigate({ tab: "clients", client: c.id })
              }}
              className={`rounded-full border px-2 py-0.5 font-medium hover:bg-[#EAF1EE] ${c.heat === "burning" ? "border-[#FFCCD5] bg-[#FFF2F4] text-[#8A2E28]" : "border-[#E0E0E0] bg-white text-[#004B37]"}`}
            >
              {c.name}
            </button>
          ))}
          {track.updates.length > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowUpdates((v) => !v)
              }}
              className="ml-auto text-[#7A7A7A] underline underline-offset-2 hover:text-[#161616]"
            >
              {track.updates.length} update{track.updates.length === 1 ? "" : "s"} {showUpdates ? "▴" : "▾"}
            </button>
          ) : null}
        </div>
      )}
      {showUpdates ? (
        <div onClick={(e) => e.stopPropagation()} className="mt-1">
          <Updates updates={track.updates} />
        </div>
      ) : null}
    </div>
  )
}

type Row = {
  id: string
  kind: "action" | "decision"
  title: string
  detail?: string
  owner: string | null
  track: number | null
  date: string
  due: string | null
  done: boolean
  source?: string
}

function ActionItems({ navigate }: { navigate: (r: Route) => void }) {
  const rows: Row[] = [
    ...actions.map<Row>((a) => ({ id: a.id, kind: "action", title: a.item, owner: a.owner, track: a.track, date: a.date, due: a.due, done: a.status !== "open" })),
    ...decisions.map<Row>((d) => ({ id: d.id, kind: "decision", title: d.title, detail: d.detail, owner: d.owner, track: d.track ?? null, date: d.date, due: d.due ?? null, done: d.status === "decided", source: d.source })),
  ]
  const open = rows.filter((r) => !r.done).sort((a, b) => Number(!!b.due) - Number(!!a.due) || (a.due ?? "").localeCompare(b.due ?? ""))
  const done = rows.filter((r) => r.done).sort((a, b) => b.date.localeCompare(a.date))
  const openDecisions = open.filter((r) => r.kind === "decision").length
  return (
    <div className="rounded-xl border border-[#E0E0E0] bg-white px-4 pb-2 pt-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Open action items</h3>
          <span className="rounded-full bg-[#F2DEA3] px-1.5 py-0.5 text-[9px] font-semibold text-[#8A6B00]">{open.length} open</span>
          {openDecisions > 0 ? <span className="rounded-full bg-[#FFCCD5] px-1.5 py-0.5 text-[9px] font-semibold text-[#161616]">{openDecisions} need a decision</span> : null}
        </div>
        <p className="text-[10px] text-[#7A7A7A]">Cross-track tasks, data gaps, and decisions the room owes. One owner each. Edit src/data/actions.json or src/data/decisions.json.</p>
      </div>
      <div>
        {[...open, ...done].map((r) => (
          <ActionRow key={`${r.kind}-${r.id}`} r={r} navigate={navigate} />
        ))}
      </div>
    </div>
  )
}

function ActionRow({ r, navigate }: { r: Row; navigate: (r: Route) => void }) {
  const track = r.track != null ? tracks.find((t) => t.number === r.track) : undefined
  const dest = track ? pageRoute(track.page) : null
  const late = !r.done && isPastDue(r.due, "open")
  return (
    <div
      onClick={() => dest && navigate(dest)}
      className={`flex items-start gap-3 border-b border-[#F2F2F2] py-2.5 last:border-0 ${r.done ? "opacity-50" : ""} ${dest ? "cursor-pointer hover:bg-[#F7F7F7]" : ""}`}
    >
      <span
        className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${r.done ? "border-[#004B37] bg-[#004B37]" : late ? "border-[#B42318]" : r.owner && !ownerUnconfirmed(r.owner) ? "border-[#B8B8B8]" : "border-[#8A6B00]"}`}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {r.kind === "decision" ? (
            <span className={`rounded-sm border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide ${r.done ? "border-[#E0E0E0] text-[#7A7A7A]" : "border-[#FFCCD5] bg-[#FFF2F4] text-[#8A2E28]"}`}>
              {r.done ? "Decided" : "Decision"}
            </span>
          ) : null}
          <span className={`text-[12px] font-medium ${r.done ? "line-through" : ""}`}>{r.title}</span>
          {r.track != null ? <span className="text-[9px] text-[#7A7A7A]">Track #{r.track}</span> : null}
          {dest && track ? <span className="ml-auto shrink-0 text-[9px] text-[#004B37]">{pageById(track.page)?.title} →</span> : null}
        </div>
        {r.detail ? <p className="mt-0.5 text-[10px] leading-relaxed text-[#7A7A7A]">{r.detail}</p> : null}
        <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px]">
          <Owner name={r.owner} prefix={r.kind === "decision" ? "Decides:" : undefined} />
          <span className="text-[#B8B8B8]">{r.date}</span>
          {r.source ? <span className="text-[#B8B8B8]">· {r.source}</span> : null}
          {r.due && !r.done ? (
            <span className={`rounded-sm border px-1.5 py-0.5 text-[9px] font-semibold ${late ? "border-[#F5B5B5] bg-[#FFF5F5] text-[#B42318]" : "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF]"}`}>
              {late ? `Due ${r.due} · passed` : `Due ${r.due}`}
            </span>
          ) : null}
          {!r.due && !r.done && r.kind === "decision" ? <span className="rounded-sm border border-[#F5B5B5] bg-[#FFF5F5] px-1.5 py-0.5 text-[9px] font-semibold text-[#B42318]">Date needed</span> : null}
        </div>
      </div>
    </div>
  )
}
