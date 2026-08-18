// Single source of truth for the 6 core services, used by the case-studies
// filter bar + tag pills + content-collection schema validation. Deliberately
// separate from Header.astro's `serviceLinks` (nav labels are sometimes
// longer/differently worded than the short tag label a filter pill needs —
// e.g. the nav says "AI enablement for marketing teams" but the case-studies
// filter/tag, matching Andrew's own mockup, just says "AI Enablement").
// Keep this list's `key`s in sync with content collection frontmatter
// (`services: [...]`) — the zod enum in `src/content/config.ts` is built
// directly from these keys.
export const SERVICES = [
  { key: "marketing-support", label: "Marketing Support", path: "/services/marketing-support" },
  { key: "consulting-mentoring", label: "Consulting & Mentoring", path: "/services/consulting-mentoring" },
  { key: "google-ads", label: "Google Ads", path: "/services/google-social-ads" },
  { key: "seo-ai-search", label: "SEO & AI Search", path: "/services/seo-ai-search-optimisation" },
  { key: "websites-optimisation", label: "Websites & Optimisation", path: "/services/websites-optimisation" },
  { key: "ai-enablement", label: "AI Enablement", path: "/services/ai-enablement-for-marketing-teams" },
] as const;

export type ServiceKey = (typeof SERVICES)[number]["key"];

export const SERVICE_KEYS = SERVICES.map((s) => s.key) as [ServiceKey, ...ServiceKey[]];

export function serviceLabel(key: string): string {
  return SERVICES.find((s) => s.key === key)?.label ?? key;
}
