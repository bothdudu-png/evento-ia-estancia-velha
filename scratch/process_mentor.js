const fs = require('fs');
const jpeg = require('jpeg-js');
const PNG = require('pngjs').PNG;

try {
  console.log('Reading public/thiago_diaz.png...');
  const jpegData = fs.readFileSync('public/thiago_diaz.png');
  const rawImageData = jpeg.decode(jpegData, { useTStringInJS: false });

  const width = rawImageData.width;
  const height = rawImageData.height;
  const data = rawImageData.data; // RGBA buffer

  console.log(`Dimensions: ${width}x${height}`);
  const png = new PNG({ width, height });

  let keyedOutCount = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Key out dark background pixels
    const isDark = (r < 50 && g < 50 && b < 55);

    // Key out highly saturated purple/pink neon pixels
    // The neon is extremely bright pink/magenta: high red & blue, low green.
    const isPurpleNeon = (r > 70 && b > 70 && r > g + 30 && b > g + 30);

    if (isDark || isPurpleNeon) {
      png.data[i] = 0;
      png.data[i + 1] = 0;
      png.data[i + 2] = 0;
      png.data[i + 3] = 0; // Transparent
      keyedOutCount++;
    } else {
      png.data[i] = r;
      png.data[i + 1] = g;
      png.data[i + 2] = b;
      png.data[i + 3] = 255; // Opaque
    }
  }

  console.log(`Keyed out ${keyedOutCount} of ${width * height} pixels (${Math.round(keyedOutCount / (width * height) * 100)}%)`);

  png.pack()
    .pipe(fs.createWriteStream('public/thiago_diaz_cutout.png'))
    .on('finish', () => {
      console.log('Transparent cutout created at public/thiago_diaz_cutout.png');
    });
} catch (err) {
  console.error('Error processing image:', err);
}
