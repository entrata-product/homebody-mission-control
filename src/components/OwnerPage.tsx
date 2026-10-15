import type { ChecklistItem, OwnerPageData, PageSection } from "../types"
import { surfaceTone } from "./surface"
import { areaById, clients, isPastDue, pageOwner, roadmap, trackByNumber, tracks } from "../data"
import type { Route } from "../routes"
import { Clients } from "./Clients"
import { Label, Owner, StatusPill, TileCard, TrackNumber, Updates } from "./ui"

export function OwnerPage({ page, navigate }: { page: OwnerPageData; navigate: (r: Route) => void }) {
  const track = trackByNumber(page.track)
  // Other tracks that also point at this page (e.g. HBG transfers → HBG Renewals).
  const alsoHere = tracks.filter((t) => t.page === page.id && t.number !== page.track)
  const area = track ? areaById(track.area) : undefined
  const pastDue = track ? isPastDue(track.due, track.status) : false
  const tone = surfaceTone(area?.id)
  return (
    <div className="space-y-6">
      <section className={`flex flex-wrap items-start justify-between gap-4 rounded-2xl border-l-4 ${tone.border} ${tone.soft} p-4`}>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {track ? <TrackNumber n={track.number} onClick={() => navigate({ tab: "tracks", track: track.number })} /> : null}
            <h1 className="text-base font-semibold">{page.title}</h1>
            {track ? <StatusPill status={track.status} /> : null}
            {area ? (
              <button type="button" onClick={() => navigate({ tab: "model" })} className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${tone.solid} ${tone.solidHover}`} title="See the model">
                {area.title}
              </button>
            ) : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-[#474747]">{page.purpose}</p>
        </div>
        <div className="shrink-0 text-right text-[11px] text-[#7A7A7A]">
          <span className="block">
            <Owner name={pageOwner(page)} prefix="Owner:" />
          </span>
          <span className="mt-0.5 block text-[10px] text-[#B8B8B8]">{track ? `from track #${track.number}` : "no track linked"}</span>
          <span className="mt-1 block">Numbers as of {page.asOf}</span>
          <span className="mt-0.5 block">
            Edit <code className="text-[#004B37]">src/data/pages/{page.id}.json</code>
          </span>
        </div>
      </section>

      {track ? (
        <section className="rounded-xl border border-[#E0E0E0] bg-white px-4 py-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label>Deliverable</Label>
              <p className="mt-1 text-sm text-[#161616]">{track.deliverable}</p>
              <p className={`mt-1 text-[11px] ${pastDue ? "font-semibold text-[#B42318]" : "text-[#7A7A7A]"}`}>
                {track.due ? `Due ${track.due}${pastDue ? " · passed" : ""}` : track.status === "complete" ? "" : "Date needed"}
                {track.note ? <span className={track.noteTone === "alert" ? "text-[#8A2E28]" : "text-[#8A6B00]"}> · {track.note}</span> : null}
              </p>
            </div>
            <div>
              <Label>Measure of done</Label>
              <p className="mt-1 text-sm text-[#161616]">{track.measure ?? <span className="text-[#8A6B00]">needs a measure</span>}</p>
            </div>
            <div>
              <Label>Next step</Label>
              <p className="mt-1 text-sm text-[#161616]">{track.nextStep}</p>
            </div>
          </div>
          {alsoHere.length > 0 ? (
            <p className="mt-3 border-t border-[#F2F2F2] pt-2 text-[11px] text-[#7A7A7A]">
              Also on this page:{" "}
              {alsoHere.map((t) => (
                <button key={t.id} type="button" onClick={() => navigate({ tab: "tracks", track: t.number })} className="mr-2 text-[#004B37] underline underline-offset-2">
                  #{t.number} {t.deliverable}
                </button>
              ))}
            </p>
          ) : null}
        </section>
      ) : null}

      {page.sections.map((s, i) => (
        <Section key={i} section={s} page={page} navigate={navigate} />
      ))}

      {track && track.updates.length > 0 ? (
        <section>
          <h2 className="text-sm font-semibold">Track updates ({track.updates.length})</h2>
          <p className="text-[11px] text-[#7A7A7A]">Dated entries from src/data/tracks.json. Add one when the fact changes.</p>
          <Updates updates={track.updates} />
        </section>
      ) : null}
    </div>
  )
}

function Section({ section, page, navigate }: { section: PageSection; page: OwnerPageData; navigate: (r: Route) => void }) {
  switch (section.type) {
    case "stats": {
      const missing = section.tiles.filter((t) => !t.countdownTo && (t.value === null || t.value === undefined)).length
      return (
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">{section.title}</h2>
            {missing > 0 ? (
              <p className="text-[11px] text-[#8A6B00]">
                {missing} tile{missing === 1 ? "" : "s"} still need{missing === 1 ? "s" : ""} a number.
              </p>
            ) : null}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {section.tiles.map((t) => (
              <TileCard key={t.label} tile={t} />
            ))}
          </div>
        </section>
      )
    }
    case "table":
      return (
        <section>
          <h2 className="text-sm font-semibold">{section.title}</h2>
          <div className="mt-2 overflow-x-auto rounded-xl border border-[#E0E0E0] bg-white">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E0E0E0] text-[10px] uppercase tracking-wide text-[#7A7A7A]">
                  {section.headers.map((h) => (
                    <th key={h} className="px-3 py-2 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2F2F2]">
                {section.rows.map((row, i) => (
                  <tr key={i} className="align-top">
                    {row.map((cell, j) => (
                      <td key={j} className={`px-3 py-2 ${/^unconfirmed|to confirm|^needed/i.test(cell) ? "text-[#8A6B00]" : "text-[#161616]"}`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {section.note ? <p className="mt-1 text-[11px] text-[#7A7A7A]">{section.note}</p> : null}
        </section>
      )
    case "checklist": {
      const done = section.items.filter((i) => i.status === "done").length
      return (
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">{section.title}</h2>
            <p className="text-[11px] text-[#7A7A7A]">
              {done} of {section.items.length} done
            </p>
          </div>
          <ul className="mt-2 divide-y divide-[#F2F2F2] rounded-xl border border-[#E0E0E0] bg-white">
            {section.items.map((item, i) => (
              <ChecklistRow key={i} item={item} />
            ))}
          </ul>
        </section>
      )
    }
    case "text": {
      const cls =
        section.tone === "alert"
          ? "border-[#FFCCD5] bg-[#FFF2F4]"
          : section.tone === "needs"
            ? "border-dashed border-[#CCCCCC] bg-[#F7F7F7]"
            : "border-[#E0E0E0] bg-white"
      return (
        <section className={`rounded-xl border px-4 py-3 ${cls}`}>
          <h2 className="text-sm font-semibold">{section.title}</h2>
          <p className="mt-1 text-sm leading-6 text-[#474747]">{section.body}</p>
        </section>
      )
    }
    case "roadmap": {
      const items = roadmap.items.filter((it) => (section.keys ? section.keys.includes(it.keys) : section.lane ? it.lane === section.lane : false))
      if (items.length === 0) return null
      return (
        <section>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-sm font-semibold">{section.title}</h2>
            <p className="text-[11px] text-[#7A7A7A]">
              {items.length} item{items.length === 1 ? "" : "s"} · roadmap as of {roadmap.asOf} · edit src/data/roadmap.json
            </p>
          </div>
          <ul className="mt-2 divide-y divide-[#F2F2F2] rounded-xl border border-[#E0E0E0] bg-white">
            {items.map((it) => {
              const rel = roadmap.releases.find((r) => r.id === it.release)
              return (
                <li key={it.keys} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-2.5">
                  <span className="shrink-0 font-mono text-[10px] text-[#7A7A7A]">{it.keys}</span>
                  <span className="text-sm font-semibold">{it.title}</span>
                  <span className="text-xs text-[#474747]">{it.desc}</span>
                  <span className="ml-auto shrink-0 rounded-full bg-[#F2F2F2] px-2 py-0.5 text-[10px] font-semibold text-[#474747]">{rel?.label ?? it.release}</span>
                </li>
              )
            })}
          </ul>
        </section>
      )
    }
    case "clients": {
      const track = trackByNumber(page.track)
      const ids = clients.filter((c) => (track ? c.tracks.includes(track.number) || track.clients.includes(c.id) : false)).map((c) => c.id)
      if (ids.length === 0) return null
      return (
        <section>
          <h2 className="text-sm font-semibold">{section.title}</h2>
          <p className="mb-2 text-[11px] text-[#7A7A7A]">Rows come from the Clients board. Edit src/data/clients.json.</p>
          <Clients navigate={navigate} filterIds={ids} embedded />
        </section>
      )
    }
    case "links":
      return (
        <section>
          <h2 className="text-sm font-semibold">{section.title}</h2>
          <ul className="mt-2 flex flex-wrap gap-2">
            {section.items.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="rounded-md border border-[#E0E0E0] bg-white px-2.5 py-1 text-xs font-medium text-[#004B37] underline-offset-2 hover:underline">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )
  }
}

const checkTone: Record<ChecklistItem["status"], { mark: string; cls: string }> = {
  done: { mark: "✓", cls: "bg-[#E0E0E0] text-[#474747]" },
  in_progress: { mark: "…", cls: "bg-[#DBEAFE] text-[#1E40AF]" },
  open: { mark: "", cls: "border border-[#CCCCCC] bg-white text-transparent" },
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  const t = checkTone[item.status]
  return (
    <li className="flex items-start gap-3 px-3 py-2">
      <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] font-bold ${t.cls}`}>{t.mark}</span>
      <span className="min-w-0 flex-1">
        <span className={`text-xs ${item.status === "done" ? "text-[#7A7A7A]" : "text-[#161616]"}`}>{item.text}</span>
        <span className="mt-0.5 block text-[11px] text-[#7A7A7A]">
          {item.owner ? <Owner name={item.owner} /> : null}
          {item.owner && item.source ? " · " : ""}
          {item.source ?? ""}
        </span>
      </span>
      <Label>{item.status.replace("_", " ")}</Label>
    </li>
  )
}
