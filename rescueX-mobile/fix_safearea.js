const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens', 'mechanic', 'onboarding');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js') && file !== 'WelcomeScreen.js' && file !== 'SuccessScreen.js' && file !== 'ReviewScreen.js') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace SafeAreaView with View
    content = content.replace(/SafeAreaView/g, 'View');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
