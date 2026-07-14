import { defineTool } from "@lovable.dev/mcp-js";
import { SHOP_CATEGORIES } from "../../../data/shopProducts";

export default defineTool({
  name: "list_shop_categories",
  title: "List shop categories",
  description: "Return the list of product categories available in the Lovanet shop.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(SHOP_CATEGORIES, null, 2) }],
    structuredContent: { categories: SHOP_CATEGORIES },
  }),
});