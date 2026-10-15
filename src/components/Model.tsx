import type { ReactNode } from "react"
import type { Area, Attention, Economics, Metric, Offering } from "../types"
import { areas, attentionForLine, attentionForOffering, clients, fulfillerById, fulfillers, lines, model, offeringTypeById, offeringTypes, offerings, ownerUnconfirmed, patterns, tracks } from "../data"
import type { Route } from "../routes"
import { Label, Owner, TrackNumber } from "./ui"
import { surfaceTone } from "./surface"

const tracksFor = (areaId: string) => tracks.filter((t) => t.area === areaId)
const tracksForOffering = (id: string) => tracks.filter((t) => t.offerings.includes(id))

/** Offering types stay neutral so color means "surface" and nothing else. */
const typeTone: Record<Offering["type"], string> = {
  "resident-paid": "border border-[#161616] bg-white text-[#161616]",
  "sponsor-paid": "border border-[#474747] bg-[#F2F2F2] text-[#474747]",
  "sponsor-provided": "border border-dashed border-[#7A7A7A] bg-white text-[#7A7A7A]",
}

export function Model({ navigate }: { navigate: (r: Route) => void }) {
  const sign = areas.find((a) => a.id === "sign")!
  const pay = areas.find((a) => a.id === "pay")!
  const live = areas.find((a) => a.id === "live")!
  const fulfill = areas.find((a) => a.id === "fulfill")!

  const untracked = offerings.filter((o) => tracksForOffering(o.id).length === 0)
  const unownedAreas = areas.filter((a) => ownerUnconfirmed(a.owner))
  const missingMetrics = [...model.programMetrics, ...areas.map((a) => a.metric)].filter((m) => m.value == null)

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold tracking-tight">The Homebody model</h2>
        <p className="mt-2 text-sm leading-6 text-[#474747]">
          {model.text.split(" Full reference")[0]} Canonical text:{" "}
          <a href="https://github.com/Entrata-Collab/homebody-mission-control/blob/main/docs/homebody-model.md" target="_blank" rel="noopener noreferrer" className="text-[#004B37] underline underline-offset-2">
            docs/homebody-model.md
          </a>
          . Surfaces, offerings, Fulfillers, and patterns are data: <code>src/data/areas.json</code>.
        </p>
      </div>

      {/* Diagram */}
      <div className="space-y-2">
        <Band tone="customer" title="Sponsor: Entrata's Customer (the owner or PMC)" sub="The decision-maker, not the end user. Puts offerings on the property's menu, sets each as required or optional, collects through the ledger, sometimes pays Entrata a fee for the offering and earns a revenue share back when residents enroll, pays outright for programs like Rewards, and provides the community features and linked services Live points at. The plan sponsor, in benefits terms.">
          Sponsor
        </Band>

        <div className="grid grid-cols-3 gap-2 px-6 text-center text-[10px] text-[#7A7A7A]">
          <span>▼ sponsors required lines and elective offerings at signing</span>
          <span>▼ sponsors elective offerings in the app · required monthly</span>
          <span>▼ pays for programs, provides its own services, there when the resident needs it</span>
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <SurfaceCard area={sign} navigate={navigate} />
          <SurfaceCard area={pay} navigate={navigate} />
          <SurfaceCard area={live} navigate={navigate} />
        </div>

        <div className="rounded-xl border border-[#E0E0E0] bg-[#F7F7F7] p-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <Label>Offerings: what the Sponsor puts in front of residents, cut by who consumes, who pays, and why the Sponsor turns it on</Label>
            <span className="text-[10px] text-[#7A7A7A]">{offerings.length} offerings · {untracked.length} with no track</span>
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            {offeringTypes.map((t) => {
              const list = offerings.filter((o) => o.type === t.id)
              return (
                <div key={t.id} className="rounded-lg border border-[#E0E0E0] bg-white p-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${typeTone[t.id]}`}>{t.name}</span>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-[#7A7A7A]">
                    <span className="font-semibold text-[#474747]">Consumes:</span> {t.consumes} · <span className="font-semibold text-[#474747]">Pays:</span> {t.pays}
                  </p>
                  <p className="text-[10px] leading-relaxed text-[#7A7A7A]">
                    <span className="font-semibold text-[#474747]">Why the Sponsor turns it on:</span> {t.why}
                  </p>
                  <div className="mt-2 space-y-1.5">
                    {list.map((o) => (
                      <OfferingCell key={o.id} o={o} navigate={navigate} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <Band tone="resident" title="The Resident" sub="The end user, not the decision-maker. Enrolls in offerings, satisfies required lines with the default or an alternative (own HO4 or outside policy for coverage, a deposit instead of HBG), pays for the services, uses the programs, files the claim, earns the points, books the clubhouse. The goal is that the experience and the offerings are compelling enough that the resident keeps the app and the policies after moving out. That is not a given: a resident who bought only the insurance the lease required has no reason to.">
          User
        </Band>

        <div className={`rounded-xl border ${surfaceTone("fulfill").border} ${surfaceTone("fulfill").soft} p-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${surfaceTone("fulfill").solid}`}>{fulfill.title}</span>
              <span className="text-sm font-semibold">{fulfill.subtitle}</span>
              <span className="text-[11px] text-[#7A7A7A]">{fulfill.tagline}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <Owner name={fulfill.owner} prefix="Coordinator:" />
              <TrackList areaId={fulfill.id} navigate={navigate} />
            </div>
          </div>
          <div className="mt-2 grid gap-2 md:grid-cols-5">
            {fulfillers.map((f) => {
              const list = offerings.filter((o) => o.fulfiller === f.id)
              return (
                <div key={f.id} className="rounded-lg border border-[#CCCCCC] bg-white px-2.5 py-2">
                  <p className="text-[11px] font-semibold text-[#161616]">{f.name}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-[#7A7A7A]">{f.meaning}</p>
                  <p className="mt-1 text-[10px] text-[#474747]">
                    <span className="font-semibold">e.g.</span> {f.examples}
                  </p>
                  {list.length > 0 ? (
                    <p className="mt-1 flex flex-wrap gap-1">
                      {list.map((o) => (
                        <span key={o.id} className="rounded-full border border-[#E0E0E0] bg-[#F7F7F7] px-1.5 py-0.5 text-[9px] text-[#474747]">
                          {o.name}
                        </span>
                      ))}
                    </p>
                  ) : null}
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-[11px] leading-5 text-[#474747]">{fulfill.why}</p>
        </div>
      </div>

      {/* Vocabulary */}
      <section className="rounded-xl border border-[#E0E0E0] bg-white p-5">
        <h3 className="text-sm font-semibold">Vocabulary, and where it is borrowed from</h3>
        <p className="mt-1 text-xs leading-5 text-[#7A7A7A]">
          Two parties decide, so no word does double duty. The Customer <span className="font-semibold text-[#161616]">sponsors</span> an offering; the Resident <span className="font-semibold text-[#161616]">enrolls</span> in it, or <span className="font-semibold text-[#161616]">satisfies</span> a required line with an alternative. A required line is met one way or another; only how it is met changes. The roles come from employer voluntary benefits, the money words from CPG retail, the conversion word from embedded insurance.
        </p>
        <dl className="mt-3 grid gap-3 md:grid-cols-2">
          {model.vocabulary.map((v) => (
            <div key={v.term} className="rounded-lg border border-[#F2F2F2] bg-[#F7F7F7] p-3">
              <dt className="text-xs font-semibold text-[#161616]">{v.term}</dt>
              <dd className="mt-0.5 text-[11px] leading-4 text-[#474747]">{v.meaning}</dd>
              <dd className="mt-1 text-[10px] leading-4 text-[#7A7A7A]">
                <span className="font-semibold uppercase tracking-wide">Precedent: </span>
                {v.precedent}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Patterns */}
      <section>
        <h3 className="text-sm font-semibold">Why Homebody does not behave like the rest of Entrata</h3>
        <p className="mt-1 text-xs leading-5 text-[#7A7A7A]">
          Entrata delivers value in three patterns. The company is built for the first. Homebody is the third: the Sponsor, the Resident, and the Fulfiller are three different parties, and most of the friction in this war room comes from running that with first-pattern habits.
        </p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-[#E0E0E0] bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E0E0E0] text-[10px] uppercase tracking-wide text-[#7A7A7A]">
                <th className="px-3 py-2 font-semibold">Pattern</th>
                <th className="px-3 py-2 font-semibold">Who buys or sponsors</th>
                <th className="px-3 py-2 font-semibold">User</th>
                <th className="px-3 py-2 font-semibold">What is delivered</th>
                <th className="px-3 py-2 font-semibold">Fulfiller</th>
                <th className="px-3 py-2 font-semibold">Examples</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2] align-top">
              {patterns.map((pt) => {
                const isHomebody = pt.id === "service-to-resident"
                return (
                  <tr key={pt.id} className={isHomebody ? "bg-[#EAF1EE]" : ""}>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-[#161616]">{pt.name}</span>
                      <span className="mt-0.5 block text-[10px] text-[#7A7A7A]">{pt.note}</span>
                    </td>
                    <td className="px-3 py-2 text-[#474747]">{pt.buyer}</td>
                    <td className="px-3 py-2 text-[#474747]">{pt.user}</td>
                    <td className="px-3 py-2 text-[#474747]">{pt.delivered}</td>
                    <td className="px-3 py-2 text-[#474747]">{pt.fulfillment}</td>
                    <td className="px-3 py-2 text-[#474747]">{pt.examples}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* How to read it */}
      <section className="rounded-xl border border-[#E0E0E0] bg-white p-5 text-sm leading-6 text-[#474747]">
        <h3 className="text-sm font-semibold text-[#161616]">How to read it</h3>
        <ol className="mt-2 list-decimal space-y-1.5 pl-5">
          <li>
            <span className="font-semibold text-[#161616]">Sponsor, Resident, and Fulfiller are three different parties.</span> In core Entrata the buyer is the user and Entrata fulfills by shipping software. In Homebody the Customer sponsors, the Resident enrolls, and a fulfillment team, a partner, or the Sponsor's own vendor delivers. Contracts follow the Fulfiller, not the surface.
          </li>
          <li>
            <span className="font-semibold text-[#161616]">The app is the mechanism, not the value.</span> A resident logs in to reach an offering or to complain about one. The value is the policy that pays a claim, the tradeline at the bureau, the points that post. Measure the offering, and treat the app as the access rate to it.
          </li>
          <li>
            <span className="font-semibold text-[#161616]">Sign is Entrata's surface; Pay and Live are Homebody's.</span> Lease checkout belongs to the leasing product. Homebody is featured there on the Customer's behalf and negotiates for placement. Pay is the surface Homebody owns outright and is where the old Resident Portal is being retired. Live is the service desk and the community.
          </li>
          <li>
            <span className="font-semibold text-[#161616]">"Required" only exists on Sign.</span> Proof of insurance and a deposit or deposit alternative are lease conditions the Customer sets. That makes the Customer liable when fulfillment fails, which is why IVS and billing integrity are fulfillment tracks and not product bugs.
          </li>
          <li>
            <span className="font-semibold text-[#161616]">Type and Fulfiller are separate axes.</span> Who pays tells you why the Sponsor turns an offering on. Who fulfills tells you where it breaks and who signs the contract. Insurance is resident-paid and team-fulfilled with embedded carriers; Rewards is Sponsor-paid and partner-fulfilled; the laundry link is Sponsor-provided and vendor-fulfilled.
          </li>
          <li>
            <span className="font-semibold text-[#161616]">Resident Pulse is the oddball.</span> The Sponsor is the real consumer (of the signal) and fulfillment is a build, not an operation: inject the survey at the right workflow step and join it to the event in the unified data layer. It behaves like pattern-1 software inside a pattern-3 portfolio.
          </li>
          <li>
            <span className="font-semibold text-[#161616]">Live is foot traffic for Pay.</span> Claims, documents, Rewards, Resident Pulse, reservations, the bulletin board, and linked apps give the resident a reason to open the app between rent payments. Without them the app is a monthly bill and the optional offerings go unseen.
          </li>
          <li>
            <span className="font-semibold text-[#161616]">Sell-in comes before sell-through.</span> Every offering is sponsored per property. Distribution (share of doors where it is sponsored) is the number in front of every attach and enrollment number, and it does not have an owner yet. Velocity, enrollments per 100 sponsored doors, is the number that says whether a line deserves its shelf.
          </li>
        </ol>
      </section>

      {/* Offerings table */}
      <section>
        <h3 className="text-sm font-semibold">Offerings</h3>
        <p className="mt-1 text-xs text-[#7A7A7A]">Contracts are hypotheses until someone confirms them; each cell says so.</p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-[#E0E0E0] bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E0E0E0] text-[10px] uppercase tracking-wide text-[#7A7A7A]">
                <th className="px-3 py-2 font-semibold">Offering</th>
                <th className="px-3 py-2 font-semibold">Reached on</th>
                <th className="px-3 py-2 font-semibold">Required or optional</th>
                <th className="px-3 py-2 font-semibold">Who pays whom</th>
                <th className="px-3 py-2 font-semibold">Fulfilled by</th>
                <th className="px-3 py-2 font-semibold">Contracts</th>
                <th className="px-3 py-2 font-semibold">Owner</th>
                <th className="px-3 py-2 font-semibold">Tracks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2] align-top">
              {offerings.map((o) => {
                const ts = tracksForOffering(o.id)
                const t = offeringTypeById(o.type)
                const f = fulfillerById(o.fulfiller)
                return (
                  <tr key={o.id}>
                    <td className="px-3 py-2">
                      <span className="font-semibold text-[#161616]">{o.name}</span>
                      <span className={`mt-1 block w-fit rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${typeTone[o.type]}`}>{t?.name}</span>
                      {o.note ? <span className="mt-1 block text-[10px] text-[#7A7A7A]">{o.note}</span> : null}
                    </td>
                    <td className="px-3 py-2"><SurfaceChips ids={o.surfaces} /></td>
                    <td className="px-3 py-2 text-[#474747]">{o.requirement}</td>
                    <td className="px-3 py-2 text-[#474747]">{o.money}</td>
                    <td className="px-3 py-2 text-[#474747]">
                      <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#7A7A7A]">{f?.name}</span>
                      <span className={/to confirm/i.test(o.fulfillment) ? "text-[#8A6B00]" : ""}>{o.fulfillment}</span>
                    </td>
                    <td className={`px-3 py-2 ${/to confirm/i.test(o.contracts) ? "text-[#8A6B00]" : "text-[#474747]"}`}>{o.contracts}</td>
                    <td className="px-3 py-2">
                      <Owner name={o.owner} />
                    </td>
                    <td className="px-3 py-2">
                      {ts.length === 0 ? (
                        <span className="text-[#8A6B00]">none</span>
                      ) : (
                        <span className="flex flex-wrap gap-1">
                          {ts.map((tr) => (
                            <TrackNumber key={tr.id} n={tr.number} onClick={() => navigate({ tab: "tracks", track: tr.number })} />
                          ))}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Economics: revenue next to attention, with insurance split by line */}
      <section>
        <h3 className="text-sm font-semibold">Economics by line</h3>
        <p className="mt-1 text-xs leading-5 text-[#7A7A7A]">
          Revenue next to attention, per offering, with Insurance split into its lines because the lines do not share economics or attention. Attention is counted from this repo: the tracks that move a line plus the live client threads tagged with it, over the {tracks.length} tracks and{" "}
          {clients.filter((c) => c.heat !== "idle").length} client threads the room is carrying. Revenue is blank until the owner supplies it; the comparison is the point. Insurance lines are owned by Josh Tebbs, who runs the agency.
        </p>
        <div className="mt-2 overflow-x-auto rounded-xl border border-[#E0E0E0] bg-white">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E0E0E0] text-[10px] uppercase tracking-wide text-[#7A7A7A]">
                <th className="px-3 py-2 font-semibold">Line or offering</th>
                <th className="px-3 py-2 font-semibold">Owner</th>
                <th className="px-3 py-2 font-semibold">Revenue and what Entrata keeps</th>
                <th className="px-3 py-2 font-semibold">Distribution and enrollment</th>
                <th className="px-3 py-2 font-semibold">Attention</th>
                <th className="px-3 py-2 font-semibold">Role beyond revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F2F2] align-top">
              {offerings.map((o) => {
                const ls = lines.filter((l) => l.offering === o.id)
                const t = offeringTypeById(o.type)
                return [
                  <EconRow
                    key={o.id}
                    name={o.name}
                    badge={<span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${typeTone[o.type]}`}>{t?.name}</span>}
                    sub={ls.length ? `${ls.length} lines below` : undefined}
                    owner={o.owner}
                    econ={o.economics}
                    attention={attentionForOffering(o)}
                    navigate={navigate}
                    group={ls.length > 0}
                  />,
                  ...ls.map((l) => (
                    <EconRow
                      key={l.id}
                      name={l.name}
                      sub={l.requirement}
                      owner={l.owner}
                      econ={l.economics}
                      attention={attentionForLine(l)}
                      navigate={navigate}
                      indent
                      path={l.path}
                    />
                  )),
                ]
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[11px] text-[#7A7A7A]">
          Which lines a track moves is set per track (<code>lines</code> in <code>tracks.json</code>); which lines a client thread touches comes from its product tags in <code>clients.json</code>. Track #5, the Sign funnel, is counted against Master Policy and HO4 only: the coverage choice at checkout. Confirm with Jae Lee.
        </p>
      </section>

      {/* Gaps */}
      <section className="rounded-xl border border-[#F2DEA3] bg-[#FFF3D1] p-5 text-sm leading-6 text-[#474747]">
        <h3 className="text-sm font-semibold text-[#161616]">What the model exposes today</h3>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <HbgGap />
          <li>
            {tracks.filter((t) => t.offerings.includes("insurance")).length} of {tracks.length} tracks are about insurance. {untracked.length} of {offerings.length} offerings have no track:{" "}
            {untracked.map((o) => o.name).join(", ")}.
          </li>
          <li>Pay has one track (migration) and no track about what is offered once residents are in it. Live has one track (Rewards) and nothing on claims, policy documents, Resident Pulse, or community features.</li>
          <li>
            {unownedAreas.length === 0 ? "Every surface has a named coordinator." : `${unownedAreas.length} surface${unownedAreas.length === 1 ? "" : "s"} without a named coordinator: ${unownedAreas.map((a) => a.title).join(", ")}.`}
            {unownedAreas.some((a) => a.id === "fulfill") ? " Fulfill in particular spans the insurance agency, the Logan team, and the partner relationships, and has no single name." : null}
          </li>
          <li>Every contracts cell is "to confirm." No one has written down yet who contracts with whom per offering, and that is the question behind most of the partner and liability threads.</li>
          <li>
            {missingMetrics.length} of {model.programMetrics.length + areas.length} headline numbers are blank: {missingMetrics.map((m) => `${m.label} (${m.needs ?? "owner"})`).join("; ")}.
          </li>
          <li>Distribution has no owner yet: doors per offering where the Sponsor has turned it on. It is the sell-in number in front of every attach and enrollment number here.</li>
          <li>No fulfillment metric exists in this war room: claims cycle time, policy issuance lag, bureau reporting accuracy, opt-out handling. Today's client heat is fulfillment heat, measured only as escalations.</li>
        </ul>
      </section>
    </div>
  )
}

function Band({ tone, title, sub, children }: { tone: "customer" | "resident"; title: string; sub: string; children: ReactNode }) {
  const cls = tone === "customer" ? "border-[#1F3A5F] bg-[#1F3A5F] text-white" : "border-[#C3CEDF] bg-[#EAEEF5] text-[#1F3A5F]"
  const subCls = tone === "customer" ? "text-white/80" : "text-[#4A5B74]"
  return (
    <div className={`rounded-xl border px-4 py-3 ${cls}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold">{title}</span>
        <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${tone === "customer" ? "bg-white/15" : "bg-[#C3CEDF]"}`}>{children}</span>
      </div>
      <p className={`mt-1 text-[11px] leading-5 ${subCls}`}>{sub}</p>
    </div>
  )
}

function SurfaceChips({ ids }: { ids: string[] }) {
  return (
    <span className="inline-flex flex-wrap gap-1">
      {ids.map((id) => (
        <span key={id} className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${surfaceTone(id).chip}`}>
          {areas.find((a) => a.id === id)?.title ?? id}
        </span>
      ))}
    </span>
  )
}

function MetricCell({ m }: { m: Metric }) {
  if (m.value == null) {
    return (
      <span className="block text-[#8A6B00]">
        <span className="block text-[10px] leading-4">{m.label}</span>
        <span className="font-semibold">needs {m.needs ?? "owner"}</span>
      </span>
    )
  }
  return (
    <span className="block">
      <span className="block text-[10px] leading-4 text-[#7A7A7A]">{m.label}</span>
      <span className="font-semibold text-[#161616]">{m.value}</span>
      {m.source ? <span className="block text-[10px] text-[#B8B8B8]">{m.source}</span> : null}
    </span>
  )
}

function AttentionCell({ a, navigate }: { a: Attention; navigate: (r: Route) => void }) {
  const pct = Math.round(a.share * 100)
  const tone = pct >= 40 ? "bg-[#FFCCD5]" : pct >= 15 ? "bg-[#F2DEA3]" : "bg-[#BFDBFE]"
  return (
    <span className="block w-32">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-semibold text-[#161616]">{pct}%</span>
        <span className="text-[10px] text-[#7A7A7A]">
          {a.tracks.length} track{a.tracks.length === 1 ? "" : "s"} · {a.clients.length} client{a.clients.length === 1 ? "" : "s"}
        </span>
      </span>
      <span className="mt-1 block h-1.5 w-full overflow-hidden rounded bg-[#F2F2F2]">
        <span className={`block h-full ${tone}`} style={{ width: `${Math.max(pct, 1)}%` }} />
      </span>
      {a.tracks.length > 0 ? (
        <span className="mt-1 flex flex-wrap gap-1">
          {a.tracks.map((t) => (
            <TrackNumber key={t.id} n={t.number} onClick={() => navigate({ tab: "tracks", track: t.number })} />
          ))}
        </span>
      ) : null}
      {a.clients.length > 0 ? <span className="mt-1 block text-[10px] text-[#7A7A7A]">{a.clients.map((c) => c.name).join(", ")}</span> : null}
    </span>
  )
}

function EconRow({
  name,
  badge,
  sub,
  owner,
  econ,
  attention,
  navigate,
  indent,
  group,
  path,
}: {
  name: string
  badge?: ReactNode
  sub?: string
  owner: string
  econ: Economics
  attention: Attention
  navigate: (r: Route) => void
  indent?: boolean
  group?: boolean
  path?: string
}) {
  return (
    <tr className={group ? "bg-[#F7F7F7]" : undefined}>
      <td className={`px-3 py-2 ${indent ? "pl-7" : ""}`}>
        <span className="flex flex-wrap items-center gap-1.5">
          <span className="font-semibold text-[#161616]">{name}</span>
          {badge}
        </span>
        {path ? <span className={`mt-1 block w-fit rounded px-1.5 py-0.5 text-[9px] font-semibold ${/alternative/i.test(path) ? "bg-[#F2DEA3] text-[#8A6B00]" : /default|required/i.test(path) ? "bg-[#96F5A9] text-[#004B37]" : "bg-[#F2F2F2] text-[#474747]"}`}>{path}</span> : null}
        {sub ? <span className="mt-1 block w-44 text-[10px] leading-4 text-[#7A7A7A]">{sub}</span> : null}
      </td>
      <td className="px-3 py-2">
        <Owner name={owner} />
      </td>
      <td className="px-3 py-2">
        <MetricCell m={econ.revenue} />
        <span className="mt-1.5 block">
          <MetricCell m={{ ...econ.share, label: econ.share.label ? `Entrata keeps: ${econ.share.label.toLowerCase()}` : "Entrata keeps" }} />
        </span>
        {econ.extra?.map((m) => (
          <span key={m.label} className="mt-1.5 block">
            <MetricCell m={m} />
          </span>
        ))}
      </td>
      <td className="px-3 py-2">
        <MetricCell m={econ.distribution} />
        <span className="mt-1.5 block">
          <MetricCell m={econ.enrolled} />
        </span>
      </td>
      <td className="px-3 py-2">
        <AttentionCell a={attention} navigate={navigate} />
      </td>
      <td className={`max-w-xs px-3 py-2 text-[11px] leading-4 ${/to confirm/i.test(econ.role) ? "text-[#8A6B00]" : "text-[#474747]"}`}>{econ.role}</td>
    </tr>
  )
}

/** The HBG question, stated from the data: attention share now, revenue share blank. */
function HbgGap() {
  const hbg = lines.find((l) => l.id === "hbg")
  if (!hbg) return null
  const a = attentionForLine(hbg)
  const pct = Math.round(a.share * 100)
  return (
    <li>
      <span className="font-semibold text-[#161616]">HBG is {pct}% of the room's attention</span> ({a.tracks.length} of {tracks.length} tracks, {a.clients.length} of {clients.filter((c) => c.heat !== "idle").length} client threads) and{" "}
      {hbg.economics.revenue.value == null ? (
        <>
          its share of revenue is not written down yet. Until {hbg.economics.revenue.needs} supplies revenue net of claims, the room cannot say whether this much energy is appropriate.
        </>
      ) : (
        <>its revenue is {hbg.economics.revenue.value}.</>
      )}
    </li>
  )
}

function SurfaceCard({ area, navigate }: { area: Area; navigate: (r: Route) => void }) {
  const entrata = area.runBy === "Entrata"
  const tone = surfaceTone(area.id)
  return (
    <div className={`flex flex-col rounded-xl border p-3 ${tone.border} ${tone.soft} ${entrata ? "border-dashed" : ""}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5">
          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${tone.solid}`}>{area.title}</span>
          <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${entrata ? "bg-[#F2DEA3] text-[#8A6B00]" : "bg-[#96F5A9] text-[#004B37]"}`}>{area.runBy}'s surface</span>
        </span>
        <TrackList areaId={area.id} navigate={navigate} />
      </div>
      <h4 className="mt-2 text-sm font-semibold">{area.subtitle.split(" · ")[0]}</h4>
      <p className="text-[11px] text-[#474747]">{area.tagline}</p>
      <ul className="mt-2 space-y-0.5 text-[10px] text-[#474747]">
        {area.parts?.map((p) => (
          <li key={p} className="flex gap-1.5">
            <span className="text-[#B8B8B8]">·</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex-1 text-[10px] leading-relaxed text-[#7A7A7A]">{area.why}</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#F2F2F2] pt-2 text-[10px]">
        <Owner name={area.owner} prefix="Coordinator:" />
        <span className={area.metric.value == null ? "text-[#8A6B00]" : "text-[#474747]"}>
          {area.metric.label}: <span className="font-semibold">{area.metric.value ?? `needs ${area.metric.needs ?? "owner"}`}</span>
        </span>
      </div>
    </div>
  )
}

function OfferingCell({ o, navigate }: { o: Offering; navigate: (r: Route) => void }) {
  const ts = tracksForOffering(o.id)
  const empty = ts.length === 0
  const f = fulfillerById(o.fulfiller)
  return (
    <div className={`rounded-lg border px-2.5 py-2 ${empty ? "border-dashed border-[#CCCCCC] bg-[#F7F7F7]" : "border-[#E0E0E0] bg-[#F7F7F7]"}`}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-semibold text-[#161616]">{o.name}</span>
        {empty ? (
          <span className="shrink-0 text-[9px] font-semibold text-[#8A6B00]">no track</span>
        ) : (
          <span className="flex shrink-0 flex-wrap justify-end gap-1">
            {ts.map((t) => (
              <TrackNumber key={t.id} n={t.number} onClick={() => navigate({ tab: "tracks", track: t.number })} />
            ))}
          </span>
        )}
      </div>
      <p className="mt-0.5 text-[10px] text-[#7A7A7A]">
        <span className="font-semibold text-[#474747]">Fulfilled by:</span> {f?.name}
        {" · "}
        <SurfaceChips ids={o.surfaces} />
      </p>
      <p className="mt-0.5 text-[10px]">
        <Owner name={o.owner} />
      </p>
    </div>
  )
}

function TrackList({ areaId, navigate }: { areaId: string; navigate: (r: Route) => void }) {
  const ts = tracksFor(areaId)
  if (ts.length === 0) return <span className="text-[9px] font-semibold text-[#8A6B00]">no tracks</span>
  return (
    <span className="flex flex-wrap justify-end gap-1">
      {ts.map((t) => (
        <TrackNumber key={t.id} n={t.number} onClick={() => navigate({ tab: "tracks", track: t.number })} />
      ))}
    </span>
  )
}
