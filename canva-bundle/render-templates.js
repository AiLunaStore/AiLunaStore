/**
 * Canva Bundle Template Renderer
 * Renders HTML template designs to PNG/PDF files
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const TEMPLATE_DIR = path.join(__dirname, 'templates');
const OUTPUT_PNG = path.join(__dirname, 'exports', 'png');
const OUTPUT_PDF = path.join(__dirname, 'exports', 'pdf');

// Template specs: [htmlFile, containerSelector, baseName, width, height]
const TEMPLATES = [
  // Instagram Posts (12) - 1080x1080
  { file: 'instagram-posts/index.html', selector: '.template', base: 'ig-post', width: 1080, height: 1080, type: 'instagram-posts' },
  // Instagram Stories (10) - 1080x1920
  { file: 'instagram-stories/index.html', selector: '.template', base: 'ig-story', width: 1080, height: 1920, type: 'instagram-stories' },
  // LinkedIn Banners (6) - 1584x396
  { file: 'linkedin-banners/index.html', selector: '.template', base: 'li-banner', width: 1584, height: 396, type: 'linkedin-banners' },
  // YouTube Thumbnails (8) - 1280x720
  { file: 'youtube-thumbnails/index.html', selector: '.template', base: 'yt-thumb', width: 1280, height: 720, type: 'youtube-thumbnails' },
  // Presentation Slides (5) - 1920x1080
  { file: 'presentations/index.html', selector: '.template', base: 'slide', width: 1920, height: 1080, type: 'presentations' },
];

async function renderTemplate(browser, htmlPath, selector, index, width, height, outputPath) {
  const page = await browser.newPage();
  
  // Disable network requests for fonts (use system fonts fallback)
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().startsWith('http')) {
      // Block external requests except for fonts we need
      const url = req.url();
      if (!url.includes('fonts.googleapis.com') && !url.includes('fonts.gstatic.com')) {
        req.abort();
      } else {
        req.continue();
      }
    } else {
      req.continue();
    }
  });

  try {
    // Set viewport
    await page.setViewport({ width, height, deviceScaleFactor: 2 });
    
    // Load HTML file
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Extract specific template
    const templates = await page.$$(selector);
    
    if (index >= templates.length) {
      console.log(`  Template index ${index} not found (only ${templates.length} templates)`);
      await page.close();
      return false;
    }

    // Get bounding box of the target template
    const bbox = await templates[index].boundingBox();
    
    if (!bbox) {
      console.log(`  Could not get bounding box for template ${index}`);
      await page.close();
      return false;
    }

    // Capture screenshot
    await page.screenshot({
      path: outputPath.replace('.pdf', '.png'),
      clip: {
        x: bbox.x,
        y: bbox.y,
        width: bbox.width,
        height: bbox.height
      },
      omitBackground: false
    });

    // Also create PDF
    const pdfPath = outputPath.replace('.png', '.pdf');
    await page.pdf({
      path: pdfPath,
      width: `${bbox.width}px`,
      height: `${bbox.height}px`,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    console.log(`  ✓ Rendered: ${path.basename(outputPath)} (PNG + PDF)`);
    return true;
  } catch (err) {
    console.error(`  ✗ Error rendering template ${index}: ${err.message}`);
    return false;
  } finally {
    await page.close();
  }
}

async function processTemplate(spec) {
  const htmlPath = path.join(TEMPLATE_DIR, spec.file);
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Count templates in HTML - class contains "template" as separate class
  const count = (htmlContent.match(/class="[^"]*\btemplate\b[^"]*"/g) || []).length;
  
  console.log(`\n📁 Processing ${spec.file} (${count} templates)`);
  
  // Create output directories
  const pngDir = path.join(OUTPUT_PNG, spec.type);
  const pdfDir = OUTPUT_PDF;
  
  if (!fs.existsSync(pngDir)) fs.mkdirSync(pngDir, { recursive: true });
  if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  let successCount = 0;
  
  for (let i = 0; i < count; i++) {
    const num = String(i + 1).padStart(2, '0');
    const pngPath = path.join(pngDir, `${spec.base}-${num}.png`);
    
    const success = await renderTemplate(
      browser,
      htmlPath,
      spec.selector,
      i,
      spec.width,
      spec.height,
      pngPath
    );
    
    if (success) {
      successCount++;
      
      // Also save to main exports folder with numbering
      const mainExport = path.join(OUTPUT_PNG, `${spec.type}-${num}.png`);
      fs.copyFileSync(pngPath, mainExport);
    }
  }
  
  await browser.close();
  return { spec, count, successCount };
}

async function main() {
  console.log('🎨 Canva Bundle Template Renderer');
  console.log('==================================\n');
  
  // Ensure output directories exist
  if (!fs.existsSync(OUTPUT_PNG)) fs.mkdirSync(OUTPUT_PNG, { recursive: true });
  if (!fs.existsSync(OUTPUT_PDF)) fs.mkdirSync(OUTPUT_PDF, { recursive: true });
  
  const startTime = Date.now();
  
  const results = [];
  for (const spec of TEMPLATES) {
    const result = await processTemplate(spec);
    results.push(result);
  }
  
  // Summary
  console.log('\n\n📊 RENDER SUMMARY');
  console.log('=================');
  
  let total = 0;
  let success = 0;
  
  for (const r of results) {
    const typeName = r.spec.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    console.log(`  ${typeName}: ${r.successCount}/${r.count} templates`);
    total += r.count;
    success += r.successCount;
  }
  
  console.log(`\n  TOTAL: ${success}/${total} templates rendered`);
  console.log(`  Time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  console.log(`\n📁 Output: exports/png/`);
  console.log('✅ Rendering complete!\n');
}

main().catch(console.error);
