import fs from 'fs';
import https from 'https';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PIXABAY_API_KEY = '53628320-d3913f2992daa346486a35e3f';
const IMAGE_DIR = path.join(__dirname, 'public', 'images', 'clothing');

// Ensure the images directory exists
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// Read the current clothing data
const data = JSON.parse(fs.readFileSync('src/data/clothing.json', 'utf8'));

// Map clothing items to specific product search terms
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

const REQUIRED_TAGS = {
  'Rain Boots': ['rain', 'boots', 'rubber', 'wellington', 'galoshes'],
  'Snow Boots': ['snow', 'boots', 'winter', 'insulated'],
  'Shorts': ['shorts', 'athletic', 'casual']
};

const ITEM_DENY_TAGS = {
  'Rain Boots': ['soccer', 'football', 'cleat', 'cleats', 'stud', 'studs'],
  'Snow Boots': ['soccer', 'football', 'cleat', 'cleats', 'stud', 'studs'],
  'Shorts': ['shoe', 'runner', 'nike', 'adidas', 'lace', 'sole']
};

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
  return baseTerm.split('+').filter(t => !['product', 'clothing', 'apparel', 'isolated', 'garment', 'flat', 'lay', 'packshot'].includes(t));
}

function scoreResult(hit, name) {
  const tags = (hit.tags || '').toLowerCase().split(',').map(t => t.trim());
  const expected = getExpectedTokens(name);
  const denyTags = ITEM_DENY_TAGS[name] || [];

  let score = 0;
  for (const exp of expected) {
    if (tags.some(t => t.includes(exp))) score += 10;
  }

  for (const deny of denyTags) {
    if (tags.some(t => t.includes(deny))) return -999;
  }

  if (hit.likes) score += Math.min(hit.likes / 100, 5);

  return score;
}

function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    const filepath = path.join(IMAGE_DIR, filename);
    const file = fs.createWriteStream(filepath);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filepath);
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchAndSaveImageForItem(item) {
  const variants = buildVariants(item.name);
  let bestImage = null;
  let bestScore = -999;

  for (const variant of variants) {
    const url = `https://pixabay.com/api/?key=${PIXABAY_API_KEY}&q=${variant}&image_type=photo&per_page=50`;
    try {
      const response = await makeRequest(url);
      if (response.hits && response.hits.length > 0) {
        for (const hit of response.hits) {
          const score = scoreResult(hit, item.name);
          if (score > bestScore) {
            bestScore = score;
            bestImage = hit;
          }
        }
      }
      if (bestImage && bestScore > 0) break;
    } catch (error) {
      console.error(`Error fetching for ${item.name} (variant: ${variant}):`, error.message);
    }
  }

  if (!bestImage) {
    console.log(`❌ ${item.name}: No suitable image found`);
    return null;
  }

  try {
    // Generate filename: convert name to kebab-case
    const filename = `${item.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    const imageUrl = bestImage.webformatURL;

    // Download the image
    await downloadImage(imageUrl, filename);

    // Return the local path
    const localPath = `/images/clothing/${filename}`;
    console.log(`✓ ${item.name}: Downloaded to ${localPath}`);
    return localPath;
  } catch (error) {
    console.error(`Error downloading image for ${item.name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Downloading images locally...\n');

  for (const item of data) {
    const localPath = await fetchAndSaveImageForItem(item);
    if (localPath) {
      item.image = localPath;
    }
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Save updated data
  fs.writeFileSync('src/data/clothing.json', JSON.stringify(data, null, 2));
  console.log('\n✓ All done! Images saved to public/images/clothing/');
  console.log('✓ clothing.json updated with local image paths');
}

main().catch(console.error);
