import type { CollectionEntry } from "astro:content";

type CaseStudy = CollectionEntry<"case-studies">;

// Sort newest first — used for the archive grid order and as the tiebreak
// when scoring related case studies.
export function sortByDateDesc(entries: CaseStudy[]): CaseStudy[] {
  return [...entries].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// The featured case study: whichever entry has `featured: true` (first one
// wins if more than one is ever marked), falling back to the most recent
// entry so the archive still has a featured slot even before anyone flags
// one explicitly.
export function getFeatured(entries: CaseStudy[]): CaseStudy | undefined {
  const marked = entries.find((e) => e.data.featured);
  if (marked) return marked;
  return sortByDateDesc(entries)[0];
}

// Related case studies: a manual `related` slug list always wins (in the
// order given). Otherwise, score every other entry by how many `services`
// tags it shares with the current one, sort by score desc then date desc,
// and take the top N. Entries with zero overlap are excluded rather than
// padded in — a "related" list with nothing genuinely related is worse
// than a short one.
export function getRelatedCaseStudies(
  current: CaseStudy,
  all: CaseStudy[],
  count = 3
): CaseStudy[] {
  const others = all.filter((e) => e.slug !== current.slug);

  if (current.data.related?.length) {
    const bySlug = new Map(others.map((e) => [e.slug, e]));
    return current.data.related
      .map((slug) => bySlug.get(slug))
      .filter((e): e is CaseStudy => Boolean(e))
      .slice(0, count);
  }

  const currentServices = new Set(current.data.services);
  const scored = others
    .map((entry) => ({
      entry,
      score: entry.data.services.filter((s) => currentServices.has(s)).length,
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || b.entry.data.date.valueOf() - a.entry.data.date.valueOf());

  return scored.slice(0, count).map((s) => s.entry);
}
