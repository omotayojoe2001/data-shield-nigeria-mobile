
# 📱 GoodDeeds Data VPN - Mobile App Setup

This guide will help you set up and build the mobile version of GoodDeeds Data VPN using Capacitor.

## 🏗️ Initial Setup

### Prerequisites
- Node.js 18+ installed
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Git

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Capacitor (First Time Only)
```bash
npx cap init
```

### 3. Add Mobile Platforms
```bash
# Add Android platform
npx cap add android

# Add iOS platform (macOS only)
npx cap add ios
```

## 🔧 Development Workflow

### Build and Sync
```bash
# Build web app and sync with mobile
npm run build
npx cap sync
```

### Running on Devices/Emulators
```bash
# Run on Android
npx cap run android

# Run on iOS (macOS only)
npx cap run ios
```

### Opening in IDEs
```bash
# Open Android project in Android Studio
npx cap open android

# Open iOS project in Xcode (macOS only)
npx cap open ios
```

## 📦 Building for Distribution

### Android APK
1. Open Android Studio: `npx cap open android`
2. Build → Build Bundle(s) / APK(s) → Build APK(s)
3. APK will be in `android/app/build/outputs/apk/debug/`

### iOS TestFlight
1. Open Xcode: `npx cap open ios`
2. Set up Apple Developer account and certificates
3. Archive and upload to App Store Connect
4. Create TestFlight build

## 🔌 Native Features Enabled

### VPN Capabilities
- ✅ Network state monitoring
- ✅ Background VPN maintenance
- ✅ Auto-reconnection on network change
- ✅ Native VPN service bindings (Android)
- ✅ Network Extension support (iOS)

### Mobile Optimizations
- ✅ Haptic feedback for user interactions
- ✅ Background task management
- ✅ App state handling (pause/resume)
- ✅ Network connectivity monitoring
- ✅ Battery optimization compatibility

### Permissions Configured
- ✅ Internet and network access
- ✅ VPN service binding
- ✅ Background processing
- ✅ Wake lock for VPN maintenance
- ✅ Storage for caching
- ✅ Vibration for haptics

## 🚀 Quick Start Script
```bash
# Make the build script executable
chmod +x scripts/build-mobile.sh

# Run the complete mobile build
./scripts/build-mobile.sh
```

## 🐛 Troubleshooting

### Common Issues
1. **Build fails**: Ensure all dependencies are installed
2. **Sync fails**: Check that `dist` folder exists after build
3. **Android emulator issues**: Ensure Android Studio is properly configured
4. **iOS signing issues**: Set up Apple Developer account and certificates

### Debug Commands
```bash
# Check Capacitor configuration
npx cap doctor

# View detailed sync information
npx cap sync --verbose

# Check platform status
npx cap ls
```

## 📋 Next Steps

1. **Test on Real Devices**: Install APK on Android or TestFlight on iOS
2. **VPN Integration**: Test VPN connectivity and background maintenance
3. **Performance Testing**: Monitor data usage and battery consumption
4. **Store Submission**: Prepare for Google Play Store and Apple App Store

## 🔐 Security Notes

- All API calls use HTTPS with proper certificate validation
- VPN keys are securely stored and transmitted
- Background tasks are limited to essential VPN maintenance
- User data is encrypted in transit and at rest

---

For support, please check the troubleshooting section or contact the development team.
