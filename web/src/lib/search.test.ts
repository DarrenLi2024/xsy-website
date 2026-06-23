import { describe, it, expect } from "vitest";
import { getSearchClient } from "@/lib/search";

describe("Search client", () => {
  it("creates a Meilisearch client", () => {
    const client = getSearchClient();
    expect(client).toBeDefined();
    // Verify it's a singleton
    const client2 = getSearchClient();
    expect(client).toBe(client2);
  });
});
