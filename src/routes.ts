import { pages } from "./data"

/**
 * One flat row of tabs, like the Leasing AI war room. Fixed tabs come first and last;
 * every owner page in src/data/pages/ is a peer tab in between, keyed by its page id.
 */
export type Route =
  | { tab: "tracks"; track?: number }
  | { tab: "clients"; client?: string }
  | { tab: "model" }
  | { tab: "contribute" }
  | { tab: "page"; id: string }

export const defaultRoute: Route = { tab: "tracks" }

const fixedTabs = new Set(["tracks", "clients", "model", "contribute"])
const pageIds = new Set(pages.map((p) => p.id))

export function routeToHash(r: Route): string {
  switch (r.tab) {
    case "tracks":
      return r.track != null ? `#tracks/${r.track}` : "#tracks"
    case "clients":
      return r.client ? `#clients/${r.client}` : "#clients"
    case "page":
      return `#${r.id}`
    default:
      return `#${r.tab}`
  }
}

export function hashToRoute(hash: string): Route {
  const [tab, arg] = hash.replace(/^#/, "").split("/")
  if (tab === "decisions") return { tab: "tracks" } // decisions now live in Open action items
  if (tab === "tracks") return arg && /^\d+$/.test(arg) ? { tab: "tracks", track: Number(arg) } : { tab: "tracks" }
  if (tab === "clients") return arg ? { tab: "clients", client: arg } : { tab: "clients" }
  if (tab === "page" && arg && pageIds.has(arg)) return { tab: "page", id: arg } // legacy #page/<id>
  if (pageIds.has(tab)) return { tab: "page", id: tab }
  if (fixedTabs.has(tab)) return { tab } as Route
  return defaultRoute
}

/** Hash for the tab a track points at, or null when the track has no page. */
export const pageRoute = (pageId: string | null | undefined): Route | null => (pageId && pageIds.has(pageId) ? { tab: "page", id: pageId } : null)
