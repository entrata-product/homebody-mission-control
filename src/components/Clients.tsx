import { useEffect, useState } from "react"
import type { ClientRow } from "../types"
import { clients, clientsMeta, ownerUnconfirmed, trackByNumber } from "../data"
import type { Route } from "../routes"
import { Chip, HeatPill, Label, Owner, TrackNumber, Updates, heatMeta } from "./ui"

const heatOrder = { burning: 0, active: 1, steady: 2, idle: 3 } as const

export function Clients({ navigate, focusClient, filterIds, embedded }: { navigate: (r: Route) => void; focusClient?: string; filterIds?: string[]; embedded?: boolean }) {
  const [openId, setOpenId] = useState<string | null>(focusClient ?? null)

  useEffect(() => {
    if (focusClient) {
      setOpenId(focusClient)
      requestAnimationFrame(() => document.getElementById(`client-${focusClient}`)?.scrollIntoView({ behavior: "smooth", block: "start" }))
    }
  }, [focusClient])

  const rows = clients
    .filter((c) => !filterIds || filterIds.includes(c.id))
    .slice()
    .sort((a, b) => heatOrder[a.heat] - heatOrder[b.heat] || a.name.localeCompare(b.name))

  const needCsm = rows.filter((c) => ownerUnconfirmed(c.owner)).length

  return (
    <div className="space-y-4">
      {!embedded ? (
        <>
        <section className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-semibold">Client threads</h1>
            <p className="mt-1 text-sm leading-6 text-[#474747]">
              Where friction against the revenue goal shows up. One row per client thread, one owner (the CSM who drives the outcome: de-escalation), one next step. If a client is hot and not here, add a row.
            </p>
          </div>
          <div className="shrink-0 text-right text-[11px] text-[#7A7A7A]">
            <span className="block">
              <Owner name={clientsMeta.owner} prefix="Page owner:" />
            </span>
            <span className="mt-1 block">Rows as of {clientsMeta.asOf}</span>
            <span className="mt-0.5 block">
              Edit <code className="text-[#004B37]">src/data/clients.json</code>
            </span>
          </div>
        </section>
        <section>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-md border border-[#E0E0E0] bg-white px-2 py-1 text-[#474747]">{rows.filter((c) => c.heat === "burning").length} burning</span>
            {needCsm > 0 ? (
              <span className="rounded-md border border-[#F2DEA3] bg-[#FFF3D1] px-2 py-1 text-[#8A6B00]">
                {needCsm} thread{needCsm === 1 ? "" : "s"} without a named CSM
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-[11px] text-[#7A7A7A]">{clientsMeta.sourceNote}</p>
        </section>
        </>
      ) : null}

      <ul className="space-y-2">
        {rows.map((c) => (
          <ClientCard key={c.id} client={c} open={openId === c.id} onToggle={() => setOpenId(openId === c.id ? null : c.id)} navigate={navigate} />
        ))}
      </ul>
    </div>
  )
}

function ClientCard({ client, open, onToggle, navigate }: { client: ClientRow; open: boolean; onToggle: () => void; navigate: (r: Route) => void }) {
  const meta = heatMeta[client.heat]
  return (
    <li id={`client-${client.id}`} className={`scroll-mt-28 rounded-xl border ${meta.card}`}>
      <button type="button" onClick={onToggle} className="flex w-full items-start justify-between gap-4 px-4 py-3 text-left" aria-expanded={open}>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold">{client.name}</span>
            <HeatPill heat={client.heat} />
            {client.products.map((p) => (
              <Chip key={p}>
                {p}
              </Chip>
            ))}
            {client.scale ? <span className="text-[11px] text-[#7A7A7A]">{client.scale}</span> : null}
          </span>
          <span className="mt-1 block text-xs text-[#474747]">{client.nextStep}</span>
        </span>
        <span className="shrink-0 text-right text-[11px] text-[#7A7A7A]">
          <span className="block">
            <Owner name={client.owner} prefix="Owner:" />
          </span>
          {client.due ? <span className="mt-1 block">due {client.due}</span> : null}
        </span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-[#E0E0E0] px-4 py-4">
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#7A7A7A]">
            <span>Source: {client.source}</span>
            {client.tracks.length > 0 ? (
              <span className="flex items-center gap-1.5">
                <span>· Tracks:</span>
                {client.tracks.map((n) => {
                  const t = trackByNumber(n)
                  return (
                    <span key={n} title={t?.deliverable}>
                      <TrackNumber n={n} onClick={() => navigate({ tab: "tracks", track: n })} />
                    </span>
                  )
                })}
              </span>
            ) : (
              <span>· No linked track</span>
            )}
          </div>
          <div>
            <Label>Updates ({client.updates.length})</Label>
            <Updates updates={client.updates} />
          </div>
        </div>
      )}
    </li>
  )
}
