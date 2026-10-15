import { useState, type ReactNode } from "react"
import type { Heat, Status, Tile } from "../types"
import { daysUntil, ownerUnconfirmed, trackByNumber } from "../data"
import { surfaceTone } from "./surface"

export const heatMeta: Record<Heat, { label: string; pill: string; card: string }> = {
  burning: { label: "Burning", pill: "bg-[#FFCCD5] text-[#161616]", card: "border-[#FFCCD5] bg-[#FFF2F4]" },
  active: { label: "Active", pill: "bg-[#F2DEA3] text-[#8A6B00]", card: "border-[#E0E0E0] bg-white" },
  steady: { label: "Steady", pill: "bg-[#F2F2F2] text-[#474747]", card: "border-[#E0E0E0] bg-white" },
  idle: { label: "Idle", pill: "bg-[#F2F2F2] text-[#7A7A7A]", card: "border-[#E0E0E0] bg-white" },
}

export const statusLabel: Record<Status, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  complete: "Complete",
}

export const statusPill: Record<Status, string> = {
  not_started: "bg-[#F2F2F2] text-[#7A7A7A]",
  in_progress: "bg-[#DBEAFE] text-[#1E40AF]",
  blocked: "bg-[#FFCCD5] text-[#8A2E28]",
  complete: "bg-[#E0E0E0] text-[#474747]",
}

/** Track number badge, colored by the track's surface so the color follows the track everywhere. */
export function TrackNumber({ n, onClick }: { n: number; onClick?: () => void }) {
  const tone = surfaceTone(trackByNumber(n)?.area)
  const cls = `rounded px-1.5 py-0.5 text-[10px] font-bold ${tone.solid}`
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${cls} ${tone.solidHover}`} title={`Open track #${n}`}>
        #{n}
      </button>
    )
  }
  return <span className={cls}>#{n}</span>
}

export function HeatPill({ heat }: { heat: Heat }) {
  const m = heatMeta[heat]
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${m.pill}`}>{m.label}</span>
}

export function StatusPill({ status }: { status: Status }) {
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusPill[status]}`}>{statusLabel[status]}</span>
}

/** Owner name. Placeholders render as an amber alert so the gap is visible. */
export function Owner({ name, prefix }: { name: string | null | undefined; prefix?: string }) {
  const unconfirmed = ownerUnconfirmed(name)
  return (
    <span className={`text-[11px] font-medium ${unconfirmed ? "text-[#8A6B00]" : "text-[#161616]"}`}>
      {prefix ? <span className="font-normal text-[#7A7A7A]">{prefix} </span> : null}
      {unconfirmed ? name || "Owner to confirm" : name}
    </span>
  )
}

export function Chip({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "mint" | "alert" }) {
  const cls =
    tone === "mint"
      ? "border-[#96F5A9] bg-[#EAF1EE] text-[#004B37]"
      : tone === "alert"
        ? "border-[#FFCCD5] bg-[#FFF2F4] text-[#8A2E28]"
        : "border-[#E0E0E0] bg-[#F7F7F7] text-[#474747]"
  return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${cls}`}>{children}</span>
}

export function Label({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-wide text-[#7A7A7A]">{children}</p>
}

export function TileCard({ tile }: { tile: Tile }) {
  if (tile.countdownTo) {
    const days = daysUntil(tile.countdownTo)
    const overdue = days < 0
    return (
      <div className={`rounded-lg border px-3 py-2 ${overdue ? "border-[#F5B5B5] bg-[#FFF5F5]" : "border-[#E0E0E0] bg-white"}`}>
        <Label>{tile.label}</Label>
        <p className={`mt-0.5 text-xl font-semibold leading-tight ${overdue ? "text-[#B42318]" : "text-[#161616]"}`}>
          {overdue ? `${Math.abs(days)}d over` : days === 0 ? "today" : `${days}d`}
        </p>
        <p className="text-[11px] text-[#7A7A7A]">{tile.countdownTo}</p>
      </div>
    )
  }
  const missing = tile.value === null || tile.value === undefined
  return (
    <div className={`flex flex-col rounded-lg border px-3 py-2 ${missing ? "border-dashed border-[#CCCCCC] bg-[#F7F7F7]" : "border-[#E0E0E0] bg-white"}`}>
      <Label>{tile.label}</Label>
      <p className={`mt-0.5 text-xl font-semibold leading-tight ${missing ? "text-[#B8B8B8]" : "text-[#161616]"}`}>{missing ? "—" : tile.value}</p>
      {missing ? (
        <p className="text-[11px] text-[#8A6B00]">needs: {tile.needs ?? "owner"}</p>
      ) : (
        <>
          {tile.sub ? <p className="text-[11px] text-[#7A7A7A]">{tile.sub}</p> : null}
          {typeof tile.progress === "number" ? (
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E0E0E0]">
              <div className="h-full rounded-full bg-[#004B37]" style={{ width: `${Math.min(100, Math.max(0, tile.progress * 100))}%` }} />
            </div>
          ) : null}
        </>
      )}
      {tile.source ? <Source text={tile.source} /> : null}
    </div>
  )
}

/** Always-visible source line. Short sources are plain text; long ones truncate and expand on click. */
const SOURCE_FOLD = 44
function Source({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  const long = text.length > SOURCE_FOLD
  if (!long) {
    return (
      <p className="mt-auto pt-1.5 text-[10px] leading-snug text-[#B8B8B8]">
        <span className="font-semibold">Source:</span> {text}
      </p>
    )
  }
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        setOpen((v) => !v)
      }}
      className="mt-auto pt-1.5 text-left text-[10px] leading-snug text-[#B8B8B8] hover:text-[#474747]"
      aria-expanded={open}
    >
      <span className="font-semibold">Source:</span> {open ? text : `${text.slice(0, SOURCE_FOLD).trimEnd()}…`}{" "}
      <span className="font-semibold text-[#004B37]">{open ? "less" : "more"}</span>
    </button>
  )
}

export function Updates({ updates }: { updates: { date: string; text: string; source: string; by?: string }[] }) {
  if (updates.length === 0) return null
  return (
    <ol className="mt-2 space-y-2">
      {updates.map((u, i) => (
        <li key={`${u.date}-${i}`} className="text-xs leading-5 text-[#474747]">
          <span className="font-semibold text-[#161616]">{u.date}</span>
          {" · "}
          {u.text}
          <span className="text-[#7A7A7A]">
            {" "}
            ({u.source}
            {u.by ? `, ${u.by}` : ""})
          </span>
        </li>
      ))}
    </ol>
  )
}
