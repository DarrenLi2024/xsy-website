import { Meilisearch } from "meilisearch";

const MEILI_HOST = process.env.MEILI_HOST || "http://localhost:7700";
const MEILI_KEY = process.env.MEILI_MASTER_KEY || "xinshiye_search_master_key";

let client: Meilisearch | null = null;

export function getSearchClient(): Meilisearch {
  if (!client) {
    client = new Meilisearch({
      host: MEILI_HOST,
      apiKey: MEILI_KEY,
    });
  }
  return client;
}

export async function ensureIndexes() {
  const c = getSearchClient();

  // Companies index
  try {
    await c.createIndex("companies", { primaryKey: "id" });
  } catch {}
  await c.index("companies").updateFilterableAttributes(["industry", "status"]);
  await c.index("companies").updateSearchableAttributes(["name", "description", "industry", "city"]);
  await c.index("companies").updateSortableAttributes(["createdAt", "name"]);

  // Articles index
  try {
    await c.createIndex("articles", { primaryKey: "id" });
  } catch {}
  await c.index("articles").updateFilterableAttributes(["category", "status"]);
  await c.index("articles").updateSearchableAttributes(["title", "summary", "content"]);
  await c.index("articles").updateSortableAttributes(["publishedAt", "createdAt"]);

  // Products index
  try {
    await c.createIndex("products", { primaryKey: "id" });
  } catch {}
  await c.index("products").updateFilterableAttributes(["category", "companyId"]);
  await c.index("products").updateSearchableAttributes(["name", "description"]);
  await c.index("products").updateSortableAttributes(["createdAt", "name"]);
}
