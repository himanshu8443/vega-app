#!/usr/bin/env node

/**
 * Script to setup local FFmpeg Kit AAR file for build
 * This ensures the local AAR is properly configured for CI/CD builds
 * where remote repositories are not available
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const libsDir = path.join(rootDir, 'android', 'app', 'libs');
const aarFile = path.join(libsDir, 'ffmpeg-kit-https-gpl-6.0-2.aar');

console.log('🔧 Setting up local FFmpeg Kit AAR...');

// Check if AAR file exists
if (!fs.existsSync(aarFile)) {
  console.error('❌ FFmpeg Kit AAR file not found at:', aarFile);
  console.error(
    'Please ensure the ffmpeg-kit-https-gpl-6.0-2.aar file is placed in android/app/libs/',
  );
  process.exit(1);
}

console.log('✅ FFmpeg Kit AAR file found');

// Verify patches are applied
const patchesDir = path.join(rootDir, 'patches');
const patchFile = path.join(patchesDir, 'ffmpeg-kit-react-native+6.0.2.patch');

if (!fs.existsSync(patchFile)) {
  console.error(
    '❌ Patch file not found. Please run: npx patch-package ffmpeg-kit-react-native',
  );
  process.exit(1);
}

console.log('✅ Patch file found');

// Check if patch-package is in devDependencies
const packageJsonPath = path.join(rootDir, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

if (
  !packageJson.devDependencies ||
  !packageJson.devDependencies['patch-package']
) {
  console.error('❌ patch-package not found in devDependencies');
  console.error('Please run: npm install --save-dev patch-package');
  process.exit(1);
}

console.log('✅ patch-package is installed');

// Check if postinstall script exists
if (
  !packageJson.scripts ||
  !packageJson.scripts.postinstall ||
  !packageJson.scripts.postinstall.includes('patch-package')
) {
  console.error('❌ postinstall script not configured');
  console.error(
    'Please add "postinstall": "patch-package" to your package.json scripts',
  );
  process.exit(1);
}

console.log('✅ postinstall script configured');

console.log('🎉 FFmpeg Kit local setup is complete!');
console.log('\n📝 Summary:');
console.log('- Local AAR file: ✅');
console.log('- Patch file: ✅');
console.log('- patch-package installed: ✅');
console.log('- postinstall script: ✅');
console.log('\n🚀 Your build should now work in CI/CD environments!');
