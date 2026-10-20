import { team } from "../data"

export function Contribute() {
  return (
    <div className="space-y-4 text-sm leading-6 text-[#474747]">
      <section className="rounded-xl border border-[#E0E0E0] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#161616]">Claim a track</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>Pull latest.</li>
          <li>
            In <code className="text-[#004B37]">src/data/tracks.json</code>, find the track that says <code className="text-[#8A6B00]">"Owner to confirm"</code> and put your name in{" "}
            <code className="text-[#004B37]">owner</code>. Or add a new track under the right <code className="text-[#004B37]">area</code> (sign, pay, live, fulfill) with the <code className="text-[#004B37]">offerings</code> it moves: one outcome, one owner, a due date, a measure of done.
          </li>
          <li>
            Commit with the track number in the message, push to <code className="text-[#004B37]">main</code>.
          </li>
        </ol>
        <p className="mt-3 text-xs text-[#7A7A7A]">
          A track is something you can finish. "HBG" is an area. "HBG renewal requirements locked and shipped" is a track. Functions ("Product", "CS") are not owners.
        </p>
      </section>

      <section className="rounded-xl border border-[#E0E0E0] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#161616]">Build your page</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5">
          <li>
            Copy any file in <code className="text-[#004B37]">src/data/pages/</code> to <code className="text-[#004B37]">src/data/pages/&lt;your-page&gt;.json</code>. It becomes a tab in the top row automatically, after Clients.
          </li>
          <li>
            Set <code className="text-[#004B37]">"page": "&lt;your-page&gt;"</code> on your track so the track card opens your tab when clicked.
          </li>
          <li>
            Sections you can use: <code className="text-[#004B37]">stats</code> (tiles; leave <code>value: null</code> and set <code>needs</code> until you have the number),{" "}
            <code className="text-[#004B37]">table</code>, <code className="text-[#004B37]">checklist</code>, <code className="text-[#004B37]">text</code>,{" "}
            <code className="text-[#004B37]">roadmap</code> (by lane or by Jira keys), <code className="text-[#004B37]">clients</code> (rows linked to your track), <code className="text-[#004B37]">links</code>.
          </li>
          <li>A first version that is one table is fine. The point is that it is yours and it is in git.</li>
        </ol>
        <p className="mt-3 text-xs text-[#7A7A7A]">
          Or open Cursor in this repo and say: update my track to show [what changed]. Due is [date]. Source is [Slack channel or meeting]. Add a tile to my page for [number].
        </p>
      </section>

      <section className="rounded-xl border border-[#E0E0E0] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#161616]">Add a client thread</h2>
        <p className="mt-2">
          Edit <code className="text-[#004B37]">src/data/clients.json</code>. Name the client, the property, and the ticket. Put the CSM in <code className="text-[#004B37]">owner</code>, link the tracks that will de-escalate it, and add an update with a date and source. Leave resident names and resident IDs out of this repo.
        </p>
      </section>

      <section className="rounded-xl border border-[#E0E0E0] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#161616]">What the hygiene agent does</h2>
        <p className="mt-2">
          Twice a week it reads this repo and drafts one DM per owner for: tracks whose due date has passed, tracks with no date, tracks or client threads with no update in 7 days, and open actions. The ask is the same each time: update Mission Control via git with a new date, a scope change, completion, or where you need help. It sends only with approval. Rules live in{" "}
          <code className="text-[#004B37]">docs/agents/hygiene-agent.md</code>.
        </p>
      </section>

      <section className="rounded-xl border border-[#E0E0E0] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#161616]">Who is in the room</h2>
        <p className="mt-1 text-xs text-[#7A7A7A]">
          {team.source} Conveners: {team.conveners.map((p) => p.name).join(" and ")}.
        </p>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {team.roster.map((person) => (
            <li
              key={person.name}
              title={person.seat}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${person.seat === "Standing" ? "border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF]" : "border-[#F2DEA3] bg-[#FFF3D1] text-[#474747]"}`}
            >
              {person.name}
              {person.seat !== "Standing" ? <span className="ml-1 text-[10px] text-[#7A7A7A]">({person.seat.toLowerCase()})</span> : null}
            </li>
          ))}
        </ul>
        <ul className="mt-3 space-y-1">
          {team.openSeats.map((seat) => (
            <li key={seat} className="text-xs text-[#7A7A7A]">
              {seat}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
