const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens', 'mechanic', 'onboarding');
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js') && file !== 'WelcomeScreen.js' && file !== 'SuccessScreen.js') {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace duplicate View import
    // Specifically looking for ", View" and replacing it where it appears twice
    content = content.replace(/import {([^}]*)View([^}]*)View([^}]*)} from 'react-native';/, "import {$1View$2$3} from 'react-native';");
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed import in ${file}`);
  }
});
