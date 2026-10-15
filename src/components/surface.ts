/**
 * One color per surface, cascading everywhere a surface appears: the surface rows on Tracks, track numbers,
 * track cards, owner-page tabs and headers, the Model diagram, and surface chips in tables.
 * Keyed by area id from areas.json. Tailwind needs literal class strings, so each tone is spelled out.
 *
 * Palette is Homebody marketing's (homebody.com/pm): emerald #004B37 and the partner-card tints
 * (violet #58355E / #EDE4EF, terracotta #B24A22 / #FBE7DD, gold #8A6B00 / #FFF3D1, green #EAF1EE),
 * plus the brand grays (#474747, #F2F2F2, #E6E6E6). Gold is reserved for "needs a number / needs an owner".
 */
export type SurfaceTone = {
  /** Solid badge: bg + white text. */
  solid: string
  /** Hover for solid buttons. */
  solidHover: string
  /** Tinted background for sections and cards. */
  soft: string
  /** Border in the surface color. */
  border: string
  /** Text in the surface color. */
  text: string
  /** Light chip: tinted bg + colored text. */
  chip: string
  /** Hex for inline styles when a class won't do. */
  hex: string
}

const tones: Record<string, SurfaceTone> = {
  sign: {
    solid: "bg-[#004B37] text-white",
    solidHover: "hover:bg-[#003D2E]",
    soft: "bg-[#EAF1EE]",
    border: "border-[#004B37]",
    text: "text-[#004B37]",
    chip: "bg-[#EAF1EE] text-[#004B37]",
    hex: "#004B37",
  },
  pay: {
    solid: "bg-[#58355E] text-white",
    solidHover: "hover:bg-[#46294B]",
    soft: "bg-[#EDE4EF]",
    border: "border-[#58355E]",
    text: "text-[#58355E]",
    chip: "bg-[#EDE4EF] text-[#58355E]",
    hex: "#58355E",
  },
  live: {
    solid: "bg-[#B24A22] text-white",
    solidHover: "hover:bg-[#953D1B]",
    soft: "bg-[#FBE7DD]",
    border: "border-[#B24A22]",
    text: "text-[#B24A22]",
    chip: "bg-[#FBE7DD] text-[#B24A22]",
    hex: "#B24A22",
  },
  fulfill: {
    solid: "bg-[#474747] text-white",
    solidHover: "hover:bg-[#2E2E2E]",
    soft: "bg-[#F2F2F2]",
    border: "border-[#474747]",
    text: "text-[#474747]",
    chip: "bg-[#E6E6E6] text-[#474747]",
    hex: "#474747",
  },
}

const neutral: SurfaceTone = {
  solid: "bg-[#5C5C5C] text-white",
  solidHover: "hover:bg-[#474747]",
  soft: "bg-[#F7F7F7]",
  border: "border-[#B8B8B8]",
  text: "text-[#5C5C5C]",
  chip: "bg-[#EBEBEB] text-[#5C5C5C]",
  hex: "#5C5C5C",
}

export const surfaceTone = (areaId: string | null | undefined): SurfaceTone => (areaId && tones[areaId]) || neutral
