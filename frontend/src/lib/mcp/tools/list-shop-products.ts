import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { SHOP_PRODUCTS } from "../../../data/shopProducts";

export default defineTool({
  name: "list_shop_products",
  title: "List shop products",
  description:
    "Return the public Lovanet shop catalog (posters, apparel, sneakers, manga, music, daily). Supports optional category filter and result limit.",
  inputSchema: {
    category: z
      .enum(["poster", "collector", "apparel", "sneakers", "music", "manga", "daily"])
      .optional()
      .describe("Restrict the results to a single category."),
    limit: z.number().int().min(1).max(200).optional().describe("Maximum number of products to return (default 50)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ category, limit }) => {
    const max = limit ?? 50;
    const filtered = category ? SHOP_PRODUCTS.filter((p) => p.category === category) : SHOP_PRODUCTS;
    const items = filtered.slice(0, max);
    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: { count: items.length, total: filtered.length, items },
    };
  },
});