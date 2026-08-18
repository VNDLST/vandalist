import { defineCollection, z } from "astro:content";
import { SERVICE_KEYS } from "../lib/services";

// Case studies are a structured content system, not hand-built pages — see
// the `case-studies` pages/components for how this schema drives the
// archive, filter bar, individual template, and related-case-study logic.
// All body sections are OPTIONAL beyond the intro basics: a case study with
// just a summary and an outcome line is a fully valid page (don't force
// every field just for visual symmetry — a future case study is often
// anonymised or lighter on detail than this one).
const caseStudies = defineCollection({
  type: "content",
  schema: () =>
    z.object({
      // --- Identity / intro ---
      title: z.string(), // client/organisation descriptor, e.g. "Gladstone Regional Council" or an anonymised type like "Queensland-based government organisation"
      confidential: z.boolean().default(false), // if true, pages/components should avoid implying the name above is real/public
      outcomeHeadline: z.string(), // the bold "concise outcome or project headline" shown under the descriptor
      summary: z.string(), // short one-liner for cards + meta description
      context: z.string().optional(), // SHORT context paragraph shown right in the intro block (distinct from `situation` below)

      // --- Filtering / classification ---
      services: z.array(z.enum(SERVICE_KEYS)).min(1),
      industry: z.string().optional(),
      location: z.string().optional(),
      engagement: z.string().optional(), // e.g. "Website rebuild & Digital strategy"
      timeframe: z.string().optional(), // e.g. "Jan – Sep 2024"
      date: z.date(), // used for sorting + "most recent" fallbacks, not necessarily displayed

      // --- Media ---
      featuredImage: z.string().optional(), // path under /public; omit to use the placeholder treatment
      featured: z.boolean().default(false),

      // --- Body sections (all optional — see file comment above) ---
      situation: z.string().optional(), // "Context / The situation" — the fuller section (org type, sector, scale, what prompted the engagement), separate from the short intro `context` above
      problem: z.string().optional(),
      findings: z.string().optional(),
      workstreams: z
        .array(
          z.object({
            label: z.string(),
            description: z.string(),
          })
        )
        .optional(),
      reasoning: z.string().optional(),
      outcome: z.string().optional(),
      results: z
        .array(
          z.object({
            value: z.string(), // kept as a string, not a number — some results are qualitative-adjacent ("28%") and we never want to silently coerce/invent one
            label: z.string(),
          })
        )
        .optional(),
      quote: z
        .object({
          text: z.string(),
          attribution: z.string(),
        })
        .optional(),
      evidenceImages: z
        .array(
          z.object({
            src: z.string(),
            alt: z.string(),
          })
        )
        .optional(),

      // --- Related case studies ---
      related: z.array(z.string()).optional(), // manual slug override; falls back to overlapping-services scoring when omitted
    }),
});

export const collections = {
  "case-studies": caseStudies,
};
