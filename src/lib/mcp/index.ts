import { auth, defineMcp } from "@lovable.dev/mcp-js";
import echoTool from "./tools/echo";
import listShopProductsTool from "./tools/list-shop-products";
import listShopCategoriesTool from "./tools/list-shop-categories";
import searchShopProductsTool from "./tools/search-shop-products";

// The OAuth issuer MUST be the direct Supabase host (never the .lovable.cloud
// proxy), built from the project ref that Vite inlines at build time. See
// app-mcp-server-authoring knowledge for the rationale.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID || ((globalThis as any).LOVABLE_SUPABASE_PROJECT_ID ?? "project-ref-unset");

export default defineMcp({
  name: "lovanet-mcp",
  title: "Lovanet MCP",
  version: "0.1.0",
  instructions:
    "Tools exposing the public Lovanet catalog. Use `echo` to test connectivity, `list_shop_categories` to discover categories, `list_shop_products` to browse products, and `search_shop_products` to search by keyword, price, source, type, stock, and category.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [echoTool, listShopCategoriesTool, listShopProductsTool, searchShopProductsTool],
});