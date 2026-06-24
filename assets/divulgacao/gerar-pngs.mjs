import puppeteer from 'puppeteer';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const cards = [
  { file: 'card-feed-anuncio.html',  width: 1080, height: 1080,  out: 'card-feed-anuncio.png'  },
  { file: 'card-feed-roi.html',      width: 1080, height: 1080,  out: 'card-feed-roi.png'      },
  { file: 'card-story-anuncio.html', width: 1080, height: 1920,  out: 'card-story-anuncio.png' },
  { file: 'card-story-urgencia.html',width: 1080, height: 1920,  out: 'card-story-urgencia.png'},
];

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

for (const card of cards) {
  const page = await browser.newPage();
  await page.setViewport({ width: card.width, height: card.height, deviceScaleFactor: 2 });
  const url = 'file:///' + resolve(__dirname, card.file).replace(/\\/g, '/');
  await page.goto(url, { waitUntil: 'networkidle0' });
  const outPath = resolve(__dirname, card.out);
  await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: card.width, height: card.height } });
  await page.close();
  console.log('✓', card.out);
}

await browser.close();
console.log('\nPNGs salvos em:', __dirname);
