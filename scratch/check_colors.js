const fs = require('fs');
const jpeg = require('jpeg-js');

try {
  const fileData = fs.readFileSync('public/thiago-diaz.jpg');
  const rawData = jpeg.decode(fileData);
  console.log(`Image dimensions: ${rawData.width}x${rawData.height}`);
  
  // Sample a few pixels from the neon areas.
  // Neon is usually on the left side of the photo, e.g. x between 50 and 300, y between 100 and 500
  let samples = [];
  const stepX = Math.floor(rawData.width / 10);
  const stepY = Math.floor(rawData.height / 10);
  
  for (let y = stepY; y < rawData.height; y += stepY) {
    for (let x = stepX; x < rawData.width; x += stepX) {
      const idx = (y * rawData.width + x) * 4;
      const r = rawData.data[idx];
      const g = rawData.data[idx+1];
      const b = rawData.data[idx+2];
      
      // If pixel is vibrant (not greyscale and not black)
      const maxVal = Math.max(r, g, b);
      const minVal = Math.min(r, g, b);
      if (maxVal - minVal > 40 && maxVal > 80) {
        samples.push({ x, y, r, g, b });
      }
    }
  }
  
  console.log('Vibrant pixel samples found:');
  console.log(samples.slice(0, 30));
} catch (err) {
  console.error('Error:', err);
}
