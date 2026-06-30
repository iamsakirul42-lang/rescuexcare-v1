const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'screens', 'mechanic', 'onboarding');

const filesToFix1 = ['AddressScreen.js', 'BankDetailsScreen.js', 'EmergencyContactScreen.js', 'ExperienceScreen.js', 'PersonalInfoScreen.js'];
filesToFix1.forEach(file => {
  const filePath = path.join(dir, file);
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines[1] = "import { View, Text, StyleSheet, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView } from 'react-native';";
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
});

const filesToFix2 = ['DocumentsScreen.js', 'ServicesScreen.js', 'VehicleExpertiseScreen.js'];
filesToFix2.forEach(file => {
  const filePath = path.join(dir, file);
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines[1] = "import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';";
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
});

const filesToFix3 = ['ReviewScreen.js'];
filesToFix3.forEach(file => {
  const filePath = path.join(dir, file);
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines[1] = "import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';";
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
});

console.log("Fixed all imports perfectly!");
