type Tile = {
  label: string
  value?: string | null
  sub?: string
  progress?: number
  source?: string
  needs?: string
  countdownTo?: string
}

type Group = {
  track: number
  title: string
  tiles: Tile[]
}

type KpiFile = {
  asOf: string
  sourceNote: string
  overall: Tile[]
  groups: Group[]
}

const DAY_MS = 86_400_000

function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${iso}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / DAY_MS)
}

function TileCard({ tile }: { tile: Tile }) {
  if (tile.countdownTo) {
    const days = daysUntil(tile.countdownTo)
    const overdue = days < 0
    return (
      <div className={`rounded-lg border px-3 py-2 ${overdue ? "border-[#F5B5B5] bg-[#FFF5F5]" : "border-[#E5E7EB] bg-white"}`}>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#737373]">{tile.label}</p>
        <p className={`mt-0.5 text-xl font-semibold leading-tight ${overdue ? "text-[#B42318]" : "text-[#0A0A0A]"}`}>
          {overdue ? `${Math.abs(days)}d over` : days}
        </p>
        <p className="text-[11px] text-[#737373]">{tile.countdownTo}</p>
      </div>
    )
  }

  const missing = tile.value === null || tile.value === undefined
  return (
    <div
      className={`rounded-lg border px-3 py-2 ${missing ? "border-dashed border-[#D1D5DB] bg-[#FAFAFA]" : "border-[#E5E7EB] bg-white"}`}
      title={tile.source ?? (tile.needs ? `Needs: ${tile.needs}` : undefined)}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#737373]">{tile.label}</p>
      <p className={`mt-0.5 text-xl font-semibold leading-tight ${missing ? "text-[#9CA3AF]" : "text-[#0A0A0A]"}`}>
        {missing ? "—" : tile.value}
      </p>
      {missing ? (
        <p className="text-[11px] text-[#B45309]">needs: {tile.needs ?? "owner"}</p>
      ) : (
        <>
          {tile.sub ? <p className="text-[11px] text-[#737373]">{tile.sub}</p> : null}
          {typeof tile.progress === "number" ? (
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#E5E7EB]">
              <div className="h-full rounded-full bg-[#004B37]" style={{ width: `${Math.min(100, Math.max(0, tile.progress * 100))}%` }} />
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

export function StateOfTheUnion({ data }: { data: KpiFile }) {
  const missingCount = data.groups.flatMap((g) => g.tiles).filter((t) => !t.countdownTo && (t.value === null || t.value === undefined)).length

  return (
    <section className="rounded-xl border border-[#E5E7EB] bg-white p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold">State of the union</h2>
        <p className="text-[11px] text-[#737373]">
          Numbers as of {data.asOf}. Hover a tile for its source.
          {missingCount > 0 ? ` ${missingCount} tile${missingCount === 1 ? "" : "s"} still need${missingCount === 1 ? "s" : ""} an owner to supply the number.` : ""}
        </p>
      </div>

      {data.overall.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {data.overall.map((tile) => (
            <TileCard key={tile.label} tile={tile} />
          ))}
        </div>
      ) : null}

      <div className="mt-4 space-y-4">
        {data.groups.map((group) => (
          <div key={group.track}>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-[#004B37] px-1.5 py-0.5 text-[10px] font-bold text-white">#{group.track}</span>
              <h3 className="text-xs font-semibold text-[#0A0A0A]">{group.title}</h3>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {group.tiles.map((tile) => (
                <TileCard key={tile.label} tile={tile} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
