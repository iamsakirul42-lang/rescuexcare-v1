const Jimp = require('jimp');

async function removeWhiteBg() {
  try {
    const image = await Jimp.read('assets/images/kolkata-art.png');
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // Target white and near-white backgrounds
      if (r > 230 && g > 230 && b > 230) {
        this.bitmap.data[idx + 3] = 0; // Fully transparent
      } else {
        // If it's an edge pixel, make it slightly transparent to avoid white halos
        if (r > 200 && g > 200 && b > 200) {
            this.bitmap.data[idx + 3] = 128;
        }
      }
    });
    await image.writeAsync('assets/images/kolkata-art-transparent.png');
    console.log("Background removed successfully!");
  } catch (err) {
    console.error(err);
  }
}
removeWhiteBg();
