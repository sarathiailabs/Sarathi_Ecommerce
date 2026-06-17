import supabase from '../db/supabase.js';
import { AppError } from '../middleware/error.js';

// Global cache variables
let cachedProducts = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 30000; // 30 seconds

// Expose clear cache function for other controllers
export const clearProductCache = () => {
  cachedProducts = null;
  lastCacheUpdate = 0;
};

// Levenshtein distance helper for fuzzy search
function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

// Normalized similarity score (0.0 to 1.0)
function getSimilarity(a, b) {
  const distance = getLevenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1.0;
  return 1.0 - distance / maxLength;
}

// Common synonym map to support smart search (e.g. shoe -> sneakers/footwear)
const SYNONYMS = {
  'shoe': ['shoes', 'sneakers', 'footwear', 'boots', 'sandals'],
  'shoes': ['shoe', 'sneakers', 'footwear', 'boots', 'sandals'],
  'sneaker': ['shoe', 'shoes', 'footwear', 'sneakers'],
  'sneakers': ['shoe', 'shoes', 'footwear', 'sneaker'],
  'phone': ['mobile', 'smartphone', 'cellphone', 'iphone', 'galaxy'],
  'mobile': ['phone', 'smartphone', 'cellphone', 'iphone', 'galaxy'],
  'smartphone': ['phone', 'mobile', 'cellphone', 'iphone', 'galaxy'],
  'headphone': ['headphones', 'earphones', 'earbuds', 'headset', 'audio'],
  'headphones': ['headphone', 'earphones', 'earbuds', 'headset', 'audio'],
  'earphone': ['headphones', 'earphones', 'earbuds', 'headset', 'audio'],
  'earphones': ['headphones', 'earphones', 'earbuds', 'headset', 'audio'],
  'earbud': ['headphones', 'earphones', 'earbuds', 'headset', 'audio'],
  'earbuds': ['headphones', 'earphones', 'earbuds', 'headset', 'audio'],
  'laptop': ['computer', 'pc', 'notebook', 'macbook'],
  'laptops': ['computer', 'pc', 'notebook', 'macbook'],
  'skincare': ['beauty', 'cream', 'face', 'makeup'],
  'skincares': ['beauty', 'cream', 'face', 'makeup'],
  'makeup': ['beauty', 'cosmetics', 'lipstick', 'foundation'],
};

// Search scoring function for relevance ranking
function computeSearchScore(product, query) {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return { score: 0, isMatch: true };

  const nameLower = (product.name || '').toLowerCase();
  const descLower = (product.description || '').toLowerCase();
  const catLower = (product.category || '').toLowerCase();
  const subcatLower = (product.subcategory || '').toLowerCase();
  const brandLower = (product.brand || '').toLowerCase();

  // 1. Exact matches (highest priority)
  if (nameLower === cleanQ) {
    return { score: 10000, isMatch: true };
  }
  if (brandLower === cleanQ || catLower === cleanQ) {
    return { score: 8000, isMatch: true };
  }

  // Split query into terms
  const queryTerms = cleanQ.split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return { score: 0, isMatch: true };

  let totalScore = 0;
  let matchesCount = 0;

  for (const originalTerm of queryTerms) {
    const synonyms = SYNONYMS[originalTerm] || [];
    const allSearchTerms = [originalTerm, ...synonyms];

    let bestTermScore = 0;
    let bestTermMatched = false;

    for (let i = 0; i < allSearchTerms.length; i++) {
      const term = allSearchTerms[i];
      const isSynonym = i > 0;
      const multiplier = isSynonym ? 0.7 : 1.0;

      let score = 0;
      let matched = false;

      // A. Check Product Name
      if (nameLower.includes(term)) {
        score += 1000 * multiplier;
        matched = true;
        if (nameLower.startsWith(term)) {
          score += 200 * multiplier;
        }
      } else if (!isSynonym) {
        // Fuzzy check name words (only for original query terms)
        const nameWords = nameLower.split(/[^a-z0-9]+/).filter(Boolean);
        let bestSim = 0;
        for (const word of nameWords) {
          if (Math.abs(word.length - term.length) <= 2) {
            const sim = getSimilarity(term, word);
            if (sim > bestSim) bestSim = sim;
          }
        }
        if (bestSim >= 0.75) {
          score += 800 * bestSim * multiplier;
          matched = true;
        }
      }

      // B. Check Brand & Category & Subcategory
      if (brandLower.includes(term) || catLower.includes(term) || subcatLower.includes(term)) {
        score += 500 * multiplier;
        matched = true;
        if (brandLower === term || catLower === term) {
          score += 300 * multiplier;
        }
      } else if (!isSynonym) {
        // Fuzzy check brand/category words (only for original query terms)
        const brandWords = brandLower.split(/[^a-z0-9]+/).filter(Boolean);
        const catWords = catLower.split(/[^a-z0-9]+/).filter(Boolean);
        const subcatWords = subcatLower.split(/[^a-z0-9]+/).filter(Boolean);
        const allWords = [...brandWords, ...catWords, ...subcatWords];
        let bestSim = 0;
        for (const word of allWords) {
          if (Math.abs(word.length - term.length) <= 2) {
            const sim = getSimilarity(term, word);
            if (sim > bestSim) bestSim = sim;
          }
        }
        if (bestSim >= 0.75) {
          score += 400 * bestSim * multiplier;
          matched = true;
        }
      }

      // C. Check Description
      if (descLower.includes(term)) {
        score += 100 * multiplier;
        matched = true;
      } else if (!isSynonym && term.length >= 4) {
        // Fuzzy check description words (only for original query terms)
        const descWords = descLower.split(/[^a-z0-9]+/).filter(Boolean);
        let bestSim = 0;
        for (const word of descWords) {
          if (Math.abs(word.length - term.length) <= 1) {
            const sim = getSimilarity(term, word);
            if (sim > bestSim) bestSim = sim;
            if (sim >= 0.85) break; // Optimization
          }
        }
        if (bestSim >= 0.8) {
          score += 80 * bestSim * multiplier;
          matched = true;
        }
      }

      if (matched && score > bestTermScore) {
        bestTermScore = score;
        bestTermMatched = true;
      }
    }

    if (bestTermMatched) {
      totalScore += bestTermScore;
      matchesCount++;
    }
  }

  // At least one word in the query must match
  const isMatch = matchesCount > 0;

  // Multi-term match bonus
  if (isMatch && queryTerms.length > 1) {
    totalScore += (matchesCount / queryTerms.length) * 1000;
  }

  return { score: totalScore, isMatch };
}

export const productController = {
  async listProducts(req, res, next) {
    try {
      const {
        q,
        search,
        category,
        brand,
        min_price,
        max_price,
        featured,
        in_stock,
        sort = 'newest',
        page = '1',
        limit = '100'
      } = req.query;

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 100;

      // Use either q or search
      const rawQuery = q || search || '';
      const cleanQ = rawQuery.trim();

      // Get active products (from cache if available)
      const now = Date.now();
      if (!cachedProducts || (now - lastCacheUpdate > CACHE_TTL)) {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true);

        if (error) {
          return next(new AppError(500, `Error loading products list: ${error.message}`));
        }
        cachedProducts = data || [];
        lastCacheUpdate = now;
      }

      if (cachedProducts && cachedProducts.length > 0) {
        console.log(`[TEMP LOG] Database Image URL for first product "${cachedProducts[0].name}": ${cachedProducts[0].image_url}`);
      }

      let results = [...cachedProducts];

      // --- Search / Relevance Matching ---
      if (cleanQ) {
        results = results.map(p => {
          const { score, isMatch } = computeSearchScore(p, cleanQ);
          return { ...p, searchScore: score, isSearchMatch: isMatch };
        });

        let matchedResults = results.filter(p => p.isSearchMatch && p.searchScore > 0);

        // Fallback to similar products when no results are found
        if (matchedResults.length === 0) {
          // Relaxed matching - any positive fuzzy score, or products sharing any word in category/brand
          matchedResults = results.filter(p => p.searchScore > 0);

          if (matchedResults.length === 0) {
            // Fallback to featured products
            matchedResults = results.filter(p => p.is_featured);
          }

          if (matchedResults.length === 0) {
            // Fallback to top rated products
            matchedResults = [...results].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
          }
        }
        results = matchedResults;
      }

      // --- Filters ---
      if (category) {
        const catLower = category.toLowerCase();
        results = results.filter(p => (p.category || '').toLowerCase() === catLower);
      }

      if (brand) {
        const brandLower = brand.toLowerCase();
        results = results.filter(p => (p.brand || '').toLowerCase() === brandLower);
      }

      if (min_price !== undefined && min_price !== '') {
        const minPriceNum = parseFloat(min_price);
        results = results.filter(p => parseFloat(p.price) >= minPriceNum);
      }

      if (max_price !== undefined && max_price !== '') {
        const maxPriceNum = parseFloat(max_price);
        results = results.filter(p => parseFloat(p.price) <= maxPriceNum);
      }

      if (featured !== undefined) {
        const isFeatured = featured === 'true' || featured === true;
        results = results.filter(p => p.is_featured === isFeatured);
      }

      if (in_stock === 'true' || in_stock === true) {
        results = results.filter(p => p.stock > 0);
      }

      // --- Sorting ---
      // If a search query is active and the sort is default/newest, sort by search score descending.
      // Otherwise, sort by the requested sorting field.
      const isSearchActive = !!cleanQ;
      const isDefaultSort = sort === 'newest' || sort === 'default' || !sort;

      results.sort((a, b) => {
        if (isSearchActive && isDefaultSort) {
          // Rank by relevance score first
          const scoreDiff = (b.searchScore || 0) - (a.searchScore || 0);
          if (scoreDiff !== 0) return scoreDiff;
        }

        // Sub-sort / Field sort
        switch (sort) {
          case 'oldest':
            return new Date(a.created_at) - new Date(b.created_at);
          case 'price_asc':
          case 'price-low':
            return parseFloat(a.price) - parseFloat(b.price);
          case 'price_desc':
          case 'price-high':
            return parseFloat(b.price) - parseFloat(a.price);
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          case 'popular':
            return (b.review_count || 0) - (a.review_count || 0);
          case 'newest':
          default:
            return new Date(b.created_at) - new Date(a.created_at);
        }
      });

      // --- Pagination ---
      const from = (pageNum - 1) * limitNum;
      const paginatedResults = results.slice(from, from + limitNum);

      if (paginatedResults && paginatedResults.length > 0) {
        console.log(`[TEMP LOG] API Response Image URL for first product "${paginatedResults[0].name}": ${paginatedResults[0].image_url}`);
      }

      res.status(200).json(paginatedResults);
    } catch (error) {
      next(error);
    }
  },

  async getProduct(req, res, next) {
    try {
      const { product_id } = req.params;
      const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', product_id)
        .single();

      if (error || !product) {
        return next(new AppError(404, 'Product not found'));
      }

      console.log(`[TEMP LOG] Database Image URL for single product "${product.name}": ${product.image_url}`);
      console.log(`[TEMP LOG] API Response Image URL for single product "${product.name}": ${product.image_url}`);

      res.status(200).json(product);
    } catch (error) {
      next(error);
    }
  }
};

export default productController;
