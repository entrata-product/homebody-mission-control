export type Heat = "burning" | "active" | "steady" | "idle"
export type Status = "not_started" | "in_progress" | "blocked" | "complete"

export type Update = { date: string; text: string; source: string; by?: string }

/**
 * A surface in the Homebody model (docs/homebody-model.md). Tracks are grouped under surfaces.
 * Sign, Pay, and Live are access surfaces (where the resident reaches a service).
 * Fulfill is where Homebody teams actually deliver the service.
 */
export type Area = {
  id: string
  number: number
  /** Which arm the area belongs to: Distribution (Sign, Pay, Live) or Delivery (Fulfill). */
  layer: "Distribution" | "Delivery"
  /** The verb: Sign, Pay, Live, Fulfill. */
  title: string
  /** e.g. "Lease checkout · an Entrata surface" */
  subtitle: string
  /** Whose surface it is. Sign belongs to Entrata's leasing product, the rest to Homebody. */
  runBy: "Entrata" | "Homebody"
  tagline: string
  why: string
  /** Surface Area Coordinator (Distribution) or Delivery Coordinator (Delivery). Tracks keep their own owners; this person coordinates across them. */
  owner: string
  parts?: string[]
  metric: Metric
}

/** How an offering is cut: who consumes it, who pays, and why the Customer turns it on. */
export type OfferingType = {
  id: "resident-paid" | "sponsor-paid" | "sponsor-provided"
  name: string
  consumes: string
  pays: string
  why: string
}

/** Who actually delivers an offering. Orthogonal to its type. */
export type Fulfiller = {
  id: "team" | "embedded-partner" | "integration-partner" | "homebody-rd" | "customer-vendor"
  name: string
  meaning: string
  examples: string
}

/**
 * An offering: something the Customer puts in front of residents through Homebody.
 * The umbrella term for services, programs, and linked things. See docs/homebody-model.md.
 */
export type Offering = {
  id: string
  type: OfferingType["id"]
  name: string
  /** Where the resident reaches it: area ids. */
  surfaces: string[]
  /** Required or optional from the resident's point of view, and when. */
  requirement: string
  /** Who pays whom. */
  money: string
  fulfiller: Fulfiller["id"]
  /** Which group actually delivers it. */
  fulfillment: string
  /** Who contracts with whom. Mark "To confirm" until verified. */
  contracts: string
  /** Client product tags (clients.json `products`) that belong to this offering. Used for attention share. */
  tags?: string[]
  note?: string
  owner: string
  economics: Economics
}

/**
 * The money and the attention behind an offering or a line. Values are null until the owner supplies them;
 * `needs` names that owner. Leave it blank rather than estimating.
 */
export type Economics = {
  revenue: Metric
  /** What Entrata keeps after the Customer's rev share and the carrier or partner's cut. */
  share: Metric
  /** Distribution: doors where the Sponsor has turned it on. The sell-in number in front of every sell-through number. */
  distribution: Metric
  /** Residents or policies enrolled. */
  enrolled: Metric
  extra?: Metric[]
  /** Why the line exists beyond its revenue. Mark "to confirm" until the owner agrees. */
  role: string
}

/**
 * A line inside an offering. Insurance is the only offering split this way today, because its lines
 * (Master Policy, Contents, HO4, HBG, ...) have different economics and different attention.
 */
export type Line = {
  id: string
  offering: string
  name: string
  surfaces: string[]
  /** How a resident ends up in it: default enrollment, alternative to the default, elective, required with an alternative. */
  path: string
  tags: string[]
  requirement: string
  fulfillment: string
  owner: string
  economics: Economics
}

/** One of the two arms of the model: Distribution (the surfaces) or Delivery (fulfillment). */
export type Arm = {
  id: "distribution" | "delivery"
  name: string
  question: string
  areas: string[]
  meaning: string
  owns: string
  coordinatorLabel: string
}

/** A term the model uses, with the comparable it is borrowed from (voluntary benefits, CPG retail, embedded insurance, marketplaces). */
export type VocabularyEntry = { term: string; meaning: string; precedent: string }

/** One of the three ways Entrata delivers value. Explains why Homebody does not behave like core Entrata. */
export type DeliveryPattern = {
  id: string
  name: string
  buyer: string
  user: string
  delivered: string
  fulfillment: string
  examples: string
  note: string
}

export type Metric = {
  label: string
  value: string | null
  target?: string
  source?: string
  /** Who supplies the number when value is null. */
  needs?: string
}

/** A finite outcome owned by one person. */
export type Track = {
  number: number
  id: string
  /** Surface id from areas.json. */
  area: string
  /** Offering ids from areas.json this track moves. Empty when it is about the surface itself. */
  offerings: string[]
  /** Line ids from areas.json this track moves (insurance lines today). */
  lines: string[]
  outcome: string
  owner: string
  due: string | null
  measure: string | null
  /** Owner page id in src/data/pages/, or null. */
  page: string | null
  clients: string[]
  status: Status
  heat: Heat
  summary: string
  nextStep: string
  note?: string | null
  noteTone?: "neutral" | "alert" | null
  updates: Update[]
}

/** How much of the room a line or offering is consuming: its tracks plus its live client threads, as a share of everything carried. */
export type Attention = { tracks: Track[]; clients: ClientRow[]; share: number }

export type ClientRow = {
  id: string
  name: string
  products: string[]
  heat: Heat
  /** The one owner of this client thread: the CSM who drives the outcome (de-escalation). */
  owner: string
  nextStep: string
  due: string | null
  source: string
  tracks: number[]
  scale?: string | null
  updates: Update[]
}

export type Decision = {
  id: string
  status: "open" | "decided"
  date: string
  due?: string | null
  title: string
  detail: string
  owner: string
  source?: string
  track?: number | null
}

export type ActionItem = {
  id: string
  date: string
  item: string
  owner: string | null
  track: number | null
  due: string | null
  status: "open" | "complete"
}

export type RosterMember = { name: string; seat: string }

// ---- Owner pages -----------------------------------------------------------

export type Tile = {
  label: string
  value?: string | null
  sub?: string
  progress?: number
  source?: string
  needs?: string
  countdownTo?: string
}

export type ChecklistItem = {
  text: string
  status: "done" | "in_progress" | "open"
  owner?: string
  source?: string
}

export type PageSection =
  | { type: "stats"; title: string; tiles: Tile[] }
  | { type: "table"; title: string; headers: string[]; rows: string[][]; note?: string }
  | { type: "checklist"; title: string; items: ChecklistItem[] }
  | { type: "text"; title: string; body: string; tone?: "neutral" | "alert" | "needs" }
  | { type: "roadmap"; title: string; lane?: string; keys?: string[] }
  | { type: "clients"; title: string }
  | { type: "links"; title: string; items: { label: string; href: string }[] }

/** An owner page. Its owner is not stored here: it is the owner of `track`, read from tracks.json. */
export type OwnerPageData = {
  id: string
  title: string
  track: number | null
  purpose: string
  asOf: string
  sections: PageSection[]
}

export type RoadmapItem = {
  keys: string
  title: string
  desc: string
  lane: string
  release: string
  platform?: string
}
