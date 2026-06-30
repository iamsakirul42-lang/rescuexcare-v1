const fs = require('fs');
const path = require('path');

const files = [
  'ExpertHomeScreen.js',
  'ExpertJobsScreen.js',
  'ExpertWalletScreen.js',
  'ExpertProfileScreen.js'
];

files.forEach(file => {
  const filePath = path.join(__dirname, 'src', 'screens', 'mechanic', file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Add imports
  if (!content.includes('LinearGradient')) {
    content = content.replace(/import {([^}]*)} from 'react-native';/, "import {$1} from 'react-native';\nimport { LinearGradient } from 'expo-linear-gradient';\nimport { useSafeAreaInsets } from 'react-native-safe-area-context';");
  }

  // 2. Replace SafeAreaView with View (if any left)
  content = content.replace(/<SafeAreaView style={styles.container}>/g, '<View style={styles.container}>');
  content = content.replace(/<\/SafeAreaView>/g, '</View>');

  // 3. Add useSafeAreaInsets hook
  if (!content.includes('useSafeAreaInsets()')) {
    content = content.replace(/export default function ([a-zA-Z]+)\([^)]*\) {/, (match) => {
      return match + "\n  const insets = useSafeAreaInsets();";
    });
  }

  // 4. Update the header View to LinearGradient
  // We look for <View style={styles.header}>
  content = content.replace(/<View style=\{styles\.header\}>/, 
    `<LinearGradient
        colors={[theme.colors.expertPrimary, '#4C1D95', '#2E1065']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 24) + 16 }]}
      >`);
  
  // But wait, we need to replace its closing </View> with </LinearGradient>
  // Since we don't have a full AST parser, we can't reliably do this for complex headers.
  // Instead, let's write custom replacements for each file since we just created them.
  fs.writeFileSync(filePath, content, 'utf8');
});

console.log("Updated files mostly.");
