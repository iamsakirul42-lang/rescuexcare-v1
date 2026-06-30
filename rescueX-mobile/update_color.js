const fs = require('fs');
const files = [
  'c:\\Users\\dears\\Desktop\\rescueX\\Verified.json',
  'c:\\Users\\dears\\Desktop\\rescueX\\rescueX-mobile\\assets\\lottie\\Verified.json'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // Replace the red color array [0.8471,0.0392,0.1765,1] with yellow [1, 0.843, 0, 1]
    content = content.replace(/\[0\.8471,0\.0392,0\.1765,1\]/g, '[1,0.843,0,1]');
    fs.writeFileSync(file, content, 'utf8');
    console.log('Updated color in', file);
  }
});
