import areasFile from "./areas.json"
import tracksFile from "./tracks.json"
import clientsFile from "./clients.json"
import decisionsFile from "./decisions.json"
import actionsFile from "./actions.json"
import teamFile from "./team.json"
import roadmapFile from "./roadmap.json"
import type { ActionItem, Area, Attention, ClientRow, Decision, DeliveryPattern, Fulfiller, Line, Metric, Offering, OfferingType, OwnerPageData, RoadmapItem, RosterMember, Track, VocabularyEntry, Arm } from "../types"

export const model = {
  asOf: areasFile.asOf,
  text: areasFile.model,
  programMetrics: areasFile.programMetrics as Metric[],
  vocabulary: areasFile.vocabulary as VocabularyEntry[],
}

export const areas = (areasFile.areas as Area[]).slice().sort((a, b) => a.number - b.number)
export const arms = areasFile.arms as Arm[]
export const armForArea = (areaId: string | null | undefined): Arm | undefined => arms.find((m) => areaId != null && m.areas.includes(areaId))
/** "Surface Area Coordinator" or "Delivery Coordinator", by arm. */
export const coordinatorLabel = (areaId: string): string => armForArea(areaId)?.coordinatorLabel ?? "Coordinator"
export const offerings = areasFile.offerings as Offering[]
export const offeringTypes = areasFile.offeringTypes as OfferingType[]
export const fulfillers = areasFile.fulfillers as Fulfiller[]
export const patterns = areasFile.patterns as DeliveryPattern[]
export const areaById = (id: string): Area | undefined => areas.find((a) => a.id === id)
export const offeringById = (id: string): Offering | undefined => offerings.find((o) => o.id === id)
export const offeringTypeById = (id: string): OfferingType | undefined => offeringTypes.find((t) => t.id === id)
export const fulfillerById = (id: string): Fulfiller | undefined => fulfillers.find((f) => f.id === id)
export const lines = areasFile.lines as Line[]
export const lineById = (id: string): Line | undefined => lines.find((l) => l.id === id)
export const linesForOffering = (offeringId: string): Line[] => lines.filter((l) => l.offering === offeringId)

export const tracksMeta = { asOf: tracksFile.asOf, sourceNote: tracksFile.sourceNote }
export const tracks = (tracksFile.tracks as Track[]).slice().sort((a, b) => a.number - b.number)

export const clientsMeta = { asOf: clientsFile.asOf, owner: clientsFile.owner as string, sourceNote: clientsFile.sourceNote }
export const clients = clientsFile.clients as ClientRow[]

export const decisionsMeta = { sourceNote: decisionsFile.sourceNote }
export const decisions = decisionsFile.decisions as Decision[]

export const actionsMeta = { asOf: actionsFile.asOf, sourceNote: actionsFile.sourceNote }
export const actions = actionsFile.items as ActionItem[]

export const team = {
  asOf: teamFile.asOf,
  source: teamFile.source,
  conveners: teamFile.conveners as { name: string; role: string }[],
  roster: teamFile.roster as RosterMember[],
  openSeats: teamFile.openSeats as string[],
}

export const roadmap = {
  asOf: roadmapFile.asOf,
  releases: roadmapFile.releases as { id: string; label: string }[],
  lanes: roadmapFile.lanes as { id: string; label: string }[],
  items: roadmapFile.items as RoadmapItem[],
}

// Owner pages: one JSON file per page in src/data/pages/. Add a file, it shows up.
const pageModules = import.meta.glob<{ default: OwnerPageData }>("./pages/*.json", { eager: true })
// Ordered by surface (Sign, Pay, Live, Fulfill, following areas.json `number`), then by track number within a
// surface, so the tabs for one surface sit next to each other.
const areaOrder = (trackNumber: number | null | undefined): number => {
  const areaId = tracks.find((t) => t.number === trackNumber)?.area
  return areas.find((a) => a.id === areaId)?.number ?? 999
}
export const pages: OwnerPageData[] = Object.values(pageModules)
  .map((m) => m.default)
  .sort((a, b) => areaOrder(a.track) - areaOrder(b.track) || (a.track ?? 999) - (b.track ?? 999))

export const pageById = (id: string | null | undefined): OwnerPageData | undefined =>
  id ? pages.find((p) => p.id === id) : undefined

export const trackByNumber = (n: number | null | undefined): Track | undefined =>
  n == null ? undefined : tracks.find((t) => t.number === n)

/** Track owner is the source of truth; the page reflects it. */
export const pageOwner = (page: OwnerPageData): string => trackByNumber(page.track)?.owner ?? "Owner to confirm"

export const clientById = (id: string): ClientRow | undefined => clients.find((c) => c.id === id)

/**
 * Attention share: how much of the room a line or offering is consuming, counted as the tracks that move it
 * plus the live client threads tagged with it, over everything the room is carrying. Completed tracks are
 * retired work and do not consume attention, so they are excluded on both sides of the ratio. The revenue
 * share next to it is blank until the owner supplies the number; the comparison is the point.
 */
const liveClients = () => clients.filter((c) => c.heat !== "idle")
const liveTracks = () => tracks.filter((t) => t.status !== "complete")
export function attentionFor(opts: { tracks: Track[]; tags: string[] }): Attention {
  const tagSet = new Set(opts.tags)
  const live = opts.tracks.filter((t) => t.status !== "complete")
  const cs = liveClients().filter((c) => c.products.some((p) => tagSet.has(p)))
  const denom = liveTracks().length + liveClients().length
  return { tracks: live, clients: cs, share: denom === 0 ? 0 : (live.length + cs.length) / denom }
}
export const attentionForLine = (l: Line): Attention =>
  attentionFor({ tracks: tracks.filter((t) => t.lines.includes(l.id)), tags: l.tags })
export const attentionForOffering = (o: Offering): Attention =>
  attentionFor({ tracks: tracks.filter((t) => t.offerings.includes(o.id)), tags: o.tags ?? [] })

/** True when an owner string is a placeholder rather than a person. */
export const ownerUnconfirmed = (owner: string | null | undefined): boolean =>
  !owner || /to confirm|^tbd$|^product$|^cs$|^implementation$|^engineering$/i.test(owner.trim())

const DAY_MS = 86_400_000
export function daysUntil(iso: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${iso}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / DAY_MS)
}

/** Only dates in ISO form count as past-due; prose ETAs are left alone. */
export const isPastDue = (due: string | null | undefined, status: string): boolean =>
  !!due && /^\d{4}-\d{2}-\d{2}$/.test(due) && status !== "complete" && daysUntil(due) < 0
