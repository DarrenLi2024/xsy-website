import { NextRequest, NextResponse } from "next/server";
import { getSearchClient } from "@/lib/search";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const type = url.searchParams.get("type") || "all";
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")));

  if (!q) {
    return NextResponse.json({ companies: [], articles: [], products: [] });
  }

  try {
    const client = getSearchClient();
    const results: Record<string, unknown[]> = { companies: [], articles: [], products: [] };

    const [companiesRes, articlesRes, productsRes] = await Promise.all([
      type === "all" || type === "companies"
        ? client.index("companies").search(q, { limit })
        : Promise.resolve({ hits: [] as Record<string, unknown>[] }),
      type === "all" || type === "articles"
        ? client.index("articles").search(q, { limit })
        : Promise.resolve({ hits: [] as Record<string, unknown>[] }),
      type === "all" || type === "products"
        ? client.index("products").search(q, { limit })
        : Promise.resolve({ hits: [] as Record<string, unknown>[] }),
    ]);

    if (type === "all" || type === "companies") {
      results.companies = companiesRes.hits.map((h) => {
        const hit = h as Record<string, unknown>;
        return {
          id: hit.id,
          name: hit.name,
          slug: hit.slug,
          industry: hit.industry,
          city: hit.city,
        };
      });
    }

    if (type === "all" || type === "articles") {
      results.articles = articlesRes.hits.map((h) => {
        const hit = h as Record<string, unknown>;
        const summary = typeof hit.summary === "string" ? hit.summary : "";
        return {
          id: hit.id,
          title: hit.title,
          slug: hit.slug,
          category: hit.category,
          summary: summary.slice(0, 200),
        };
      });
    }

    if (type === "all" || type === "products") {
      results.products = productsRes.hits.map((h) => {
        const hit = h as Record<string, unknown>;
        return {
          id: hit.id,
          name: hit.name,
          category: hit.category,
          companyId: hit.companyId,
        };
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Meilisearch error:", error);
    return NextResponse.json(
      { companies: [], articles: [], products: [], error: "搜索服务暂不可用" },
      { status: 200 },
    );
  }
}
