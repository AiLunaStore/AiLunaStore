/**
 * PNG to PDF Converter
 * Creates PDF files from rendered PNG templates
 */

const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const OUTPUT_PNG = path.join(__dirname, 'exports', 'png');
const OUTPUT_PDF = path.join(__dirname, 'exports', 'pdf');

async function createPdfFromPng(pngPath, pdfPath) {
  const pngBytes = fs.readFileSync(pngPath);
  const pdfDoc = await PDFDocument.create();
  
  // Embed the PNG image
  const pngImage = await pdfDoc.embedPng(pngBytes);
  
  // Get image dimensions
  const { width, height } = pngImage.scale(1);
  
  // Create a page with the same dimensions
  const page = pdfDoc.addPage([width, height]);
  
  // Draw the image to fill the page
  page.drawImage(pngImage, {
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
  });
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(pdfPath, pdfBytes);
}

async function main() {
  console.log('📄 Creating PDF files from PNGs...\n');
  
  // Ensure PDF output directory exists
  if (!fs.existsSync(OUTPUT_PDF)) {
    fs.mkdirSync(OUTPUT_PDF, { recursive: true });
  }
  
  // Get all PNG files from the main export directory
  const pngFiles = fs.readdirSync(OUTPUT_PNG)
    .filter(f => f.endsWith('.png'))
    .sort();
  
  console.log(`Found ${pngFiles.length} PNG files\n`);
  
  let success = 0;
  for (const pngFile of pngFiles) {
    const pngPath = path.join(OUTPUT_PNG, pngFile);
    const pdfPath = path.join(OUTPUT_PDF, pngFile.replace('.png', '.pdf'));
    
    try {
      await createPdfFromPng(pngPath, pdfPath);
      console.log(`  ✓ ${pngFile.replace('.png', '.pdf')}`);
      success++;
    } catch (err) {
      console.error(`  ✗ Failed to create ${pdfFile}: ${err.message}`);
    }
  }
  
  console.log(`\n✅ Created ${success}/${pngFiles.length} PDF files\n`);
}

main().catch(console.error);
