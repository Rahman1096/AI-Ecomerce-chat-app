/**
 * Groq AI Clerk — The Shopkeeper Brain
 * Fully automatic shopkeeper that executes every customer command.
 * Uses Groq's LLaMA model with function calling + local intent detection.
 */

import products from "../data/products";
import {
  semanticSearch,
  checkColor,
  checkSize,
  getRecommendations,
} from "./searchEngine";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

// ─── Build a compact product catalog for the system prompt ──────────────
const PRODUCT_CATALOG = products
  .map(
    (p) =>
      `[ID:${p.id}] ${p.name} — $${p.price} (${
        p.category
      }) colors:${p.colors.join("/")} sizes:${p.sizes.join("/")}`
  )
  .join("\n");

// ─── Stop words that should be ignored in product name matching ─────────
const STOP_WORDS = new Set([
  "item",
  "items",
  "product",
  "products",
  "thing",
  "things",
  "stuff",
  "one",
  "ones",
  "something",
  "anything",
  "everything",
  "the",
  "this",
  "that",
  "those",
  "these",
  "from",
  "for",
  "with",
  "and",
  "but",
  "not",
  "please",
  "just",
  "some",
  "any",
  "all",
  "my",
  "your",
  "our",
  "cart",
  "store",
  "shop",
  "most",
  "least",
  "very",
  "really",
  "super",
  "cheapest",
  "expensive",
  "cheap",
  "pricey",
  "best",
  "worst",
  "good",
  "great",
  "nice",
  "rated",
  "popular",
  "newest",
  "latest",
  "oldest",
  "price",
  "priced",
  "quality",
]);

// ─── Smart product finder (fuzzy name match + semantic search) ──────────
function findProductByName(query) {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  // 1. Exact name match
  const exact = products.find((p) => p.name.toLowerCase() === q);
  if (exact) return exact;

  // 2. Name contains query or query contains name
  const partial = products.find(
    (p) => p.name.toLowerCase().includes(q) || q.includes(p.name.toLowerCase())
  );
  if (partial) return partial;

  // 3. Word-level matching — count how many words overlap (filter stop words)
  const qWords = q
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  if (qWords.length === 0) return null; // all words were stop words
  let bestMatch = null;
  let bestScore = 0;
  let bestNameHits = 0;

  for (const p of products) {
    const pName = p.name.toLowerCase();
    const pWords = pName.split(/\s+/);
    let score = 0;
    let nameHits = 0;

    for (const qw of qWords) {
      for (const pw of pWords) {
        if (pw.includes(qw) || qw.includes(pw)) {
          score += 10;
          nameHits++;
        }
      }
      // Secondary signals — lower weight, NOT enough alone to trigger a match
      if (p.tags.some((t) => t.toLowerCase().includes(qw))) score += 2;
      if (p.category.toLowerCase().includes(qw)) score += 3;
      if (p.subcategory.toLowerCase().includes(qw)) score += 3;
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = p;
      bestNameHits = nameHits;
    }
  }

  // Require at least one NAME word match and a minimum score.
  // Tags/category alone are NOT enough — prevents "laptop" → Minimalist Backpack (laptop tag).
  if (bestMatch && bestScore >= 8 && bestNameHits >= 1) return bestMatch;

  // 4. Fall back to semantic search — higher threshold to avoid tangential matches
  const results = semanticSearch(query, products, 1);
  if (results.length > 0 && results[0].score > 25) {
    return results[0].product;
  }

  return null;
}

// ─── Superlative / Comparative Product Resolver ─────────────────────────
// Handles: cheapest, most expensive, best rated, highest/lowest price, etc.
// Optionally scoped by category: "cheapest shoes", "best rated electronics"

const SUPERLATIVE_RULES = [
  // Price: cheapest / lowest price / most affordable
  {
    patterns: [
      /\bcheapest\b/i,
      /\blowest\s*pric/i,
      /\bmost\s*affordable\b/i,
      /\bleast\s*expensive\b/i,
      /\bmost\s*inexpensive\b/i,
    ],
    sort: (a, b) => a.price - b.price,
  },
  // Price: most expensive / highest price / priciest / costliest
  {
    patterns: [
      /\bmost\s*expensive\b/i,
      /\bhighest\s*pric/i,
      /\bpriciest\b/i,
      /\bcostliest\b/i,
    ],
    sort: (a, b) => b.price - a.price,
  },
  // Rating: best rated / highest rated / top rated / best reviewed
  {
    patterns: [
      /\bbest\s*rat/i,
      /\bhighest\s*rat/i,
      /\btop\s*rat/i,
      /\bbest\s*review/i,
      /\bmost\s*popular\b/i,
      /\bmost\s*review/i,
      /\bfan\s*fav/i,
    ],
    sort: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  },
  // Rating: worst rated / lowest rated
  {
    patterns: [
      /\bworst\s*rat/i,
      /\blowest\s*rat/i,
      /\bleast\s*popular\b/i,
      /\bleast\s*rat/i,
    ],
    sort: (a, b) => a.rating - b.rating,
  },
  // Generic best (combine rating + reviews) — only when "best" is the main word
  {
    patterns: [
      /^(?:the\s+)?best(?:\s+(?:item|product|thing|one))?$/i,
      /\btop\s*pick/i,
      /\bnumber\s*one\b/i,
      /\#1\b/i,
    ],
    sort: (a, b) => b.rating * b.reviews - a.rating * a.reviews,
  },
  // Newest (by ID — higher ID = newer in catalog)
  {
    patterns: [
      /\bnewest\b/i,
      /\blatest\b/i,
      /\bmost\s*recent\b/i,
      /\bnew\s*arrival/i,
      /\bjust\s*(?:arrived|dropped|in)\b/i,
    ],
    sort: (a, b) => b.id - a.id,
  },
  // Oldest — only explicit "oldest" (removed "first"/"original" as too ambiguous)
  {
    patterns: [/\boldest\b/i],
    sort: (a, b) => a.id - b.id,
  },
  // Most discounted (originalPrice - price)
  {
    patterns: [
      /(?:biggest|best|most|highest)\s*discount/i,
      /(?:biggest|best|most)\s*deal/i,
      /(?:biggest|best|most)\s*(?:sale|savings?)\b/i,
      /\bon\s*sale\b/i,
    ],
    sort: (a, b) => b.originalPrice - b.price - (a.originalPrice - a.price),
  },
];

const CATEGORY_KEYWORDS = {
  clothing: "Clothing",
  clothes: "Clothing",
  apparel: "Clothing",
  fashion: "Clothing",
  shirt: "Clothing",
  shirts: "Clothing",
  blazer: "Clothing",
  blazers: "Clothing",
  dress: "Clothing",
  dresses: "Clothing",
  jacket: "Clothing",
  jackets: "Clothing",
  pants: "Clothing",
  trousers: "Clothing",
  accessories: "Accessories",
  accessory: "Accessories",
  jewelry: "Accessories",
  jewellery: "Accessories",
  watch: "Accessories",
  watches: "Accessories",
  bag: "Accessories",
  bags: "Accessories",
  sunglasses: "Accessories",
  electronics: "Electronics",
  electronic: "Electronics",
  tech: "Electronics",
  gadget: "Electronics",
  gadgets: "Electronics",
  headphones: "Electronics",
  speaker: "Electronics",
  speakers: "Electronics",
  shoes: "Shoes",
  shoe: "Shoes",
  footwear: "Shoes",
  sneakers: "Shoes",
  loafers: "Shoes",
  boots: "Shoes",
};

/**
 * Match a category keyword using word boundaries to avoid substring false positives.
 * e.g. "bag" should NOT match inside "baggy".
 */
function matchCategory(query) {
  for (const [keyword, category] of Object.entries(CATEGORY_KEYWORDS)) {
    const regex = new RegExp(`\\b${keyword}s?\\b`, "i");
    if (regex.test(query)) return category;
  }
  return null;
}

/**
 * Resolve superlative/comparative queries like "cheapest item", "most expensive shoes".
 * Returns the matching product or null if not a superlative query.
 */
function resolveSuperlative(query) {
  const q = query.toLowerCase().trim();

  // Check if the query matches any superlative pattern
  for (const rule of SUPERLATIVE_RULES) {
    const matched = rule.patterns.some((p) => p.test(q));
    if (!matched) continue;

    // Check for category scope using word-boundary matching
    let pool = products.filter((p) => p.inStock);
    const category = matchCategory(q);
    if (category) {
      pool = pool.filter((p) => p.category === category);
    }

    // Sort and return the #1 match
    if (pool.length === 0) return null;
    const sorted = [...pool].sort(rule.sort);
    return sorted[0];
  }

  return null;
}

/**
 * Resolve price range queries: "under $50", "around $100", "between $50 and $200".
 * Returns sorted array of matching products or null.
 */
function resolvePriceRange(query) {
  const q = query.toLowerCase().trim();
  let min = 0,
    max = Infinity;

  // "under/below/less than $X" or "cheaper than $X"
  const underMatch = q.match(
    /(?:under|below|less\s*than|cheaper\s*than|max|up\s*to)\s*\$?(\d+(?:\.\d{1,2})?)/i
  );
  if (underMatch) {
    max = parseFloat(underMatch[1]);
  }

  // "over/above/more than $X"
  const overMatch = q.match(
    /(?:over|above|more\s*than|at\s*least|min(?:imum)?)\s*\$?(\d+(?:\.\d{1,2})?)/i
  );
  if (overMatch) {
    min = parseFloat(overMatch[1]);
  }

  // "between $X and $Y" or "$X to $Y" or "$X-$Y"
  const betweenMatch = q.match(
    /(?:between\s+)?\$?(\d+(?:\.\d{1,2})?)\s*(?:and|to|-|–)\s*\$?(\d+(?:\.\d{1,2})?)/i
  );
  if (betweenMatch) {
    min = parseFloat(betweenMatch[1]);
    max = parseFloat(betweenMatch[2]);
    if (min > max) [min, max] = [max, min];
  }

  // "around/about $X" → ±25%
  const aroundMatch = q.match(
    /(?:around|about|approximately|roughly|~)\s*\$?(\d+(?:\.\d{1,2})?)/i
  );
  if (aroundMatch && !underMatch && !overMatch && !betweenMatch) {
    const target = parseFloat(aroundMatch[1]);
    min = target * 0.75;
    max = target * 1.25;
  }

  if (min === 0 && max === Infinity) return null;

  let pool = products.filter(
    (p) => p.inStock && p.price >= min && p.price <= max
  );
  const category = matchCategory(q);
  if (category) {
    pool = pool.filter((p) => p.category === category);
  }

  return pool.length > 0 ? pool.sort((a, b) => a.price - b.price) : null;
}

/**
 * Pick a random product, optionally filtered by category.
 */
function resolveRandom(query) {
  const q = query.toLowerCase().trim();
  if (
    !/\b(?:random|surprise|anything|whatever|you\s*(?:pick|choose|decide)|dealer'?s?\s*choice)\b/i.test(
      q
    )
  )
    return null;

  let pool = products.filter((p) => p.inStock);
  const category = matchCategory(q);
  if (category) {
    pool = pool.filter((p) => p.category === category);
  }
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Resolve "top N" / "N cheapest" / "3 best" style queries.
 * Returns array of products or null.
 */
function resolveSuperlativeMultiple(query) {
  const q = query.toLowerCase().trim();
  const nMatch =
    q.match(
      /\b(\d+)\s+(?:cheapest|most\s*expensive|best|top|lowest|highest)/i
    ) ||
    q.match(/(?:cheapest|most\s*expensive|best|top|lowest|highest)\s+(\d+)/i) ||
    q.match(/top\s+(\d+)/i);
  if (!nMatch) return null;

  const n = parseInt(nMatch[1], 10);
  if (n < 1 || n > 25) return null;

  for (const rule of SUPERLATIVE_RULES) {
    const matched = rule.patterns.some((p) => p.test(q));
    if (!matched) continue;

    let pool = products.filter((p) => p.inStock);
    const category = matchCategory(q);
    if (category) {
      pool = pool.filter((p) => p.category === category);
    }

    return [...pool].sort(rule.sort).slice(0, n);
  }

  return null;
}

// ─── Local Intent Detection ─────────────────────────────────────────────
// Catches common commands locally so we don't depend 100% on the LLM.

const ADD_PATTERNS = [
  /^(?:can you |please )?add\s+(?:the\s+|a\s+|an\s+|some\s+|me\s+(?:the\s+|a\s+|an\s+|some\s+)?)?(.+?)(?:\s+to\s+(?:my\s+)?cart)?(?:\s+please)?$/i,
  /^(?:i(?:'ll|'d like to|'d love to| want to| wanna)\s+)?(?:buy|get|take|grab|order)\s+(?:the\s+|a\s+|an\s+|some\s+|me\s+(?:the\s+|a\s+|an\s+|some\s+)?)?(.+?)(?:\s+please)?$/i,
  /^(?:put|throw|toss)\s+(?:the\s+|a\s+|an\s+|some\s+)?(.+?)(?:\s+in(?:to)?\s+(?:my\s+)?cart)?$/i,
  /^(?:i(?:'ll| will)\s+take)\s+(?:the\s+|a\s+)?(.+)$/i,
  /^(?:i want|i need|give me|get me)\s+(?:the\s+|a\s+|an\s+|some\s+)?(.+?)(?:\s+please)?$/i,
];

const REMOVE_PATTERNS = [
  /^(?:remove|delete|take out|drop)\s+(?:the\s+|a\s+)?(.+?)(?:\s+from\s+(?:my\s+)?cart)?$/i,
  /^(?:i don'?t want|cancel|nevermind on)\s+(?:the\s+|a\s+)?(.+)$/i,
];

const CART_VIEW_PATTERNS = [
  /^(?:show|view|open|see|what'?s?\s+in)\s+(?:my\s+)?cart/i,
  /^(?:go\s+to\s+)?(?:my\s+)?cart$/i,
  /^cart$/i,
];

const CHECKOUT_PATTERNS = [
  /^(?:check\s*out|proceed\s+to\s+check\s*out|pay|place\s+order|buy\s+everything|purchase|finish\s+order)/i,
  /^(?:i'?m?\s+)?(?:done|ready|ready\s+to\s+(?:pay|check\s*out))/i,
];

const CLEAR_CART_PATTERNS = [
  /^(?:clear|empty|reset)\s+(?:my\s+)?cart/i,
  /^(?:remove|delete)\s+(?:all|everything)\s+(?:from\s+(?:my\s+)?cart)?/i,
];

const NAVIGATE_PATTERNS = [
  {
    pattern:
      /^(?:go\s+to|show\s+me|take\s+me\s+to|open|navigate\s+to)\s+(?:the\s+)?(?:home\s*page|main\s*page|front\s*page)/i,
    path: "/",
  },
  {
    pattern:
      /^(?:go\s+to|show\s+me|take\s+me\s+to|open|navigate\s+to)\s+(?:the\s+)?(?:shop|store|products?\s*page|all\s+products)/i,
    path: "/products",
  },
];

function extractColorSize(text) {
  const colorMatch = text.match(
    /\b(?:in\s+)?(red|blue|navy|black|white|beige|brown|tan|gold|silver|rose\s*gold|green|pink|gray|grey|olive|cream|coral|burgundy|midnight|camel|lavender)\b/i
  );
  const color = colorMatch ? colorMatch[1] : null;
  const sizeMatch = text.match(
    /\b(?:size\s+)?(XXS|XS|S|M|L|XL|XXL|2XL|one\s*size)\b/i
  );
  // Shoe sizes: only match numbers when preceded by "size"
  const shoeSizeMatch = !sizeMatch ? text.match(/\bsize\s+(\d{1,2})\b/i) : null;
  const size = sizeMatch
    ? sizeMatch[1]
    : shoeSizeMatch
    ? shoeSizeMatch[1]
    : null;
  // Quantity: require a suffix word ("2 pairs", "3x", "5 of") OR number at very start ("2 blazers")
  const qtyMatch =
    text.match(/\b(\d+)\s*(?:of|x|×|pcs?|pieces?|pairs?|units?)\b/i) ||
    text.match(/^(\d+)\s+/i);
  // Don't count size numbers as quantity
  const quantity =
    qtyMatch && qtyMatch[1] !== size ? parseInt(qtyMatch[1], 10) : 1;
  return {
    color,
    size,
    quantity: quantity > 0 && quantity <= 99 ? quantity : 1,
  };
}

function stripColorSizeFromQuery(text) {
  return text
    .replace(
      /\b(?:in\s+)?(red|blue|navy|black|white|beige|brown|tan|gold|silver|rose\s*gold|green|pink|gray|grey|olive|cream|coral|burgundy|midnight|camel|lavender)\b/gi,
      ""
    )
    .replace(/\b(?:size\s+)?(XXS|XS|S|M|L|XL|XXL|2XL|one\s*size)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Try to handle the user's message locally without calling the LLM.
 * Returns { handled, actions, localResult } or null.
 */
function detectLocalIntent(userMessage, actionCallbacks) {
  const msg = userMessage.trim();

  // ── Add to cart ──
  for (const pattern of ADD_PATTERNS) {
    const match = msg.match(pattern);
    if (match) {
      let itemDesc = match[1].trim();
      // Remove trailing filler words
      itemDesc = itemDesc
        .replace(/\s+(please|for me|for my|now|asap|quickly|rn)$/i, "")
        .trim();

      const { color, size, quantity } = extractColorSize(itemDesc);
      const cleanDesc = stripColorSizeFromQuery(itemDesc) || itemDesc;

      // ── Try superlative → price range → random → name match ──
      const superProduct = resolveSuperlative(cleanDesc);
      const randomProduct = !superProduct ? resolveRandom(cleanDesc) : null;
      const priceRangeProducts =
        !superProduct && !randomProduct ? resolvePriceRange(cleanDesc) : null;
      const product =
        superProduct ||
        randomProduct ||
        (priceRangeProducts ? priceRangeProducts[0] : null) ||
        findProductByName(cleanDesc);
      if (product) {
        const finalColor = color
          ? product.colors.find((c) =>
              c.toLowerCase().includes(color.toLowerCase())
            ) || product.colors[0]
          : product.colors[0];
        const finalSize = size
          ? product.sizes.find((s) => s.toLowerCase() === size.toLowerCase()) ||
            product.sizes[0]
          : product.sizes[0];

        if (actionCallbacks?.addToCart) {
          actionCallbacks.addToCart(product, finalColor, finalSize, quantity);
        }
        return {
          handled: true,
          actions: [
            {
              function: "add_to_cart",
              args: {
                product_id: product.id,
                color: finalColor,
                size: finalSize,
                quantity,
              },
              result: { success: true },
            },
          ],
          localResult: {
            action: "added_to_cart",
            product,
            color: finalColor,
            size: finalSize,
            quantity,
          },
        };
      }
      // Can't find product locally — let LLM try
      return null;
    }
  }

  // ── Remove from cart ──
  for (const pattern of REMOVE_PATTERNS) {
    const match = msg.match(pattern);
    if (match) {
      const itemDesc = match[1].trim().toLowerCase();
      const cartItems = actionCallbacks?.getCartItems?.() || [];
      const idx = cartItems.findIndex(
        (item) =>
          item.name.toLowerCase().includes(itemDesc) ||
          itemDesc.includes(item.name.toLowerCase())
      );
      if (idx !== -1) {
        const removed = cartItems[idx];
        if (actionCallbacks?.removeFromCart) {
          actionCallbacks.removeFromCart(idx);
        }
        return {
          handled: true,
          actions: [
            { function: "remove_from_cart", result: { success: true } },
          ],
          localResult: { action: "removed_from_cart", product: removed },
        };
      }
      return null;
    }
  }

  // ── View cart ──
  for (const pattern of CART_VIEW_PATTERNS) {
    if (pattern.test(msg)) {
      if (actionCallbacks?.navigateTo) actionCallbacks.navigateTo("/cart");
      return {
        handled: true,
        actions: [{ function: "navigate_to", result: { success: true } }],
        localResult: { action: "navigate", path: "/cart" },
      };
    }
  }

  // ── Checkout ──
  for (const pattern of CHECKOUT_PATTERNS) {
    if (pattern.test(msg)) {
      if (actionCallbacks?.navigateTo) actionCallbacks.navigateTo("/checkout");
      return {
        handled: true,
        actions: [{ function: "navigate_to", result: { success: true } }],
        localResult: { action: "navigate", path: "/checkout" },
      };
    }
  }

  // ── Clear cart ──
  for (const pattern of CLEAR_CART_PATTERNS) {
    if (pattern.test(msg)) {
      if (actionCallbacks?.clearCart) actionCallbacks.clearCart();
      return {
        handled: true,
        actions: [{ function: "clear_cart", result: { success: true } }],
        localResult: { action: "cleared_cart" },
      };
    }
  }

  // ── Navigate ──
  for (const { pattern, path } of NAVIGATE_PATTERNS) {
    if (pattern.test(msg)) {
      if (actionCallbacks?.navigateTo) actionCallbacks.navigateTo(path);
      return {
        handled: true,
        actions: [{ function: "navigate_to", result: { success: true } }],
        localResult: { action: "navigate", path },
      };
    }
  }

  return null;
}

// ─── Tool Definitions (OpenAI Function Calling format) ─────────────────
const tools = [
  {
    type: "function",
    function: {
      name: "search_products",
      description:
        "Search the store for products. Use ONLY when user wants to BROWSE or SEE products, NOT when they want to add/buy.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          limit: { type: "number", description: "Max results (default 4)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "check_inventory",
      description: "Check if a product is available in a color or size.",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "number", description: "Product ID" },
          color: { type: "string", description: "Color to check" },
          size: { type: "string", description: "Size to check" },
        },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "add_to_cart",
      description:
        "Add a product to cart by its ID. Use when you know the exact product ID.",
      parameters: {
        type: "object",
        properties: {
          product_id: { type: "number", description: "Product ID" },
          color: { type: "string", description: "Color (optional)" },
          size: { type: "string", description: "Size (optional)" },
          quantity: { type: "number", description: "Quantity (default 1)" },
        },
        required: ["product_id"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_and_add_to_cart",
      description:
        "Search for a product by name/description and IMMEDIATELY add the best match to cart. THIS IS THE PREFERRED TOOL for any purchase intent. Use for: 'add X', 'buy X', 'get X', 'I want X', 'I'll take X'.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Product name or description to find and add",
          },
          color: { type: "string", description: "Preferred color (optional)" },
          size: { type: "string", description: "Preferred size (optional)" },
          quantity: { type: "number", description: "Quantity (default 1)" },
        },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "remove_from_cart",
      description:
        "Remove a product from the cart by name. Use when user says 'remove X'.",
      parameters: {
        type: "object",
        properties: {
          product_name: {
            type: "string",
            description: "Name of product to remove",
          },
        },
        required: ["product_name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "view_cart",
      description: "Show current cart contents and total.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "clear_cart",
      description: "Empty the entire cart.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "update_filters",
      description:
        "Change website display: sort, category, search filter. Navigates to /products automatically.",
      parameters: {
        type: "object",
        properties: {
          sort_by: {
            type: "string",
            enum: ["featured", "price-low", "price-high", "rating", "name"],
          },
          category: {
            type: "string",
            description:
              "'All', 'Clothing', 'Accessories', 'Electronics', 'Shoes'",
          },
          search: { type: "string", description: "Search filter text" },
          highlight_ids: { type: "array", items: { type: "number" } },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "navigate_to",
      description:
        "Go to a page: '/', '/products', '/product/{id}', '/cart', '/checkout'",
      parameters: {
        type: "object",
        properties: { path: { type: "string" } },
        required: ["path"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "haggle_discount",
      description:
        "Handle discount negotiation. Be fun, give discounts for good reasons.",
      parameters: {
        type: "object",
        properties: {
          approved: { type: "boolean" },
          discount_percent: {
            type: "number",
            description: "5-30% MAX. Never exceed 30. System will cap at 30.",
          },
          coupon_code: { type: "string", description: "e.g. BDAY-20" },
          reason: { type: "string" },
        },
        required: ["approved", "reason"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_recommendations",
      description:
        "Get personalized recommendations based on browsing/cart history.",
      parameters: {
        type: "object",
        properties: { limit: { type: "number" } },
      },
    },
  },
];

// ─── System Prompt ──────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are "The Clerk" — a witty, charming AI shopkeeper at StyleVault. Warm, cheeky, fashion-savvy. You ALWAYS take action immediately.

═══ ABSOLUTE RULES — YOU MUST FOLLOW ═══
1. EVERY user command = TOOL CALL. Never just respond with text when user wants an ACTION.
2. "add/buy/get/want/take/grab/order [product]" → call search_and_add_to_cart IMMEDIATELY
3. "add [product] in [color]" → search_and_add_to_cart with color param
4. "remove X from cart" → call remove_from_cart
5. "show my cart / what's in my cart" → call view_cart
6. "clear/empty cart" → call clear_cart
7. "checkout/pay/I'm done" → call navigate_to with "/checkout"
8. "show me / browse / find" → call search_products
9. "sort/filter/cheaper/category" → call update_filters
10. "discount/deal" → call haggle_discount
11. "recommend/suggest" → call get_recommendations
12. After adding to cart: confirm briefly + suggest 1 complementary item
13. Keep responses SHORT: 2-3 sentences max
14. CART TRUTH: The [CURRENT CART: ...] tag in each user message is the REAL cart state — trust it over conversation history. If it says EMPTY, the cart IS empty regardless of what was said before. NEVER hallucinate cart contents.
15. NEVER say you added something without calling a tool. If you cannot call a tool, say you couldn't do it. ONLY claim success AFTER receiving a tool result with success:true.
16. You MUST call search_and_add_to_cart to add items. Saying "added!" without calling the tool is LYING and FORBIDDEN.

═══ CORRECT EXAMPLES ═══
User: "add the blazer to cart" → search_and_add_to_cart(query:"blazer")
User: "I want leather loafers in brown" → search_and_add_to_cart(query:"leather loafers", color:"brown")
User: "buy aviator sunglasses" → search_and_add_to_cart(query:"aviator sunglasses")
User: "get me wireless headphones" → search_and_add_to_cart(query:"wireless headphones")
User: "add classic linen blazer" → search_and_add_to_cart(query:"classic linen blazer")
User: "show me summer clothes" → search_products(query:"summer clothes")
User: "remove the blazer" → remove_from_cart(product_name:"blazer")
User: "what's in my cart?" → view_cart()
User: "checkout" → navigate_to(path:"/checkout")

═══ WRONG (NEVER DO) ═══
User says "add the blazer" → you just describe it ❌
User says "buy sneakers" → you ask "which ones?" ❌ (add best match!)
User says "I want the loafers" → you say "Great choice!" without adding ❌

═══ HAGGLE RULES (STRICT — NEVER BREAK) ═══
ABSOLUTE MAX DISCOUNT: 30%. You can NEVER give more than 30% under ANY circumstances.
Birthday: 15-20% | Bulk 2+: 10-15% | Student: 10% | Charming: 5% | Rude: threaten +5% | Lowball >30%: refuse firmly
If user asks for >30% or free items or 100% off → REFUSE. Say "I'd love to, but 30% is the absolute max I can do — my boss would fire me! 😅"
Never approve discount_percent > 30. The system hard-caps at 30% anyway.

═══ STORE CATALOG ═══
${PRODUCT_CATALOG}

Format products as: **[Name](/product/{id})** — $price ⭐rating`;

// ─── Function Execution ─────────────────────────────────────────────────
function executeFunction(name, args, actionCallbacks) {
  switch (name) {
    case "search_products": {
      // Check if this is a superlative query (cheapest, best rated, etc.)
      const superMultiple = resolveSuperlativeMultiple(args.query);
      if (superMultiple && superMultiple.length > 0) {
        return {
          results: superMultiple.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            rating: p.rating,
            reviews: p.reviews,
            category: p.category,
            colors: p.colors,
            sizes: p.sizes,
            description: p.description,
            inStock: p.inStock,
            relevanceScore: 100,
          })),
          query: args.query,
        };
      }
      const superSingle = resolveSuperlative(args.query);
      if (superSingle) {
        return {
          results: [
            {
              id: superSingle.id,
              name: superSingle.name,
              price: superSingle.price,
              rating: superSingle.rating,
              reviews: superSingle.reviews,
              category: superSingle.category,
              colors: superSingle.colors,
              sizes: superSingle.sizes,
              description: superSingle.description,
              inStock: superSingle.inStock,
              relevanceScore: 100,
            },
          ],
          query: args.query,
        };
      }

      const results = semanticSearch(args.query, products, args.limit || 4);
      return {
        results: results.map((r) => ({
          id: r.product.id,
          name: r.product.name,
          price: r.product.price,
          rating: r.product.rating,
          reviews: r.product.reviews,
          category: r.product.category,
          colors: r.product.colors,
          sizes: r.product.sizes,
          description: r.product.description,
          inStock: r.product.inStock,
          relevanceScore: r.score,
        })),
        query: args.query,
      };
    }

    case "check_inventory": {
      const pid =
        typeof args.product_id === "string"
          ? parseInt(args.product_id, 10)
          : args.product_id;
      const product = products.find((p) => p.id === pid);
      if (!product) return { found: false, message: "Product not found" };
      const result = {
        found: true,
        name: product.name,
        inStock: product.inStock,
      };
      if (args.color) {
        result.colorAvailable = checkColor(product, args.color);
        result.availableColors = product.colors;
      }
      if (args.size) {
        result.sizeAvailable = checkSize(product, args.size);
        result.availableSizes = product.sizes;
      }
      return result;
    }

    case "add_to_cart": {
      // Parse product_id safely — handles string "1" or number 1
      const pid =
        typeof args.product_id === "string"
          ? parseInt(args.product_id, 10)
          : args.product_id;
      let product = products.find((p) => p.id === pid);

      // Fallback: if ID didn't match, try finding by name
      if (!product) {
        product = findProductByName(String(args.product_id));
      }
      if (!product) {
        return {
          success: false,
          message:
            "Product not found. Try search_and_add_to_cart with a product description.",
        };
      }

      const color = args.color || product.colors[0];
      const size = args.size || product.sizes[0];
      const quantity = args.quantity || 1;

      if (actionCallbacks?.addToCart) {
        actionCallbacks.addToCart(product, color, size, quantity);
      }
      return {
        success: true,
        product: product.name,
        color,
        size,
        quantity,
        totalPrice: product.price * quantity,
      };
    }

    case "search_and_add_to_cart": {
      // Try superlative → random → price range → name match
      const superMatch = resolveSuperlative(args.query);
      const randomMatch = !superMatch ? resolveRandom(args.query) : null;
      const priceRangeMatch =
        !superMatch && !randomMatch
          ? resolvePriceRange(args.query)?.[0] || null
          : null;
      const directMatch =
        superMatch ||
        randomMatch ||
        priceRangeMatch ||
        findProductByName(args.query);
      if (directMatch && directMatch.inStock) {
        const color = args.color
          ? directMatch.colors.find((c) =>
              c.toLowerCase().includes(args.color.toLowerCase())
            ) || directMatch.colors[0]
          : directMatch.colors[0];
        const size = args.size
          ? directMatch.sizes.find(
              (s) => s.toLowerCase() === args.size.toLowerCase()
            ) || directMatch.sizes[0]
          : directMatch.sizes[0];
        const quantity = args.quantity || 1;

        if (actionCallbacks?.addToCart) {
          actionCallbacks.addToCart(directMatch, color, size, quantity);
        }
        return {
          success: true,
          product: directMatch.name,
          productId: directMatch.id,
          price: directMatch.price,
          color,
          size,
          quantity,
          totalPrice: directMatch.price * quantity,
        };
      }

      // Fall back to semantic search
      const results = semanticSearch(args.query, products, 3);
      if (!results || results.length === 0) {
        return {
          success: false,
          message: `No products found matching "${args.query}"`,
        };
      }

      const bestMatch = results[0].product;
      if (!bestMatch.inStock) {
        return {
          success: false,
          message: `Found "${bestMatch.name}" but it's out of stock`,
          alternatives: results.slice(1).map((r) => ({
            id: r.product.id,
            name: r.product.name,
            price: r.product.price,
          })),
        };
      }

      const color = args.color
        ? bestMatch.colors.find((c) =>
            c.toLowerCase().includes(args.color.toLowerCase())
          ) || bestMatch.colors[0]
        : bestMatch.colors[0];
      const size = args.size
        ? bestMatch.sizes.find(
            (s) => s.toLowerCase() === args.size.toLowerCase()
          ) || bestMatch.sizes[0]
        : bestMatch.sizes[0];
      const quantity = args.quantity || 1;

      if (actionCallbacks?.addToCart) {
        actionCallbacks.addToCart(bestMatch, color, size, quantity);
      }
      return {
        success: true,
        product: bestMatch.name,
        productId: bestMatch.id,
        price: bestMatch.price,
        color,
        size,
        quantity,
        totalPrice: bestMatch.price * quantity,
        otherMatches: results.slice(1).map((r) => ({
          id: r.product.id,
          name: r.product.name,
          price: r.product.price,
        })),
      };
    }

    case "remove_from_cart": {
      const cartItems = actionCallbacks?.getCartItems?.() || [];
      const nameQuery = (args.product_name || "").toLowerCase();
      const idx = cartItems.findIndex(
        (item) =>
          item.name.toLowerCase().includes(nameQuery) ||
          nameQuery.includes(item.name.toLowerCase())
      );
      if (idx !== -1) {
        const removed = cartItems[idx];
        if (actionCallbacks?.removeFromCart) {
          actionCallbacks.removeFromCart(idx);
        }
        return { success: true, removed: removed.name };
      }
      return {
        success: false,
        message: `"${args.product_name}" not found in cart`,
      };
    }

    case "view_cart": {
      const cartItems = actionCallbacks?.getCartItems?.() || [];
      const cartTotal = actionCallbacks?.getCartTotal?.() || {
        subtotal: 0,
        discount: 0,
        total: 0,
      };
      if (cartItems.length === 0) {
        return { items: [], message: "Cart is empty!", total: 0 };
      }
      return {
        items: cartItems.map((item, i) => ({
          index: i,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          color: item.selectedColor,
          size: item.selectedSize,
          lineTotal: item.price * item.quantity,
        })),
        itemCount: cartItems.length,
        ...cartTotal,
      };
    }

    case "clear_cart": {
      if (actionCallbacks?.clearCart) {
        actionCallbacks.clearCart();
      }
      return { success: true, message: "Cart cleared!" };
    }

    case "update_filters": {
      const updates = {};
      if (args.sort_by && actionCallbacks?.setSortBy) {
        actionCallbacks.setSortBy(args.sort_by);
        updates.sortBy = args.sort_by;
      }
      if (args.category && actionCallbacks?.setSelectedCategory) {
        actionCallbacks.setSelectedCategory(args.category);
        updates.category = args.category;
      }
      if (args.search !== undefined && actionCallbacks?.setSearchQuery) {
        actionCallbacks.setSearchQuery(args.search);
        updates.search = args.search;
      }
      if (args.highlight_ids && actionCallbacks?.setHighlightedProducts) {
        actionCallbacks.setHighlightedProducts(args.highlight_ids);
        updates.highlighted = args.highlight_ids;
      }
      if (actionCallbacks?.navigateTo) {
        actionCallbacks.navigateTo("/products");
      }
      return { success: true, updates, message: "Website updated!" };
    }

    case "navigate_to": {
      if (actionCallbacks?.navigateTo) {
        actionCallbacks.navigateTo(args.path);
      }
      return { success: true, path: args.path };
    }

    case "haggle_discount": {
      const MAX_DISCOUNT = 30;
      if (args.approved && args.discount_percent && args.coupon_code) {
        // Hard cap — no matter what the LLM says, never exceed 30%
        const safePct = Math.min(
          Math.max(Math.round(args.discount_percent), 1),
          MAX_DISCOUNT
        );
        if (actionCallbacks?.applyCoupon) {
          actionCallbacks.applyCoupon({
            code: args.coupon_code,
            discount: safePct,
          });
        }
        return {
          success: true,
          coupon: args.coupon_code,
          discount: safePct,
          message: `Coupon ${args.coupon_code} applied! ${safePct}% off.`,
        };
      }
      return { success: false, approved: false, reason: args.reason };
    }

    case "get_recommendations": {
      const recs = getRecommendations(
        actionCallbacks?.getActivity?.() || [],
        products,
        args.limit || 4
      );
      return {
        recommendations: recs.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          rating: p.rating,
          category: p.category,
          description: p.description,
        })),
      };
    }

    default:
      return { error: `Unknown function: ${name}` };
  }
}

// ─── Generate reply for locally-handled actions ─────────────────────────
function generateLocalReply(localResult) {
  switch (localResult.action) {
    case "added_to_cart": {
      const p = localResult.product;
      const complementary = semanticSearch(p.category, products, 2)
        .filter((r) => r.product.id !== p.id)
        .map((r) => r.product);
      const suggestion =
        complementary.length > 0
          ? `\n\nMight I also suggest **[${complementary[0].name}](/product/${complementary[0].id})** ($${complementary[0].price})? Goes great with your pick! 😉`
          : "";
      return `Done! ✅ Added **${p.name}** (${localResult.color}, ${
        localResult.size
      }) × ${localResult.quantity} to your cart — **$${(
        p.price * localResult.quantity
      ).toFixed(2)}**${suggestion}`;
    }
    case "removed_from_cart":
      return `Removed **${localResult.product.name}** from your cart. Anything else?`;
    case "cleared_cart":
      return "Cart cleared! 🧹 Fresh start. What catches your eye?";
    case "navigate": {
      if (localResult.path === "/cart") return "Here's your cart! 🛒";
      if (localResult.path === "/checkout")
        return "Taking you to checkout! 💳 Let's wrap this up.";
      if (localResult.path === "/products")
        return "Here's the full collection! 🛍️";
      return "Taking you there! 🚀";
    }
    default:
      return "Done! ✅";
  }
}

// ─── Main Chat Function ─────────────────────────────────────────────────
export async function chatWithClerk(
  conversationHistory,
  userMessage,
  actionCallbacks = {}
) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey || apiKey === "your_groq_api_key_here") {
    return {
      reply:
        "⚠️ I need a Groq API key to work! Add it to `.env` as `VITE_GROQ_API_KEY=gsk_...`",
      updatedHistory: conversationHistory,
      actions: [],
    };
  }

  // ── Step 1: Try local intent detection first (instant, no API call) ──
  const localIntent = detectLocalIntent(userMessage, actionCallbacks);
  if (localIntent?.handled) {
    const reply = generateLocalReply(localIntent.localResult);
    const updatedHistory = [
      ...conversationHistory,
      { role: "user", content: userMessage },
      { role: "assistant", content: reply },
    ];
    return { reply, updatedHistory, actions: localIntent.actions };
  }

  // ── Step 2: Fall through to LLM with tools ──
  const cartItems = actionCallbacks?.getCartItems?.() || [];
  const cartContext =
    cartItems.length > 0
      ? `\n[CURRENT CART: ${cartItems
          .map((i) => `${i.name} ×${i.quantity} $${i.price}`)
          .join(", ")}]`
      : "\n[CURRENT CART: EMPTY — 0 items]";

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...conversationHistory,
    { role: "user", content: userMessage + cartContext },
  ];

  const actions = [];
  let maxIterations = 6;

  try {
    while (maxIterations > 0) {
      maxIterations--;

      const response = await fetch(GROQ_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          tools,
          tool_choice: "auto",
          temperature: 0.6,
          max_tokens: 1024,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error("Groq API error:", errBody);
        if (response.status === 400 && errBody.includes("tool")) {
          const fallbackRes = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant",
              messages: [
                {
                  role: "system",
                  content:
                    "You are a helpful shopping assistant at StyleVault. You CANNOT add items to cart or perform actions in this mode. If the user asks to add/buy/remove items, tell them to try again in a moment. Only answer questions and give recommendations.",
                },
                ...conversationHistory,
                { role: "user", content: userMessage },
              ],
              temperature: 0.6,
              max_tokens: 1024,
            }),
          });
          if (fallbackRes.ok) {
            const fbData = await fallbackRes.json();
            const fbContent = fbData.choices[0].message.content;
            return {
              reply: fbContent,
              updatedHistory: [
                ...conversationHistory,
                { role: "user", content: userMessage },
                { role: "assistant", content: fbContent },
              ],
              actions,
            };
          }
        }
        throw new Error(`Groq API error ${response.status}: ${errBody}`);
      }

      const data = await response.json();
      const choice = data.choices[0];
      const assistantMessage = choice.message;
      messages.push(assistantMessage);

      if (
        !assistantMessage.tool_calls ||
        assistantMessage.tool_calls.length === 0
      ) {
        // ── Safety net: detect if LLM CLAIMS to have added something without calling a tool ──
        const reply = assistantMessage.content || "";
        const claimsAdded =
          /(?:added|put|placed|tossed|thrown)\s+.+?(?:to|in|into)\s+(?:your|the)?\s*cart/i.test(
            reply
          ) || /\u2705.*(?:add|cart)/i.test(reply);
        const actuallyAdded = actions.some(
          (a) =>
            a.function === "add_to_cart" ||
            a.function === "search_and_add_to_cart"
        );

        if (claimsAdded && !actuallyAdded) {
          // LLM lied about adding. Try to extract product name and actually add it.
          const productMatch =
            reply.match(/(?:added|put)\s+\*\*(?:\[)?([^*\]]+)/i) ||
            reply.match(/(?:added|put)\s+([^\s](?:[^.!,]){2,40})\s+(?:to|in)/i);
          if (productMatch) {
            const productName = productMatch[1].replace(/[\[\]\*]/g, "").trim();
            const product = findProductByName(productName);
            if (product && product.inStock) {
              const color = product.colors[0];
              const size = product.sizes[0];
              if (actionCallbacks?.addToCart) {
                actionCallbacks.addToCart(product, color, size, 1);
              }
              actions.push({
                function: "add_to_cart",
                args: { product_id: product.id },
                result: { success: true },
              });
            } else {
              // Can't find the product — correct the lie
              return {
                reply:
                  'Hmm, I couldn\'t actually find that product. Could you tell me the exact name? Try asking like: "add [product name] to cart".',
                updatedHistory: [
                  ...conversationHistory,
                  { role: "user", content: userMessage },
                  {
                    role: "assistant",
                    content:
                      "Hmm, I couldn't actually find that product. Could you tell me the exact name?",
                  },
                ],
                actions,
              };
            }
          }
        }

        return {
          reply: assistantMessage.content,
          updatedHistory: [
            ...conversationHistory,
            { role: "user", content: userMessage },
            { role: "assistant", content: assistantMessage.content },
          ],
          actions,
        };
      }

      for (const toolCall of assistantMessage.tool_calls) {
        const fnName = toolCall.function.name;
        let fnArgs;
        try {
          fnArgs = JSON.parse(toolCall.function.arguments);
        } catch {
          fnArgs = {};
        }

        console.log(`🔧 Clerk calling: ${fnName}`, fnArgs);
        const result = executeFunction(fnName, fnArgs, actionCallbacks);
        actions.push({ function: fnName, args: fnArgs, result });

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    return {
      reply: "I got carried away there! What were you looking for?",
      updatedHistory: conversationHistory,
      actions,
    };
  } catch (error) {
    console.error("Clerk error:", error);
    return {
      reply: `Oops, something went wrong. Error: ${error.message}. Please try again!`,
      updatedHistory: conversationHistory,
      actions: [],
    };
  }
}
