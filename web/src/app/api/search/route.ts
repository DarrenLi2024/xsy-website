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
    const results: Record<string, any[]> = { companies: [], articles: [], products: [] };

    if (type === "all" || type === "companies") {
      const res = await client.index("companies").search(q, { limit });
      results.companies = res.hits.map((h: any) => ({
        id: h.id,
        name: h.name,
        slug: h.slug,
        industry: h.industry,
        city: h.city,
      }));
    }

    if (type === "all" || type === "articles") {
      const res = await client.index("articles").search(q, { limit });
      results.articles = res.hits.map((h: any) => ({
        id: h.id,
        title: h.title,
        slug: h.slug,
        category: h.category,
        summary: h.summary?.slice(0, 200),
      }));
    }

    if (type === "all" || type === "products") {
      const res = await client.index("products").search(q, { limit });
      results.products = res.hits.map((h: any) => ({
        id: h.id,
        name: h.name,
        category: h.category,
        companyId: h.companyId,
      }));
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Meilisearch error:", error);
    // Fallback: return empty results
    return NextResponse.json(
      { companies: [], articles: [], products: [], error: "搜索服务暂不可用" },
      { status: 200 },
    );
  }
}
