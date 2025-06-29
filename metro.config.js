
import { getDefaultConfig } from 'expo/metro-config';

const config = getDefaultConfig(import.meta.dirname || process.cwd());

// Add support for additional file extensions
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg');

export default config;
