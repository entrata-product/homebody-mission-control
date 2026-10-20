import { armTone, surfaceTone } from "./components/surface"
import { useEffect, useState } from "react"
import { Tracks } from "./components/Tracks"
import { Clients } from "./components/Clients"
import { OwnerPage } from "./components/OwnerPage"
import { Model } from "./components/Model"
import { Insurance } from "./components/Insurance"
import { Contribute } from "./components/Contribute"
import { armForArea, arms, clients, ownerUnconfirmed, pageById, pageOwner, pages, trackByNumber, tracksMeta } from "./data"
import { defaultRoute, hashToRoute, routeToHash, type Route } from "./routes"

type TabDef = {
  key: string
  label: string
  route: Route
  count?: number
  ownerNeeded?: boolean
  area?: string
}
type TabGroup = { label: string; armId?: string; tabs: TabDef[] }

const pageTabs = pages.map<TabDef>((p) => ({
  key: p.id,
  label: p.title,
  route: { tab: "page", id: p.id },
  ownerNeeded: ownerUnconfirmed(pageOwner(p)),
  area: trackByNumber(p.track)?.area,
}))
const pagesInArm = (armId: string) => pageTabs.filter((t) => armForArea(t.area)?.id === armId)

/**
 * Tabs grouped the way the model is: the room itself, then one group per arm (owner pages sorted by surface), then reference.
 * Rendered as stacked rows: label column on the left, that group's tabs on the right.
 */
const tabGroups: TabGroup[] = [
  {
    label: "This room",
    tabs: [
      { key: "tracks", label: "Tracks", route: { tab: "tracks" } },
      {
        key: "clients",
        label: "Clients",
        route: { tab: "clients" },
        count: clients.filter((c) => c.heat === "burning").length,
      },
    ],
  },
  ...arms.map<TabGroup>((arm) => ({
    label: arm.name,
    armId: arm.id,
    tabs: [
      ...pagesInArm(arm.id),
      ...(arm.id === "delivery"
        ? [
            {
              key: "insurance",
              label: "Insurance Line Performance",
              route: { tab: "insurance" } as Route,
              area: "fulfill",
            },
          ]
        : []),
    ],
  })),
  {
    label: "Reference",
    tabs: [
      { key: "model", label: "The model", route: { tab: "model" } },
      {
        key: "contribute",
        label: "How to update",
        route: { tab: "contribute" },
      },
    ],
  },
]

const routeKey = (r: Route) => (r.tab === "page" ? r.id : r.tab)

export default function App() {
  const [route, setRoute] = useState<Route>(() => (window.location.hash ? hashToRoute(window.location.hash) : defaultRoute))

  useEffect(() => {
    const onHash = () => {
      const r = hashToRoute(window.location.hash)
      setRoute(r)
      if (r.tab !== "tracks" && r.tab !== "clients") window.scrollTo({ top: 0 })
    }
    window.addEventListener("hashchange", onHash)
    return () => window.removeEventListener("hashchange", onHash)
  }, [])

  const navigate = (r: Route) => {
    const hash = routeToHash(r)
    if (window.location.hash !== hash) window.location.hash = hash
    setRoute(r)
    if (r.tab !== "tracks" && r.tab !== "clients") window.scrollTo({ top: 0 })
  }

  const activeKey = routeKey(route)
  const activePage = route.tab === "page" ? pageById(route.id) : undefined

  return (
    <div className="min-h-screen bg-[#F7F7F7] text-[#161616]">
      <header className="sticky top-0 z-20 border-b border-[#E0E0E0] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "#004B37" }} aria-hidden="true">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#70FC8D" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11 12 3l9 8" />
                <path d="M5 10v10h14V10" />
                <path d="M9 20v-6h6v6" />
              </svg>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-bold tracking-tight">
                Homebody War Room
                <span className="font-medium text-[#7A7A7A]">: Mission Control</span>
              </span>
              <span className="hidden h-4 w-px bg-[#E0E0E0] sm:block" />
              <span className="rounded-full bg-[#96F5A9] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#004B37]">Homebody</span>
              <span className="text-[11px] text-[#7A7A7A]">·</span>
              <a
                href="https://github.com/Entrata-Collab/operating-playbooks/blob/main/mission-control.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-[#7A7A7A] underline underline-offset-2 hover:text-[#161616]"
              >
                Mission Control playbook
              </a>
            </div>
          </div>
          <p className="hidden text-[11px] text-[#7A7A7A] sm:block">Slate as of {tracksMeta.asOf}</p>
        </div>
        <div className="mx-auto max-w-[1200px] px-6 pb-3">
          <p className="text-[12px] text-[#474747]">
            <span className="font-semibold text-[#004B37]">Mission:</span> Increase Homebody revenue growth by 10% in Q1 2027 (final target to be confirmed). The war room gets there one track at a
            time: every hot client thread has one owner and a next step, and every track is an outcome one person owns by coordinating the work needed.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-6">
        <nav className="mb-6 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-lg border border-[#E0E0E0] bg-white px-3 py-2" aria-label="Tabs">
          {tabGroups.map((g) => (
            <div key={g.label} className="contents" role="group" aria-label={g.label}>
              <span className={`flex items-center justify-end text-[10px] font-semibold uppercase tracking-wide ${g.armId ? armTone(g.armId).text : "text-[#7A7A7A]"}`}>{g.label}</span>
              <div className="flex flex-wrap items-center gap-1">
                {g.tabs.map((t) => {
                  const active = activeKey === t.key
                  const tone = surfaceTone(t.area)
                  return (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => navigate(t.route)}
                      title={t.ownerNeeded ? `${t.label}: owner needed` : undefined}
                      className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-medium ${
                        active ? (t.area ? tone.solid : "bg-[#004B37] text-white") : t.ownerNeeded ? "text-[#8A6B00] hover:bg-[#FFF3D1]" : "text-[#474747] hover:bg-[#F2F2F2]"
                      }`}
                    >
                      {t.area ? <span className={`h-2 w-2 rounded-full ${active ? "bg-white/70" : tone.solid}`} aria-hidden="true" /> : null}
                      {t.label}
                      {t.count ? <span className={`rounded-full px-1.5 text-[10px] ${active ? "bg-white/20 text-white" : "bg-[#FFCCD5] text-[#161616]"}`}>{t.count}</span> : null}
                      {t.ownerNeeded && !active ? <span className="h-1.5 w-1.5 rounded-full bg-[#8A6B00]" aria-hidden="true" /> : null}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {route.tab === "tracks" && <Tracks navigate={navigate} focusTrack={route.track} />}
        {route.tab === "clients" && <Clients navigate={navigate} focusClient={route.client} />}
        {route.tab === "page" &&
          (activePage ? (
            <OwnerPage page={activePage} navigate={navigate} />
          ) : (
            <p className="text-sm text-[#474747]">
              No page called <code>{route.id}</code>. Add <code>src/data/pages/{route.id}.json</code> to create it.
            </p>
          ))}
        {route.tab === "insurance" && <Insurance navigate={navigate} />}
        {route.tab === "model" && <Model navigate={navigate} />}
        {route.tab === "contribute" && <Contribute />}
      </main>

      <footer className="mt-8 border-t border-[#E0E0E0]">
        <div className="mx-auto max-w-[1200px] px-6 py-4">
          <p className="text-[10px] text-[#7A7A7A]">
            Data in this app: slates, Slack, Jira, Zendesk, and Domo, each cited on the item. Owner pages pull numbers when their owner wires them.
            <span className="text-[#B8B8B8]"> Slate as of {tracksMeta.asOf}.</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
