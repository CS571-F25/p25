import fs from 'fs';
import https from 'https';

const PIXABAY_API_KEY = '53628320-d3913f2992daa346486a35e3f';

if (process.argv.length < 3) {
  console.error('Usage: node fetch-single-pixabay-image.mjs "Item Name"');
  process.exit(1);
}

const ITEM_NAME = process.argv.slice(2).join(' ').trim();

// Load clothing data
const filePath = 'src/data/clothing.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
const item = data.find(d => d.name.toLowerCase() === ITEM_NAME.toLowerCase());
if (!item) {
  console.error(`Item not found: ${ITEM_NAME}`);
  process.exit(2);
}

// Reuse term maps from the batch script when possible
const PRODUCT_SEARCH_TERMS = {
  'Light Jacket': 'jacket+product',
  'Raincoat': 'raincoat+product',
  'Sweater': 'sweater+product',
  'T-Shirt': 'tshirt+product',
  'Jeans': 'jeans+product',
  'Tank Top': 'tank+top+product',
  'Hoodie': 'hoodie+product',
  'Windbreaker': 'windbreaker+product',
  'Rain Boots': 'rain+boots+rubber+wellies+wellington+galoshes+product',
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
  'Hat': 'hat+rain+waterproof+bucket+wide+brim+product',
  'Dress': 'dress+product',
  'Blazer': 'blazer+product',
  'Baseball Cap': 'baseball+cap+product',
  'Wool Socks': 'wool+socks+product',
  'Rain Pants': 'rain+pants+waterproof+product',
  'Fleece Jacket': 'fleece+jacket+product',
  'Ankle Boots': 'ankle+boots+product',
  'Sunglasses': 'sunglasses+product',
  'Winter Coat': 'winter+coat+product',
  'Thermal Pants': 'thermal+pants+trousers+base+layer+product',
  'Wool Gloves': 'wool+gloves+product',
  'Snow Boots': 'snow+boots+winter+insulated+product',
  'Neck Warmer': 'neck+warmer+gaiter+scarf+product',
  'Long Sleeve Shirt': 'long+sleeve+shirt+product',
  'Linen Shirt': 'linen+shirt+product',
  'Lightweight Pants': 'lightweight+pants+trousers+product',
  'Denim Jacket': 'denim+jacket+product',
  'Crop Top': 'crop+top+product'
};

const REQUIRED_TAGS = {
  'Rain Boots': ['rain','boots','wellies','rubber','wellington','galoshes'],
  'Snow Boots': ['snow','boots','winter','insulated'],
  'Hat': ['hat','rain','bucket','wide brim','waterproof'],
  'Shorts': ['shorts','athletic','casual'],
  'Chinos': ['chinos','khaki','casual']
};

const ITEM_DENY_TAGS = {
  'Rain Boots': ['soccer','football','cleat','cleats','stud','studs','spikes','field'],
  'Snow Boots': ['soccer','football','cleat','cleats','stud','studs','spikes','field'],
  'Shorts': ['shoe','runner','nike','adidas','lace','sole','insole','midsole','heel','loafer','oxfords'],
  'Chinos': ['shoe','runner','nike','adidas','lace','sole','insole','midsole','heel','loafer','oxfords']
};

const GENERIC_TOKENS = new Set(['product','clothing','apparel','isolated','garment','flat','lay','packshot','and','of']);

function buildVariants(name) {
  const baseTerm = PRODUCT_SEARCH_TERMS[name] || name.toLowerCase().split(' ').join('+') + '+product';
  return [
    `${baseTerm}+clothing+apparel+isolated+product`,
    `${baseTerm}+packshot+isolated`,
    `${baseTerm}+flat+lay+isolated`,
    `${baseTerm}+garment+isolated`,
    `${baseTerm}`
  ];
}

function getExpectedTokens(name) {
  if (REQUIRED_TAGS[name]) return REQUIRED_TAGS[name].map(t => t.toLowerCase());
  const baseTerm = PRODUCT_SEARCH_TERMS[name] || name.toLowerCase().split(' ').join('+');
  return baseTerm.split('+').filter(t => !GENERIC_TOKENS.has(t));
}

function buildUrl(q) {
  return `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${q}&image_type=photo`;
}

function scoreHit(name, h, expectedTokens) {
  const tags = (h.tags || '').toLowerCase();
  const globalDeny = ['cosmetics','makeup','lipstick','beauty','face','model','people','woman','man','portrait','skincare','perfume','lifestyle','fashion show','outfit','styled','styled outfit'];
  const perItemDeny = ITEM_DENY_TAGS[name] || [];
  
  // Strong denial check
  if ([...globalDeny, ...perItemDeny].some(t => tags.includes(t))) return { score: -Infinity, matches: 0 };
  
  let score = 0;
  
  // Heavily weight exact name token matches (simple product focus)
  const nameMatches = expectedTokens.filter(t => tags.includes(t)).length;
  score += nameMatches * 5;  // Increased from 3 to 5
  
  // For items like Shorts/Chinos, require at least one name match or heavily penalize
  if ((name === 'Shorts' || name === 'Chinos') && nameMatches === 0) {
    score -= 100;  // Strong penalty for non-matching items
  }
  
  // Strong preference for product/packshot tags (simple images)
  const productTags = ['isolated','packshot','flat lay','garment','product','clothing','apparel','white background','simple'];
  productTags.forEach(t => { 
    if (tags.includes(t)) {
      score += (t === 'isolated' || t === 'packshot' || t === 'white background') ? 4 : 2;
    }
  });
  
  // Penalize lifestyle/model-adjacent tags
  const penaltyTags = ['lifestyle','model','styled','woman','man','person','people','outfit','wearing','styled outfit'];
  penaltyTags.forEach(t => {
    if (tags.includes(t)) score -= 3;
  });
  
  // Bonus for image dimensions (bigger images more likely to be clean products)
  if (h.imageWidth >= 1000 && h.imageHeight >= 800) score += 2;
  else if (h.imageWidth >= 800 && h.imageHeight >= 600) score += 1;
  
  // Bonus for high views/likes (popular clean images tend to have more engagement)
  if (h.views > 50000) score += 1;
  if (h.likes > 500) score += 1;
  
  return { score, matches: nameMatches };
}

function fetchOne(name) {
  return new Promise((resolve) => {
    const variants = buildVariants(name);
    const expectedTokens = getExpectedTokens(name);

    const tryNext = (idx) => {
      if (idx >= variants.length) { resolve(null); return; }
      const url = buildUrl(variants[idx]);
      https.get(url, (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
          try {
            const result = JSON.parse(body);
            if (result.hits && result.hits.length > 0) {
              const ranked = result.hits
                .map(h => { const r = scoreHit(name, h, expectedTokens); return { h, s: r.score, m: r.matches }; })
                .filter(x => x.s > -Infinity)
                .sort((a, b) => b.s - a.s);
              
              // Strictly prefer matches with name tokens (simple product focus)
              const strict = ranked.filter(x => x.m > 0);
              if (strict.length > 0) {
                resolve(strict[0].h.webformatURL || strict[0].h.largeImageURL || null);
              } else if (ranked.length > 0 && ranked[0].s > 5) {
                // Only fallback to non-strict match if it has strong scoring
                resolve(ranked[0].h.webformatURL || ranked[0].h.largeImageURL || null);
              } else {
                // Try next variant if no good match found
                tryNext(idx + 1);
              }
            } else {
              tryNext(idx + 1);
            }
          } catch (err) {
            console.error(`Parse error for "${name}" (variant ${idx}):`, err.message);
            tryNext(idx + 1);
          }
        });
      }).on('error', () => tryNext(idx + 1));
    };

    tryNext(0);
  });
}

(async () => {
  console.log(`Fetching image for: ${ITEM_NAME}`);
  const url = await fetchOne(item.name);
  if (!url) {
    console.error('No image found.');
    process.exit(3);
  }
  item.image = url;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log('✓ Updated image for', item.name);
  console.log('URL:', url);
})();
