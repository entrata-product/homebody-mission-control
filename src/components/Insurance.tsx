import type { Line, Metric } from "../types"
import { attentionForLine, attentionForOffering, clients, lines, offeringById, tracks } from "../data"
import type { Route } from "../routes"
import { AttentionCell, Label, MetricCell, Owner } from "./ui"
import { surfaceTone } from "./surface"

/**
 * Insurance Line Performance: the one place numbers for the insurance business live, so the Model page can stay
 * structural and nothing has to be kept in sync across tabs. Every value here comes from `lines[].economics` and
 * `offerings[insurance].economics` in src/data/areas.json. Blank cells name who supplies the number.
 */

/** Policy types in core (Eos/Insurance/CInsurancePolicyType.class.php) mapped to the war room's lines. */
const corePolicyTypes: { id: number; name: string; line: string | null; note?: string }[] = [
  { id: 1, name: "HO-4", line: "ho4" },
  { id: 2, name: "Force place - Basic", line: "master-policy", note: "Master policy family" },
  { id: 3, name: "Blanket - Basic", line: "master-policy", note: "Master policy family" },
  { id: 4, name: "Blanket - Enhanced", line: "master-policy", note: "Master policy family" },
  { id: 5, name: "ID Theft", line: "additional-lines", note: "Mapping to confirm" },
  { id: 6, name: "Affordable", line: "master-policy", note: "Master policy variant for affordable housing; mapping to confirm" },
  { id: 7, name: "Custom", line: "additional-lines", note: "Mapping to confirm" },
  { id: 8, name: "Deposit", line: "deposit-alternative", note: "Product name in core: Deposit Alternative" },
  { id: 9, name: "Homebody Guaranty", line: "hbg", note: "Product name in core: Homebody Guaranty Conventional" },
  { id: 10, name: "Content Only", line: "contents" },
]

export function Insurance({ navigate }: { navigate: (r: Route) => void }) {
  const insurance = offeringById("insurance")
  if (!insurance) return null
  const ls = lines.filter((l) => l.offering === insurance.id)
  const liveClients = clients.filter((c) => c.heat !== "idle").length
  const totalMetrics = ls.flatMap(lineMetrics)
  const blank = totalMetrics.filter((m) => m.value == null)
  const suppliers = [...new Set(blank.map((m) => m.needs ?? "owner"))]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold tracking-tight">Insurance Line Performance</h2>
          <p className="mt-2 text-sm leading-6 text-[#474747]">
            Insurance and Guaranty is Homebody's largest offering and the one that carries the lease condition, so it gets its own view. This is a Delivery-arm page: the lines, HBG included,
            are owned by Josh Tebbs, who runs the insurance agency, and the Delivery numbers (revenue, what Entrata keeps, policies in force, claims) come from the agency. The Distribution
            numbers (doors sponsored, attach at signing) come from the Surface Area Coordinators. This is the only tab where either kind of number lives; the Model page describes structure
            and points here. The tactical HBG work is split by arm: HBG Distribution Get Well (application, renewals, transfers on Sign) and HBG Delivery Get Well (charges, cancellations, Leap sync, claims, reporting).
          </p>
        </div>
        <div className="shrink-0 text-right text-[11px] text-[#7A7A7A]">
          <p>
            Page owner: <Owner name={insurance.owner} />
          </p>
          <p className="mt-1">
            Edit <code className="text-[#004B37]">lines[].economics</code> in <code className="text-[#004B37]">src/data/areas.json</code>
          </p>
        </div>
      </div>

      {/* Offering-level totals */}
      <section>
        <Label>Insurance and Guaranty, all lines · Delivery numbers first, Doors sponsored is Distribution</Label>
        <div className="mt-2 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[insurance.economics.revenue, insurance.economics.share, insurance.economics.distribution, insurance.economics.enrolled].map((m) => (
            <Tile key={m.label} m={m} />
          ))}
        </div>
        <p className="mt-2 text-[11px] text-[#7A7A7A]">
          {blank.length} of {totalMetrics.length} line numbers below are blank. Supplied by: {suppliers.join(", ")}.
        </p>
      </section>

      {/* Per-line table */}
      <section>
        <h3 className="text-sm font-semibold">By line</h3>
        <p className="mt-1 text-xs leading-5 text-[#7A7A7A]">
          Attention is counted from this repo: the tracks that move a line plus the live client threads tagged with it, over {tracks.length} tracks and {liveClients} client threads. The
          comparison between attention and revenue is the point; until the revenue column is filled in, it cannot be made.
        </p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-[#E0E0E0] bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E0E0E0] text-[9px] uppercase tracking-wide">
                <th className="px-3 pt-2 pb-1" colSpan={2} />
                <th className="px-3 pt-2 pb-1 font-bold text-[#474747]" colSpan={2}>
                  Delivery · the agency supplies
                </th>
                <th className="px-3 pt-2 pb-1 font-bold text-[#004B37]">Distribution · surfaces supply</th>
                <th className="px-3 pt-2 pb-1 font-bold text-[#7A7A7A]">This room</th>
              </tr>
              <tr className="border-b border-[#E0E0E0] text-[10px] uppercase tracking-wide text-[#7A7A7A]">
                <th className="px-3 py-2 font-semibold">Line</th>
                <th className="px-3 py-2 font-semibold">Line owner (Fulfiller)</th>
                <th className="px-3 py-2 font-semibold">Revenue and what Entrata keeps</th>
                <th className="px-3 py-2 font-semibold">Policies in force</th>
                <th className="px-3 py-2 font-semibold">Doors sponsored</th>
                <th className="px-3 py-2 font-semibold">Attention</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2] align-top">
              {ls.map((l) => (
                <tr key={l.id}>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-[#161616]">{l.name}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-1">
                      <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${/alternative/i.test(l.path) ? "bg-[#F2DEA3] text-[#8A6B00]" : /default|required/i.test(l.path) ? "bg-[#96F5A9] text-[#004B37]" : "bg-[#F2F2F2] text-[#474747]"}`}>{l.path}</span>
                      {l.surfaces.map((id) => (
                        <span key={id} className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${surfaceTone(id).chip}`}>
                          {id}
                        </span>
                      ))}
                    </span>
                    <span className="mt-1 block w-44 text-[10px] leading-4 text-[#7A7A7A]">{l.requirement}</span>
                  </td>
                  <td className="px-3 py-2">
                    <Owner name={l.owner} />
                  </td>
                  <td className="px-3 py-2">
                    <MetricCell m={l.economics.revenue} />
                    <span className="mt-1.5 block">
                      <MetricCell m={{ ...l.economics.share, label: l.economics.share.label ? `Entrata keeps: ${l.economics.share.label.toLowerCase()}` : "Entrata keeps" }} />
                    </span>
                    {l.economics.extra?.map((m) => (
                      <span key={m.label} className="mt-1.5 block">
                        <MetricCell m={m} />
                      </span>
                    ))}
                  </td>
                  <td className="px-3 py-2">
                    <MetricCell m={l.economics.enrolled} />
                  </td>
                  <td className="px-3 py-2">
                    <MetricCell m={l.economics.distribution} />
                  </td>
                  <td className="px-3 py-2">
                    <AttentionCell a={attentionForLine(l)} navigate={navigate} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-[#7A7A7A]">
          Offering-level attention: {Math.round(attentionForOffering(insurance).share * 100)}% of the room. Structure, fulfillment, and contracts per line are on{" "}
          <button type="button" onClick={() => navigate({ tab: "model" })} className="font-semibold text-[#004B37] underline underline-offset-2">
            The model
          </button>
          .
        </p>
      </section>

      {/* Core reference */}
      <section>
        <h3 className="text-sm font-semibold">How core names these lines</h3>
        <p className="mt-1 text-xs leading-5 text-[#7A7A7A]">
          Entrata core has ten insurance policy types (<code>CInsurancePolicyType</code>, <code>Eos/Insurance</code>). Four of them are the master policy family, which is why Master Policy is one
          line here but several products in reporting. Outside policies verified by IVS have no policy type because no policy is issued. The mapping is a starting point for whoever pulls the
          numbers; confirm it with the agency before relying on it.
        </p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-[#E0E0E0] bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E0E0E0] text-[10px] uppercase tracking-wide text-[#7A7A7A]">
                <th className="px-3 py-2 font-semibold">Core id</th>
                <th className="px-3 py-2 font-semibold">Core policy type</th>
                <th className="px-3 py-2 font-semibold">War room line</th>
                <th className="px-3 py-2 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2]">
              {corePolicyTypes.map((p) => {
                const line = p.line ? ls.find((l) => l.id === p.line) : undefined
                const unsure = /to confirm/i.test(p.note ?? "")
                return (
                  <tr key={p.id}>
                    <td className="px-3 py-2 text-[#7A7A7A]">{p.id}</td>
                    <td className="px-3 py-2 font-semibold text-[#161616]">{p.name}</td>
                    <td className={`px-3 py-2 ${unsure ? "text-[#8A6B00]" : "text-[#474747]"}`}>{line?.name ?? "—"}</td>
                    <td className={`px-3 py-2 text-[11px] ${unsure ? "text-[#8A6B00]" : "text-[#7A7A7A]"}`}>{p.note ?? ""}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function lineMetrics(l: Line): Metric[] {
  const e = l.economics
  return [e.revenue, e.share, e.distribution, e.enrolled, ...(e.extra ?? [])]
}

function Tile({ m }: { m: Metric }) {
  const missing = m.value == null
  return (
    <div className={`rounded-xl border px-3 py-3 ${missing ? "border-dashed border-[#CCCCCC] bg-[#F7F7F7]" : "border-[#E0E0E0] bg-white"}`} title={m.source}>
      <Label>{m.label}</Label>
      <p className={`mt-0.5 text-2xl font-bold leading-tight ${missing ? "text-[#B8B8B8]" : "text-[#161616]"}`}>{missing ? "—" : m.value}</p>
      {missing ? <p className="text-[10px] text-[#8A6B00]">needs: {m.needs ?? "owner"}</p> : m.source ? <p className="text-[10px] text-[#B8B8B8]">{m.source}</p> : null}
    </div>
  )
}
