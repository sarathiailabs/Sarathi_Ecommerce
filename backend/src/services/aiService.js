import { GoogleGenerativeAI } from '@google/generative-ai';
import settings from '../config/settings.js';
import supabase from '../db/supabase.js';

let genAI = null;
let hasGemini = false;

if (settings.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(settings.GEMINI_API_KEY);
    hasGemini = true;
    console.log('[AI SERVICE] Google Gemini SDK successfully configured.');
  } catch (e) {
    console.error(`[AI SERVICE] Failed to configure Gemini SDK: ${e.message}`);
  }
} else {
  console.log('[AI SERVICE] No GEMINI_API_KEY found. Falling back to simulated keyword engine.');
}

const SIMULATED_CATALOG = {
  headphones: "**Prathazon Sound Pro Wireless Headphones** (₹149.99)\nExperience top-tier audio with Active Noise Cancellation (ANC), 40-hour battery life, and high-fidelity sound. They have 100 units in stock! 🎧",
  watch: "**Titanium Smart Watch Series 5** (₹299.99)\nAn incredible watch with premium fitness tracking, AMOLED display, built-in GPS, and advanced heart health monitoring. 75 units in stock! ⌚",
  chair: "**Ergonomic Office Chair** (₹189.50)\nAdjustable lumbar support, 3D armrests, breathable mesh, and tilt lock. Perfect for long coding or browsing sessions! 🪑",
  wallet: "**Minimalist Leather Wallet** (₹45.00)\nRFID blocking, handcrafted top-grain leather with an ultra-thin profile. 120 units in stock! 💼",
  backpack: "**Urban Explorer Backpack** (₹85.00)\nWater-resistant, padded 15.6\" laptop slot, integrated USB charging port, and ergonomic design. 90 units in stock! 🎒",
  jacket: "**Classic Denim Jacket** (₹79.99)\nHeavy-duty denim, chest pockets, timeless relaxed fit. 110 units in stock! 🧥",
  shoes: "**Comfort Running Shoes** (₹120.00)\nLightweight breathable knit mesh with impact-absorbing foam soles. 85 units in stock! 👟",
  lamp: "**Smart LED Desk Lamp** (₹35.99)\nDimmable lighting, 5 color modes, built-in wireless charging pad. 150 units in stock! 💡",
  bottle: "**Stainless Steel Water Bottle** (₹24.99)\nDouble-wall vacuum insulation, keeps drinks cold for 24h/hot for 12h. 200 units in stock! 💧",
  diffuser: "**Aromatherapy Oil Diffuser** (₹29.99)\nQuiet ultrasonic cool mist, 7 color LED lights, auto-off. 130 units in stock! 🌸"
};

function getSimulatedResponse(userMsg, products = []) {
  const userMsgLower = userMsg.toLowerCase();

  // If products are available, use the dynamic database search
  if (products && products.length > 0) {
    // 1. Greetings Intent
    if (userMsgLower.includes('hello') || userMsgLower.includes('hi ') || userMsgLower.includes('hey')) {
      return (
        "👋 **Welcome to Nova Cart Smart Living Assistant!**\n\n" +
        "I am your dedicated AI guide. You can ask me to recommend gadgets, check pricing, " +
        "or find details about headphones, smart watches, office chairs, and backpacks!\n\n" +
        "What premium product are you looking to add to your luxury lifestyle today?"
      );
    }

    // 2. Recommendations / Featured / Suggest Intent
    if (userMsgLower.includes('recommend') || userMsgLower.includes('best') || userMsgLower.includes('suggest') || userMsgLower.includes('featured') || userMsgLower.includes('top')) {
      const featured = products.filter(p => p.is_featured).slice(0, 4);
      const itemsToUse = featured.length > 0 ? featured : products.slice(0, 4);
      
      const itemList = itemsToUse.map((p, idx) => 
        `${idx + 1}. **${p.name}** (₹${p.price})\n` +
        `   *Specs:* ${p.description.substring(0, 100)}...\n` +
        `   *Stock:* ${p.stock} remaining.`
      ).join('\n\n');

      return (
        "🌟 **Nova Cart Top Smart Recommendations:**\n\n" +
        itemList +
        "\n\nWould you like me to add any of these premium products to your cart? Just click **Buy** on the home page!"
      );
    }

    // 3. Office Setup / Workspace Intent (Handles "Suggest products to buy for my office setup")
    if (userMsgLower.includes('office') || userMsgLower.includes('setup') || userMsgLower.includes('workspace') || userMsgLower.includes('chair') || userMsgLower.includes('lamp') || userMsgLower.includes('desk') || userMsgLower.includes('seating') || userMsgLower.includes('furniture')) {
      const officeProducts = products.filter(p => {
        const name = p.name.toLowerCase();
        const desc = p.description.toLowerCase();
        const cat = p.category.toLowerCase();
        return name.includes('chair') || name.includes('lamp') || name.includes('desk') || name.includes('monitor') || name.includes('keyboard') || name.includes('mouse') || 
               desc.includes('office') || desc.includes('workspace') || desc.includes('ergonomic') || cat.includes('home & kitchen') && (name.includes('chair') || name.includes('table'));
      }).slice(0, 4);

      if (officeProducts.length > 0) {
        const itemList = officeProducts.map(p => 
          `- **${p.name}** (₹${p.price})\n` +
          `  ${p.description}\n` +
          `  *Stock:* ${p.stock} remaining`
        ).join('\n\n');

        return (
          "🪑 **Premium Home Office & Workspace Essentials:**\n\n" +
          itemList +
          "\n\nOptimize your coding setup, maximize productivity, and protect your back with these luxurious workspace items!"
        );
      }
    }

    // 4. Fitness / Sport Intent
    if (userMsgLower.includes('fitness') || userMsgLower.includes('gym') || userMsgLower.includes('workout') || userMsgLower.includes('sport') || userMsgLower.includes('yoga') || userMsgLower.includes('run')) {
      const fitnessProducts = products.filter(p => {
        const name = p.name.toLowerCase();
        const desc = p.description.toLowerCase();
        const cat = p.category.toLowerCase();
        return name.includes('fitness') || name.includes('gym') || name.includes('workout') || name.includes('sport') || name.includes('yoga') || name.includes('run') || name.includes('shoe') ||
               desc.includes('fitness') || desc.includes('workout') || desc.includes('yoga') || cat.includes('sports & fitness');
      }).slice(0, 4);

      if (fitnessProducts.length > 0) {
        const itemList = fitnessProducts.map(p => 
          `- **${p.name}** (₹${p.price})\n` +
          `  ${p.description}\n` +
          `  *Stock:* ${p.stock} remaining`
        ).join('\n\n');

        return (
          "🏃 **Premium Fitness & Active Living Essentials:**\n\n" +
          itemList +
          "\n\nStay fit, active, and monitor your health metrics with these top products!"
        );
      }
    }

    // 5. Headphones / Audio Intent
    if (userMsgLower.includes('headphone') || userMsgLower.includes('earphone') || userMsgLower.includes('audio') || userMsgLower.includes('sound') || userMsgLower.includes('music') || userMsgLower.includes('speaker')) {
      const audioProducts = products.filter(p => {
        const name = p.name.toLowerCase();
        const desc = p.description.toLowerCase();
        return name.includes('headphone') || name.includes('earphone') || name.includes('audio') || name.includes('sound') || name.includes('music') || name.includes('speaker') || desc.includes('headphone') || desc.includes('audio');
      }).slice(0, 4);

      if (audioProducts.length > 0) {
        const itemList = audioProducts.map(p => 
          `- **${p.name}** (₹${p.price})\n` +
          `  ${p.description}\n` +
          `  *Stock:* ${p.stock} remaining`
        ).join('\n\n');

        return (
          "🎧 **Premium Audio & Sound Products:**\n\n" +
          itemList +
          "\n\nExperience high-fidelity sound and immersive active noise cancellation with these premium items!"
        );
      }
    }

    // 6. Stock / Inventory Intent
    if (userMsgLower.includes('stock') || userMsgLower.includes('inventory') || userMsgLower.includes('available')) {
      const inStock = products.filter(p => p.stock > 0).slice(0, 5);
      const itemList = inStock.map(p => 
        `- **${p.name}** (₹${p.price}) - Category: *${p.category}* (${p.stock} remaining)`
      ).join('\n');

      return (
        "📦 **Current Active Store Inventory:**\n\n" +
        "Yes, we have many premium items fully in stock and ready to ship. Here are some of our popular available products:\n\n" +
        itemList +
        "\n\nFeel free to explore our home page and click **Buy** to add any of these to your cart!"
      );
    }

    // 7. General search keyword matching
    const words = userMsgLower.split(/\s+/).filter(w => w.length > 2 && w !== 'the' && w !== 'and' && w !== 'for' && w !== 'you' && w !== 'what');
    if (words.length > 0) {
      const matched = [];
      for (const p of products) {
        const nameLower = p.name.toLowerCase();
        const descLower = p.description.toLowerCase();
        const catLower = p.category.toLowerCase();
        const brandLower = p.brand ? p.brand.toLowerCase() : '';
        
        let score = 0;
        for (const word of words) {
          if (nameLower.includes(word)) score += 3;
          if (descLower.includes(word)) score += 1;
          if (catLower.includes(word)) score += 2;
          if (brandLower.includes(word)) score += 2;
        }
        
        if (score > 0) {
          matched.push({ product: p, score });
        }
      }

      if (matched.length > 0) {
        matched.sort((a, b) => b.score - a.score);
        const topMatches = matched.slice(0, 4);
        
        const itemList = topMatches.map(m => 
          `- **${m.product.name}** (₹${m.product.price})\n` +
          `  ${m.product.description}\n` +
          `  *Stock:* ${m.product.stock} remaining`
        ).join('\n\n');

        return (
          "🤖 *[Simulated Assistant]* I found some matching products in our catalog for you:\n\n" +
          itemList +
          "\n\nWould you like me to help you find anything else?"
        );
      }
    }
  }

  // Fallback to static catalog keywords if products are empty
  const matchedItems = [];
  for (const [key, value] of Object.entries(SIMULATED_CATALOG)) {
    if (userMsgLower.includes(key)) {
      matchedItems.push(value);
    }
  }

  if (matchedItems.length > 0) {
    return (
      "🤖 *[Simulated Assistant]* I would love to help you find that! Here is what we have in our store:\n\n" +
      matchedItems.join('\n\n') +
      "\n\nWould you like me to add any of these premium products to your cart? Just click **Buy** on the home page!"
    );
  }

  if (userMsgLower.includes('hello') || userMsgLower.includes('hi ') || userMsgLower.includes('hey')) {
    return (
      "👋 **Welcome to Nova Cart Smart Living Assistant!**\n\n" +
      "I am your dedicated AI guide. You can ask me to recommend gadgets, check pricing, " +
      "or find details about headphones, smart watches, office chairs, and backpacks!\n\n" +
      "What premium product are you looking to add to your luxury lifestyle today?"
    );
  }

  if (userMsgLower.includes('recommend') || userMsgLower.includes('best') || userMsgLower.includes('smart')) {
    return (
      "🌟 **Nova Cart Top Smart Recommendations:**\n\n" +
      "1. 🎧 **Prathazon Sound Pro Headphones** (₹149.99) - Essential for music and focus.\n" +
      "2. ⌚ **Titanium Smart Watch Series 5** (₹299.99) - A gorgeous health companion on your wrist.\n" +
      "3. 🪑 **Ergonomic Office Chair** (₹189.50) - Protect your back and maximize productivity.\n\n" +
      "All of these are fully in stock and ready to ship!"
    );
  }

  return (
    "🤖 *[Simulated Assistant]* Thanks for asking! I am currently running in demo mode. " +
    "I can help you find products like **headphones**, **watches**, **office chairs**, **backpacks**, " +
    "**wallets**, **jackets**, or **running shoes**.\n\n" +
    "Try asking me: *'What headphones do you have?'* or *'Recommend the best products!'*"
  );
}

export const aiService = {
  async chatWithAssistant(message, history = []) {
    // 1. Fetch active products catalog context
    let catalogContext = 'Product catalog currently unavailable.';
    let productsList = [];
    try {
      const { data: products } = await supabase
        .from('products')
        .select('*');

      if (products && products.length > 0) {
        productsList = products;
        const catalogItems = products.map(p => 
          `- Product: ${p.name}\n` +
          `  ID: ${p.id}\n` +
          `  Category: ${p.category}\n` +
          `  Price: ₹${p.price}\n` +
          `  Stock: ${p.stock} remaining\n` +
          `  Specs: ${p.description}\n`
        );
        catalogContext = catalogItems.join('\n');
      }
    } catch (e) {
      console.error('[AI SERVICE] Error compiling product context:', e);
    }

    // 2. Call Gemini if available, otherwise use simulation
    if (hasGemini && genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const systemInstruction = (
          "You are the Nova Cart (Prathazon) E-Commerce Personal AI Assistant.\n" +
          "Your job is to answer questions, guide buyers, and recommend smart-living products.\n\n" +
          "Here is the ACTIVE real-time store inventory:\n" +
          `${catalogContext}\n\n` +
          "Rules:\n" +
          "1. Be helpful, professional, polite, and engaging. Use shopping and gadget emojis nicely.\n" +
          "2. ONLY suggest products that exist in the catalog above. If a user asks about items we don't carry (e.g. food, cars), " +
          "kindly explain that we specialize in Smart Living accessories (Headphones, Watches, Office Chairs, LED Lamps, etc.) and direct them to what we do sell.\n" +
          "3. Print product prices and stock explicitly so they know what's available.\n" +
          "4. Keep replies formatting in clean, readable markdown (bolding, lists, etc.) and relatively concise."
        );

        // Format system instruction + active user prompt into generation payload
        const contents = [];

        // Build history (slice last 6 exchanges)
        for (const msg of history.slice(-6)) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          });
        }

        // Add final prompt
        const fullPrompt = `${systemInstruction}\n\nUser Message: ${message}\nAI Assistant Response:`;
        contents.push({
          role: 'user',
          parts: [{ text: fullPrompt }]
        });

        const result = await model.generateContent({
          contents
        });

        const responseText = result.response.text();
        return {
          response: responseText.trim(),
          is_simulated: false
        };
      } catch (e) {
        console.error('[AI SERVICE] Gemini API call error:', e, 'Falling back to simulation.');
        return {
          response: getSimulatedResponse(message, productsList),
          is_simulated: true
        };
      }
    } else {
      return {
        response: getSimulatedResponse(message, productsList),
        is_simulated: true
      };
    }
  }
};

export default aiService;
