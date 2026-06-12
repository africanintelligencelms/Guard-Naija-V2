import mongoose, { Schema } from "mongoose";

/**
 * Security news via RSS from Nigerian outlets — deterministic, free, and no
 * LLM in the retrieval path (replaces the old Gemini search-grounding hack).
 * Cached in Mongo for 6 hours; stale cache is served if all feeds fail.
 */

const FEEDS = [
  { source: "Punch", url: "https://punchng.com/feed/" },
  { source: "Premium Times", url: "https://www.premiumtimesng.com/feed" },
  { source: "Channels TV", url: "https://www.channelstv.com/feed/" },
  { source: "Daily Trust", url: "https://dailytrust.com/feed/" },
];

const SECURITY_KEYWORDS =
  /kidnap|bandit|robber|insecurit|gunmen|attack|terror|abduct|herdsmen|boko|police|military|troops|insurgen|cultis|vigilante/i;

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  url: string;
  time: string;
}

const newsCacheSchema = new Schema({
  key: { type: String, unique: true },
  items: Schema.Types.Mixed,
  fetchedAt: Number,
});
const NewsCache = mongoose.model("NewsCache", newsCacheSchema);

function extract(tag: string, xml: string): string {
  const m =
    xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`)) ||
    xml.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`));
  return (m?.[1] || "").trim();
}

async function fetchFeed(source: string, url: string): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "GuardNG/1.0 (+https://guardng.app)" },
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items = xml.match(/<item>[\s\S]*?<\/item>/g) || [];
    return items
      .map((item, i) => ({
        id: `${source}-${i}`,
        headline: extract("title", item),
        source,
        url: extract("link", item),
        time: extract("pubDate", item) || "Recent",
      }))
      .filter((n) => n.headline && SECURITY_KEYWORDS.test(n.headline));
  } catch {
    return []; // a single dead feed must never break the endpoint
  } finally {
    clearTimeout(timer);
  }
}

export async function getSecurityNews(): Promise<NewsItem[]> {
  const cached = await NewsCache.findOne({ key: "latest" });
  if (cached && Date.now() - (cached.fetchedAt || 0) < CACHE_TTL_MS) {
    return cached.items as NewsItem[];
  }

  const results = await Promise.all(
    FEEDS.map((f) => fetchFeed(f.source, f.url))
  );
  const items = results.flat().slice(0, 10);

  if (items.length > 0) {
    await NewsCache.updateOne(
      { key: "latest" },
      { items, fetchedAt: Date.now() },
      { upsert: true }
    );
    return items;
  }
  // All feeds failed — serve stale cache rather than nothing
  return (cached?.items as NewsItem[]) || [];
}
