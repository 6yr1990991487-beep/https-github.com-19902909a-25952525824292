import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { ALL_PRODUCTS } from "../../../data/generatedProducts";

const CATEGORY_VALUES = ["poster", "collector", "apparel", "sneakers", "music", "manga", "daily"] as const;
const SOURCE_VALUES = ["youtube", "tiktok", "both"] as const;

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

const searchableText = (product: (typeof ALL_PRODUCTS)[number]) =>
  normalize(
    [
      product.name,
      product.description,
      product.tag,
      product.category,
      product.brand,
      product.type,
      product.source,
      ...(product.bullets ?? []),
      ...Object.values(product.specs ?? {}),
    ]
      .filter(Boolean)
      .join(" "),
  );

export default defineTool({
  name: "search_shop_products",
  title: "Search shop products",
  description:
    "Search the Lovanet shop catalog by keyword and filters such as category, product type, source, price range, stock, and sort order.",
  inputSchema: {
    query: z.string().optional().describe("Keyword to search in product names, tags, descriptions, bullets, and specs."),
    category: z.enum(CATEGORY_VALUES).optional().describe("Restrict results to one product category."),
    type: z.enum(["physical", "digital"]).optional().describe("Restrict results to physical or digital products."),
    source: z.enum(SOURCE_VALUES).optional().describe("Restrict results to YouTube, TikTok, or products connected to both."),
    minPrice: z.number().optional().describe("Minimum product price in euros."),
    maxPrice: z.number().optional().describe("Maximum product price in euros."),
    inStockOnly: z.boolean().optional().describe("When true, only return products with stock above zero."),
    sort: z.enum(["relevance", "price_asc", "price_desc", "rating", "sold"]).optional().describe("Result sort order. Default is relevance."),
    limit: z.number().int().min(1).max(100).optional().describe("Maximum number of results to return. Default is 25."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ query, category, type, source, minPrice, maxPrice, inStockOnly, sort, limit }) => {
    const terms = normalize(query ?? "")
      .split(/\s+/)
      .filter(Boolean);
    const max = limit ?? 25;

    const scored = ALL_PRODUCTS.map((product, index) => {
      const haystack = searchableText(product);
      const name = normalize(product.name);
      const tag = normalize(product.tag);
      const score = terms.length
        ? terms.reduce((total, term) => {
            if (name.includes(term)) return total + 8;
            if (tag.includes(term)) return total + 5;
            if (haystack.includes(term)) return total + 2;
            return total;
          }, 0)
        : 1;
      return { product, score, index };
    }).filter(({ product, score }) => {
      if (terms.length && score <= 0) return false;
      if (category && product.category !== category) return false;
      if (type && product.type !== type) return false;
      if (source && product.source !== source) return false;
      if (typeof minPrice === "number" && product.price < minPrice) return false;
      if (typeof maxPrice === "number" && product.price > maxPrice) return false;
      if (inStockOnly && (product.stock ?? 1) <= 0) return false;
      return true;
    });

    const sorted = scored.sort((a, b) => {
      if (sort === "price_asc") return a.product.price - b.product.price;
      if (sort === "price_desc") return b.product.price - a.product.price;
      if (sort === "rating") return (b.product.rating ?? 0) - (a.product.rating ?? 0);
      if (sort === "sold") return (b.product.sold ?? 0) - (a.product.sold ?? 0);
      return b.score - a.score || a.index - b.index;
    });

    const items = sorted.slice(0, max).map(({ product, score }) => ({ ...product, searchScore: score }));

    return {
      content: [{ type: "text", text: JSON.stringify(items, null, 2) }],
      structuredContent: {
        count: items.length,
        total: sorted.length,
        query: query ?? "",
        filters: { category, type, source, minPrice, maxPrice, inStockOnly, sort: sort ?? "relevance" },
        items,
      },
    };
  },
});