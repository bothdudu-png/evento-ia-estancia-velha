const fs = require('fs');
const PNG = require('pngjs').PNG;

try {
  const fileData = fs.readFileSync('public/thiago-diaz.jpg');
  const png = PNG.sync.read(fileData);
  console.log(`thiago-diaz.jpg dimensions: ${png.width}x${png.height}`);
  
  let vibrantGreenCount = 0;
  let vibrantPurpleCount = 0;
  const data = png.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i+1];
    const b = data[i+2];
    
    // Check if green neon (high G, lower R and B)
    if (g > 100 && g > r + 40 && g > b + 40) {
      vibrantGreenCount++;
    }
    // Check if purple neon (high R and B, lower G)
    if (r > 100 && b > 100 && r > g + 40 && b > g + 40) {
      vibrantPurpleCount++;
    }
  }
  
  console.log(`Vibrant Green Pixels: ${vibrantGreenCount}`);
  console.log(`Vibrant Purple Pixels: ${vibrantPurpleCount}`);
} catch (err) {
  console.error('Error:', err);
}
