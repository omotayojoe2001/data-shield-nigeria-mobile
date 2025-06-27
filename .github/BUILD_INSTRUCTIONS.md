
# Android APK Build Instructions

## Build Status
![Build Status](https://github.com/YOUR_USERNAME/YOUR_REPO_NAME/workflows/Build%20Android%20APK/badge.svg)

## How to Get Your APK

### Method 1: Automatic Build (Recommended)
1. **Push to main branch** - APK builds automatically
2. **Go to GitHub Actions tab** in your repository
3. **Click on the latest workflow run**
4. **Download the APK** from the "Artifacts" section

### Method 2: Manual Build
1. **Go to Actions tab** in your repository
2. **Click "Build Android APK"** workflow
3. **Click "Run workflow"** button
4. **Select branch** and click "Run workflow"
5. **Wait for build** to complete (usually 5-10 minutes)
6. **Download APK** from artifacts

## Installation on Android Device

### Enable Unknown Sources
1. Open **Settings** on your Android device
2. Go to **Security** → **Install unknown apps**
3. Select your **file manager** or **browser**
4. Enable **Allow from this source**

### Install APK
1. **Download APK** from GitHub Actions artifacts
2. **Transfer to phone** via:
   - Email attachment
   - USB cable to Downloads folder
   - Cloud storage (Google Drive, Dropbox)
3. **Open file manager** and navigate to APK location
4. **Tap the APK file** to install
5. **Grant permissions** when prompted

## Features Included in APK
- ✅ VPN connection and management
- ✅ Data compression and savings tracking
- ✅ Background VPN maintenance
- ✅ Network change auto-reconnection
- ✅ Real-time usage monitoring
- ✅ Haptic feedback
- ✅ Pay-as-you-go billing
- ✅ Daily bonus system
- ✅ Wallet integration

## Build Artifacts
- **Debug APK**: `gooddeeds-vpn-debug-apk`
- **Release Ready**: `gooddeeds-vpn-release-ready` (main branch only)

## Troubleshooting
- **Build fails**: Check the Actions log for detailed error messages
- **APK won't install**: Ensure "Unknown sources" is enabled
- **App crashes**: Check device logs or report issues with screenshots

## Build Configuration
- **Node.js**: v18
- **Java**: v17 (Temurin)
- **Android SDK**: Latest
- **Build Type**: Debug (for testing)
- **Artifact Retention**: 30 days (debug), 90 days (release)
