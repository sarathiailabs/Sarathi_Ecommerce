import { clearProductCache } from '../controllers/productController.js';

// Recreate computeSearchScore locally to debug it
const SYNONYMS = {
  'shoe': ['shoes', 'sneakers', 'footwear', 'boots', 'sandals'],
  'shoes': ['shoe', 'sneakers', 'footwear', 'boots', 'sandals'],
  'sneaker': ['shoe', 'shoes', 'footwear', 'sneakers'],
  'sneakers': ['shoe', 'shoes', 'footwear', 'sneaker'],
};

function getLevenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

function getSimilarity(a, b) {
  const distance = getLevenshteinDistance(a, b);
  const maxLength = Math.max(a.length, b.length);
  if (maxLength === 0) return 1.0;
  return 1.0 - distance / maxLength;
}

function computeSearchScore(product, query) {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return { score: 0, isMatch: true };

  const nameLower = (product.name || '').toLowerCase();
  const descLower = (product.description || '').toLowerCase();
  const catLower = (product.category || '').toLowerCase();
  const subcatLower = (product.subcategory || '').toLowerCase();
  const brandLower = (product.brand || '').toLowerCase();

  if (nameLower === cleanQ) {
    return { score: 10000, isMatch: true };
  }
  if (brandLower === cleanQ || catLower === cleanQ) {
    return { score: 8000, isMatch: true };
  }

  const queryTerms = cleanQ.split(/\s+/).filter(Boolean);
  if (queryTerms.length === 0) return { score: 0, isMatch: true };

  let totalScore = 0;
  let matchesCount = 0;

  for (const originalTerm of queryTerms) {
    const synonyms = SYNONYMS[originalTerm] || [];
    const allSearchTerms = [originalTerm, ...synonyms];

    console.log(`originalTerm: ${originalTerm}, synonyms: ${synonyms}, allSearchTerms: ${allSearchTerms}`);

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

      // B. Check Brand & Category
      if (brandLower.includes(term) || catLower.includes(term) || subcatLower.includes(term)) {
        score += 500 * multiplier;
        matched = true;
        if (brandLower === term || catLower === term) {
          score += 300 * multiplier;
        }
      } else if (!isSynonym) {
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
        const descWords = descLower.split(/[^a-z0-9]+/).filter(Boolean);
        let bestSim = 0;
        for (const word of descWords) {
          if (Math.abs(word.length - term.length) <= 1) {
            const sim = getSimilarity(term, word);
            if (sim > bestSim) bestSim = sim;
            if (sim >= 0.85) break;
          }
        }
        if (bestSim >= 0.8) {
          score += 80 * bestSim * multiplier;
          matched = true;
        }
      }

      console.log(`- Term: ${term}, isSynonym: ${isSynonym}, matched: ${matched}, score: ${score}`);

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

  const isMatch = matchesCount > 0;
  return { score: totalScore, isMatch };
}

const prod = {
  name: "Nike Air Max 90 Premium Sneakers",
  description: "Step into legacy. Features iconic Max Air cushioning in the heel, premium leather overlays, and durable rubber waffle outsoles.",
  category: "Fashion",
  subcategory: "Footwear",
  brand: "Nike"
};

const result = computeSearchScore(prod, "shoe");
console.log('Result for shoe:', result);
