import fs from 'fs';
import https from 'https';

const PIXABAY_API_KEY = '53628320-d3913f2992daa346486a35e3f';

// Read the current clothing data
const data = JSON.parse(fs.readFileSync('src/data/clothing.json', 'utf8'));

// Map clothing items to specific product search terms that avoid people/models
const PRODUCT_SEARCH_TERMS = {
  'Light Jacket': 'jacket+product',
  'Raincoat': 'raincoat+product',
  'Sweater': 'sweater+product',
  'T-Shirt': 'tshirt+product',
  'Jeans': 'jeans+product',
  'Tank Top': 'tank+top+product',
  'Hoodie': 'hoodie+product',
  'Windbreaker': 'windbreaker+product',
  'Rain Boots': 'rain+boots+product',
  'Umbrella': 'umbrella+product',
  'Thermal Underlayer': 'base+layer+product',
  'Beanie': 'beanie+product',
  'Shorts': 'shorts+clothing+piece+athletic+casual+pants+product',
  'Sandals': 'sandals+product',
  'Scarf': 'scarf+product',
  'Puffer Jacket': 'puffer+jacket+product',
  'Light Gloves': 'gloves+product',
  'Running Shoes': 'running+shoes+product',
  'Cardigan': 'cardigan+product',
  'Leather Jacket': 'leather+jacket+product',
  'Chinos': 'chinos+khaki+clothing+piece+pants+casual+product',
  'Rain Hat': 'rain+hat+product',
  'Dress': 'dress+product',
  'Blazer': 'blazer+product',
  'Baseball Cap': 'baseball+cap+product',
  'Wool Socks': 'socks+product',
  'Rain Pants': 'rain+pants+product',
  'Fleece Jacket': 'fleece+jacket+product',
  'Ankle Boots': 'ankle+boots+product',
  'Sunglasses': 'sunglasses+product',
  'Winter Coat': 'winter+coat+product',
  'Thermal Pants': 'thermal+pants+product',
  'Wool Gloves': 'wool+gloves+product',
  'Snow Boots': 'snow+boots+product',
  'Neck Warmer': 'neck+warmer+product',
  'Long Sleeve Shirt': 'long+sleeve+shirt+product',
  'Linen Shirt': 'linen+shirt+product',
  'Lightweight Pants': 'lightweight+pants+product',
  'Denim Jacket': 'denim+jacket+product',
  'Crop Top': 'crop+top+product'
};

// Item-specific required tags that should appear in the image tags
const REQUIRED_TAGS = {
  'Light Jacket': ['jacket','coat'],
  'Raincoat': ['raincoat','jacket','coat','rain'],
  'Sweater': ['sweater','knit'],
  'T-Shirt': ['tshirt','t-shirt','tee','shirt'],
  'Jeans': ['jeans','denim','pants','trousers'],
  'Tank Top': ['tank','sleeveless','top'],
  'Hoodie': ['hoodie','hooded','sweatshirt'],
  'Windbreaker': ['windbreaker','jacket'],
  'Rain Boots': ['rain','boots','wellies'],
  'Umbrella': ['umbrella'],
  'Thermal Underlayer': ['base layer','thermal','underwear'],
  'Beanie': ['beanie','hat','knit cap'],
  'Shorts': ['shorts','athletic','casual'],
  'Sandals': ['sandals'],
  'Scarf': ['scarf'],
  'Puffer Jacket': ['puffer','down','jacket'],
  'Light Gloves': ['gloves'],
  'Running Shoes': ['running','sneakers','shoes','trainers'],
  'Cardigan': ['cardigan'],
  'Leather Jacket': ['leather','jacket'],
  'Chinos': ['chinos','khaki','casual'],
  'Rain Hat': ['rain','hat'],
  'Dress': ['dress'],
  'Blazer': ['blazer','jacket'],
  'Baseball Cap': ['baseball cap','cap','hat'],
  'Wool Socks': ['wool','socks'],
  'Rain Pants': ['rain pants','waterproof','pants','trousers'],
  'Fleece Jacket': ['fleece','jacket'],
  'Ankle Boots': ['ankle boots','boots'],
  'Sunglasses': ['sunglasses','glasses'],
  'Winter Coat': ['winter','coat','jacket'],
  'Thermal Pants': ['thermal','pants','trousers','base layer'],
  'Wool Gloves': ['wool','gloves'],
  'Snow Boots': ['snow','boots','winter'],
  'Neck Warmer': ['neck warmer','gaiter','scarf'],
  'Long Sleeve Shirt': ['long sleeve','shirt'],
  'Linen Shirt': ['linen','shirt'],
  'Lightweight Pants': ['lightweight','pants','trousers'],
  'Denim Jacket': ['denim','jacket'],
  'Crop Top': ['crop top','top']
};

const GENERIC_TOKENS = new Set(['product','clothing','apparel','isolated','garment','flat','lay','packshot','and','of']);

// Item-specific deny tags to block unwanted results
const ITEM_DENY_TAGS = {
  'Shorts': ['shoe','runner','nike','adidas','lace','sole','insole','midsole','heel','loafer','oxfords'],
  'Chinos': ['shoe','runner','nike','adidas','lace','sole','insole','midsole','heel','loafer','oxfords']
};

function pixabayImageSearch(query) {
  return new Promise((resolve, reject) => {
    // Use specific product search term if available, otherwise extract basic type
    let baseTerm = PRODUCT_SEARCH_TERMS[query] || query.toLowerCase().split(' ').pop() + '+product';
    const variants = [
      `${baseTerm}+clothing+apparel+isolated+product`,
      `${baseTerm}+packshot+isolated`,
      `${baseTerm}+flat+lay+isolated`,
      `${baseTerm}+garment+isolated`,
      `${baseTerm}`
    ];

    const denyTags = ['cosmetics','makeup','lipstick','beauty','face','model','people','woman','man','portrait','skincare','perfume'];
    const perItemDeny = ITEM_DENY_TAGS[query] || [];
    const preferTags = ['isolated','packshot','flat lay','garment','clothing','apparel','product'];
    const clothingTags = ['jacket','coat','pants','trousers','jeans','shirt','tshirt','t-shirt','tee','sweater','hoodie','boots','shoes','socks','gloves','scarf','hat','cap','dress','blazer','cardigan'];

    const buildUrl = (q) => `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${q}&image_type=photo&category=fashion&order=popular&safesearch=true&orientation=horizontal&min_width=400&per_page=20`;

    const getExpectedTokens = (name, baseTerm) => {
      if (REQUIRED_TAGS[name]) return REQUIRED_TAGS[name];
      // derive from base term if mapping not present
      const raw = baseTerm.split('+').filter(t => !GENERIC_TOKENS.has(t));
      return raw;
    };

    const expectedTokens = getExpectedTokens(query, baseTerm).map(t => t.toLowerCase());

    const scoreHit = (h) => {
      const tags = (h.tags || '').toLowerCase();
      if ([...denyTags, ...perItemDeny].some(t => tags.includes(t))) return { score: -Infinity, matches: 0 };
      let score = 0;
      // Strongly favor name-token matches
      const nameMatches = expectedTokens.filter(t => tags.includes(t)).length;
      score += nameMatches * 5;  // Increased weight for name matches
      
      // For items like Shorts/Chinos, require at least one name match or heavily penalize
      if ((query === 'Shorts' || query === 'Chinos') && nameMatches === 0) {
        score -= 100;  // Strong penalty for non-matching items
      }
      
      preferTags.forEach(t => { if (tags.includes(t)) score += 2; });
      clothingTags.forEach(t => { if (tags.includes(t)) score += 1; });
      if (h.imageWidth >= 800 && h.imageHeight >= 600) score += 1;
      return { score, matches: nameMatches };
    };

    const tryNext = (idx) => {
      if (idx >= variants.length) { resolve(null); return; }
      const url = buildUrl(variants[idx]);
      https.get(url, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (result.hits && result.hits.length > 0) {
              const ranked = result.hits
                .map(h => { const r = scoreHit(h); return { h, s: r.score, m: r.matches }; })
                .filter(x => x.s > -Infinity)
                .sort((a, b) => b.s - a.s);
              const strict = ranked.filter(x => x.m > 0);
              const pick = (strict[0] ? strict[0].h : (ranked[0] ? ranked[0].h : result.hits[0]));
              resolve(pick.webformatURL || pick.largeImageURL || null);
            } else {
              tryNext(idx + 1);
            }
          } catch (err) {
            console.error(`Parse error for query "${query}" (variant ${idx}):`, err.message);
            tryNext(idx + 1);
          }
        });
      }).on('error', () => tryNext(idx + 1));
    };

    tryNext(0);
  });
}

async function generateClothingImages() {
  console.log('Fetching images from Pixabay API...\n');
  
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    console.log(`[${i + 1}/${data.length}] ${item.name}`);
    
    try {
      const imageUrl = await pixabayImageSearch(item.name);
      item.image = imageUrl;
      if (imageUrl) {
        console.log(`  ✓ Found image`);
      } else {
        console.log(`  ✗ No image found`);
      }
    } catch (err) {
      console.error(`  ✗ Error:`, err.message);
      item.image = null;
    }
    
    // Rate limiting: wait 200ms between requests
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  // Write updated data
  fs.writeFileSync('src/data/clothing.json', JSON.stringify(data, null, 2));
  console.log('\n✓ clothing.json updated with Pixabay images!');
}

generateClothingImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
