const fs = require('fs');
const jpeg = require('jpeg-js');
const PNG = require('pngjs').PNG;

function decodeImage(filePath) {
  const buffer = fs.readFileSync(filePath);
  const isPng = (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47);
  
  if (isPng) {
    console.log(`Decoding ${filePath} as PNG...`);
    const png = PNG.sync.read(buffer);
    return {
      data: png.data,
      width: png.width,
      height: png.height,
      isPng: true
    };
  } else {
    console.log(`Decoding ${filePath} as JPEG...`);
    const raw = jpeg.decode(buffer, { useTStringInJS: false });
    return {
      data: raw.data,
      width: raw.width,
      height: raw.height,
      isPng: false
    };
  }
}

function getPurpleFactor(r, g, b) {
  // Purple neon: high R, high B, low G.
  // We want to detect where blue is significantly higher than green, and red is also higher than green.
  const bgDiff = b - g;
  const rgDiff = r - g;
  
  // If blue is at least 25 higher than green, and red is at least 10 higher than green:
  const bWeight = Math.max(0, Math.min(1, (bgDiff - 20) / 30));
  const rWeight = Math.max(0, Math.min(1, (rgDiff - 5) / 25));
  
  return bWeight * rWeight;
}

function getGreenFactor(r, g, b) {
  // Green neon: high G, low R.
  // We want to detect where green is significantly higher than red.
  const grDiff = g - r;
  
  // If green is at least 20 higher than red:
  return Math.max(0, Math.min(1, (grDiff - 15) / 35));
}

function shiftColor(img, getWeightFn, targetColor, outPath) {
  const { data, width, height } = img;
  const len = width * height * 4;
  const outputBuffer = Buffer.alloc(len);
  
  const [tr, tg, tb] = targetColor;
  
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    const a = data[i+3];
    
    const w = getWeightFn(r, g, b);
    
    if (w > 0) {
      // Calculate luminance
      const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      
      // Target color scaled by luminance.
      let targetR = Math.round(tr * (lum / 135));
      let targetG = Math.round(tg * (lum / 135));
      let targetB = Math.round(tb * (lum / 135));
      
      // If the pixel is very bright, blend it with white to preserve glow highlights
      if (lum > 160) {
        const whiteBlend = (lum - 160) / (255 - 160);
        targetR = Math.round(targetR * (1 - whiteBlend) + 255 * whiteBlend);
        targetG = Math.round(targetG * (1 - whiteBlend) + 255 * whiteBlend);
        targetB = Math.round(targetB * (1 - whiteBlend) + 255 * whiteBlend);
      }
      
      outputBuffer[i] = Math.max(0, Math.min(255, Math.round(r * (1 - w) + targetR * w)));
      outputBuffer[i+1] = Math.max(0, Math.min(255, Math.round(g * (1 - w) + targetG * w)));
      outputBuffer[i+2] = Math.max(0, Math.min(255, Math.round(b * (1 - w) + targetB * w)));
    } else {
      outputBuffer[i] = r;
      outputBuffer[i+1] = g;
      outputBuffer[i+2] = b;
    }
    outputBuffer[i+3] = a;
  }
  
  // Encode and save as JPEG to save space
  console.log(`Saving shifted image to ${outPath}...`);
  const jpegData = jpeg.encode({
    data: outputBuffer,
    width: width,
    height: height
  }, 90);
  
  fs.writeFileSync(outPath, jpegData.data);
}

try {
  // Load original images
  console.log('Loading mentor original image...');
  const mentorImg = decodeImage('public/thiago-diaz.jpg');
  
  console.log('Loading keyboard original image...');
  const keyboardImg = decodeImage('public/method-coding.jpg');
  
  const colors = [
    { name: 'green',  rgb: [16, 226, 122] }, // IA. Green (#10E27A)
    { name: 'orange', rgb: [217, 119, 87] }, // Claude Orange (#D97757)
    { name: 'pink',   rgb: [255, 77, 141] },  // Lovable Pink (#FF4D8D)
    { name: 'replit', rgb: [242, 98, 7] },    // Replit Orange (#F26207)
    { name: 'cursor', rgb: [229, 231, 235] }, // Cursor Grey (#E5E7EB)
    { name: 'blue',   rgb: [79, 139, 255] }   // Antigravity Blue (#4F8BFF)
  ];
  
  for (const color of colors) {
    console.log(`\n--- Processing Color: ${color.name.toUpperCase()} ---`);
    shiftColor(mentorImg, getGreenFactor, color.rgb, `public/mentor-${color.name}.jpg`);
    shiftColor(keyboardImg, getGreenFactor, color.rgb, `public/keyboard-${color.name}.jpg`);
  }
  
  console.log('\nAll color variations processed and saved successfully!');
} catch (err) {
  console.error('Processing failed:', err);
}
