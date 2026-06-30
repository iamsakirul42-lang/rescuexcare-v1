const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src', 'screens', 'mechanic', 'onboarding', 'ReviewScreen.js');
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/SafeAreaView/g, 'View');
fs.writeFileSync(file, content, 'utf8');
console.log(`Updated ReviewScreen.js`);
