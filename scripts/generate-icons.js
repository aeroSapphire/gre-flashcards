import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="64" fill="#7c3aed"/>
  <g transform="translate(256, 256)">
    <!-- Graduation cap -->
    <path d="M-128 -20 L0 -85 L128 -20 L0 45 Z" fill="white"/>
    <path d="M-85 0 L-85 64 Q0 107 85 64 L85 0 L0 45 Z" fill="white" opacity="0.9"/>
    <rect x="96" y="-20" width="16" height="107" fill="white"/>
    <circle cx="104" cy="96" r="21" fill="white"/>
  </g>
</svg>`;

const sizes = [192, 512];

async function generateIcons() {
  for (const size of sizes) {
    const outputPath = join(__dirname, '..', 'public', `pwa-${size}x${size}.png`);

    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`Generated ${outputPath}`);
  }
}

generateIcons().catch(console.error);
