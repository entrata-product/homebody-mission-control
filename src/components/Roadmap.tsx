import { useMemo, useState } from "react"
import roadmapFile from "../data/roadmap.json"

type Release = "R3" | "R4" | "R1"
type Lane = "app" | "rewards" | "access_connect" | "insurance"

type RoadmapItem = {
  keys: string
  title: string
  desc: string
  lane: Lane
  release: Release
  platform?: string
}

const items = roadmapFile.items as RoadmapItem[]
const releases = roadmapFile.releases as { id: Release; label: string }[]
const lanes = roadmapFile.lanes as { id: Lane; label: string }[]

const platformPill: Record<string, string> = {
  "Web + Mobile": "bg-[#BCF0C8] text-[#004B37]",
  "Web": "bg-[#F3F4F6] text-[#4A4A4A]",
  "Mobile": "bg-[#F3F4F6] text-[#4A4A4A]",
}

export function Roadmap() {
  const [selectedLane, setSelectedLane] = useState<Lane | "all">("all")
  const [selectedRelease, setSelectedRelease] = useState<Release | "all">("all")

  const counts = useMemo(() => {
    const r: Record<string, number> = { R3: 0, R4: 0, R1: 0 }
    for (const item of items) r[item.release]++
    return r
  }, [])

  const filtered = useMemo(() =>
    items.filter((i) => {
      if (selectedLane !== "all" && i.lane !== selectedLane) return false
      if (selectedRelease !== "all" && i.release !== selectedRelease) return false
      return true
    }),
    [selectedLane, selectedRelease]
  )

  const activeReleases = selectedRelease === "all"
    ? releases.map((r) => r.id)
    : [selectedRelease]

  const activeLanes = selectedLane === "all"
    ? lanes.map((l) => l.id)
    : [selectedLane]

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-lg border border-[#E5E7EB] bg-white p-1" role="group" aria-label="Lane">
          <FilterBtn active={selectedLane === "all"} onClick={() => setSelectedLane("all")}>All</FilterBtn>
          {lanes.map((l) => (
            <FilterBtn key={l.id} active={selectedLane === l.id} onClick={() => setSelectedLane(l.id as Lane)}>
              {l.label}
            </FilterBtn>
          ))}
        </div>
        <div className="flex gap-1 rounded-lg border border-[#E5E7EB] bg-white p-1" role="group" aria-label="Release">
          <FilterBtn active={selectedRelease === "all"} onClick={() => setSelectedRelease("all")}>All</FilterBtn>
          {releases.map((r) => (
            <FilterBtn key={r.id} active={selectedRelease === r.id} onClick={() => setSelectedRelease(r.id as Release)}>
              {r.id} <span className="ml-1 font-normal text-[#737373]">({counts[r.id]})</span>
            </FilterBtn>
          ))}
        </div>
        <p className="text-[11px] text-[#737373]">As of {roadmapFile.asOf}</p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {activeReleases.map((releaseId) => {
          const releaseItems = filtered.filter((i) => i.release === releaseId)
          if (releaseItems.length === 0) return null
          const releaseLabel = releases.find((r) => r.id === releaseId)?.label ?? releaseId
          return (
            <section key={releaseId}>
              <h2 className="mb-3 text-sm font-semibold">{releaseLabel}</h2>
              <div className="space-y-4">
                {activeLanes.map((laneId) => {
                  const laneItems = releaseItems.filter((i) => i.lane === laneId)
                  if (laneItems.length === 0) return null
                  const laneLabel = lanes.find((l) => l.id === laneId)?.label ?? laneId
                  return (
                    <div key={laneId}>
                      <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#737373]">{laneLabel}</h3>
                      <ul className="divide-y divide-[#F3F4F6] rounded-xl border border-[#E5E7EB] bg-white">
                        {laneItems.map((item) => (
                          <li key={item.keys} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4 py-3">
                            <span className="font-mono text-[10px] text-[#737373] shrink-0">{item.keys}</span>
                            <span className="text-sm font-semibold">{item.title}</span>
                            <span className="text-xs text-[#4A4A4A]">{item.desc}</span>
                            {item.platform && (
                              <span className={`ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${platformPill[item.platform] ?? "bg-[#F3F4F6] text-[#4A4A4A]"}`}>
                                {item.platform}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1 text-xs font-semibold ${active ? "bg-[#004B37] text-white" : "text-[#737373] hover:bg-[#F3F4F6]"}`}
    >
      {children}
    </button>
  )
}
