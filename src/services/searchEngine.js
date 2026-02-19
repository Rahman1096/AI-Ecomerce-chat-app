/**
 * Simple semantic search engine using TF-IDF-like scoring.
 * Matches user queries against product tags, names, descriptions, and categories.
 * No external dependencies needed — runs entirely in the browser.
 */

// Synonym/concept expansion map for better semantic matching
const CONCEPT_MAP = {
  // Occasions
  wedding: [
    "formal",
    "elegant",
    "dress",
    "blazer",
    "suit",
    "clutch",
    "silk",
    "linen",
    "loafers",
  ],
  party: ["dress", "clutch", "evening", "elegant", "jewelry", "necklace"],
  beach: [
    "summer",
    "sunglasses",
    "hat",
    "linen",
    "sandals",
    "speaker",
    "outdoor",
  ],
  vacation: [
    "travel",
    "beach",
    "summer",
    "hat",
    "sunglasses",
    "linen",
    "backpack",
  ],
  gym: [
    "fitness",
    "sports",
    "activewear",
    "leggings",
    "sneakers",
    "tracker",
    "running",
  ],
  workout: [
    "fitness",
    "sports",
    "activewear",
    "leggings",
    "sneakers",
    "running",
  ],
  office: ["formal", "tailored", "blazer", "trousers", "shirt", "watch", "bag"],
  date: ["elegant", "dress", "jewelry", "necklace", "clutch", "watch"],
  gift: ["watch", "wallet", "necklace", "scarf", "headphones", "speaker"],

  // Seasons
  summer: [
    "light",
    "breathable",
    "linen",
    "sunglasses",
    "hat",
    "beach",
    "floral",
  ],
  winter: [
    "warm",
    "wool",
    "cashmere",
    "scarf",
    "sweater",
    "jacket",
    "layering",
  ],
  spring: ["light", "floral", "dress", "sneakers", "jacket"],
  fall: ["layering", "jacket", "sweater", "boots", "scarf", "denim"],

  // Descriptors
  cheap: ["budget", "affordable"],
  expensive: ["luxury", "premium", "cashmere", "leather", "silk", "italian"],
  fancy: ["elegant", "formal", "silk", "luxury", "jewelry"],
  casual: ["everyday", "comfortable", "basic", "denim", "sneakers", "t-shirt"],
  sporty: ["sports", "athletic", "fitness", "running", "activewear"],
  minimalist: ["minimal", "clean", "simple", "basic"],
  trendy: ["streetwear", "modern", "fashion"],
  comfortable: ["soft", "relaxed", "stretch", "cushioned"],

  // Item types (natural language → tags)
  clothes: ["clothing"],
  outfit: ["clothing", "dress", "blazer", "shirt", "pants"],
  shoes: ["sneakers", "loafers", "footwear"],
  tech: ["electronics", "headphones", "speaker", "tracker"],
  bags: ["bag", "backpack", "clutch", "crossbody"],
  jewellery: ["jewelry", "necklace", "ring", "bracelet"],
  jewelry: ["necklace", "ring", "bracelet", "pendant"],
};

// Tokenize and normalize text
function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

// Expand query tokens with synonyms/concepts
function expandQuery(tokens) {
  const expanded = new Set(tokens);
  for (const token of tokens) {
    if (CONCEPT_MAP[token]) {
      CONCEPT_MAP[token].forEach((syn) => expanded.add(syn));
    }
    // Partial matches
    for (const [key, values] of Object.entries(CONCEPT_MAP)) {
      if (key.includes(token) || token.includes(key)) {
        values.forEach((syn) => expanded.add(syn));
        expanded.add(key);
      }
    }
  }
  return [...expanded];
}

/**
 * Score a product against a search query.
 * Returns a relevance score (0-100).
 */
function scoreProduct(product, queryTokens, expandedTokens) {
  let score = 0;
  const maxScore = 100;

  const nameTokens = tokenize(product.name);
  const descTokens = tokenize(product.description);
  const tagTokens = product.tags.map((t) => t.toLowerCase());
  const categoryTokens = tokenize(`${product.category} ${product.subcategory}`);
  const colorTokens = product.colors.map((c) => c.toLowerCase());

  // Direct name match (highest weight)
  for (const qt of queryTokens) {
    if (nameTokens.some((nt) => nt.includes(qt) || qt.includes(nt))) {
      score += 25;
    }
  }

  // Direct tag match
  for (const qt of queryTokens) {
    if (tagTokens.some((tt) => tt.includes(qt) || qt.includes(tt))) {
      score += 15;
    }
  }

  // Category match
  for (const qt of queryTokens) {
    if (categoryTokens.some((ct) => ct.includes(qt) || qt.includes(ct))) {
      score += 15;
    }
  }

  // Description match
  for (const qt of queryTokens) {
    if (descTokens.some((dt) => dt.includes(qt) || qt.includes(dt))) {
      score += 8;
    }
  }

  // Color match
  for (const qt of queryTokens) {
    if (colorTokens.some((ct) => ct.includes(qt) || qt.includes(ct))) {
      score += 10;
    }
  }

  // Expanded semantic match (lower weight — these are inferred)
  const semanticOnly = expandedTokens.filter((t) => !queryTokens.includes(t));
  for (const st of semanticOnly) {
    if (tagTokens.includes(st)) score += 6;
    if (nameTokens.some((nt) => nt.includes(st))) score += 4;
    if (categoryTokens.some((ct) => ct.includes(st))) score += 4;
    if (descTokens.some((dt) => dt.includes(st))) score += 2;
  }

  return Math.min(score, maxScore);
}

/**
 * Semantic search: find products matching a natural language query.
 * @param {string} query - Natural language query from user
 * @param {Array} products - Product catalog
 * @param {number} limit - Max results to return
 * @returns {Array} Sorted array of { product, score }
 */
export function semanticSearch(query, products, limit = 6) {
  const queryTokens = tokenize(query);
  const expandedTokens = expandQuery(queryTokens);

  const scored = products
    .map((product) => ({
      product,
      score: scoreProduct(product, queryTokens, expandedTokens),
    }))
    .filter((item) => item.score > 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

/**
 * Check if a product is available in a specific color.
 */
export function checkColor(product, color) {
  return product.colors.some((c) =>
    c.toLowerCase().includes(color.toLowerCase())
  );
}

/**
 * Check if a product is available in a specific size.
 */
export function checkSize(product, size) {
  return product.sizes.some((s) => s.toLowerCase() === size.toLowerCase());
}

/**
 * Get personalized recommendations based on user activity.
 */
export function getRecommendations(activity, products, limit = 4) {
  if (!activity || activity.length === 0) {
    // Return top-rated if no activity
    return products.sort((a, b) => b.rating - a.rating).slice(0, limit);
  }

  // Count category/tag frequency from activity
  const catFreq = {};
  const tagFreq = {};
  const seenProducts = new Set();

  for (const entry of activity.slice(0, 20)) {
    seenProducts.add(entry.productId);
    catFreq[entry.category] = (catFreq[entry.category] || 0) + 1;
    if (entry.tags) {
      entry.tags.forEach((t) => {
        tagFreq[t] = (tagFreq[t] || 0) + 1;
      });
    }
  }

  // Score products based on activity preference
  return products
    .filter((p) => !seenProducts.has(p.id))
    .map((p) => {
      let score = 0;
      score += (catFreq[p.category] || 0) * 3;
      p.tags.forEach((t) => {
        score += (tagFreq[t] || 0) * 2;
      });
      score += p.rating;
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.product);
}
