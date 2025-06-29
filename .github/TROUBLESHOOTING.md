
# 🔧 Mobile Build Troubleshooting Guide

## Common Build Issues and Solutions

### 1. Java Version Conflicts

**Error**: `Unsupported Java version` or `JAVA_HOME` issues

**Solution**:
```bash
# Check Java version
java -version

# Should show Java 17. If not, install Java 17:
# macOS: brew install openjdk@17
# Ubuntu: sudo apt install openjdk-17-jdk
# Windows: Download from Oracle or use Chocolatey

# Set JAVA_HOME (add to ~/.bashrc or ~/.zshrc)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64  # Linux
export JAVA_HOME=/opt/homebrew/opt/openjdk@17        # macOS
```

### 2. Gradle Build Failures

**Error**: `Gradle build failed` or `Could not resolve dependencies`

**Solution**:
```bash
# Clean Gradle cache
cd android
./gradlew clean

# Clear Gradle cache completely
rm -rf ~/.gradle/caches
rm -rf .gradle

# Rebuild
./gradlew assembleDebug --refresh-dependencies
```

### 3. Capacitor Sync Issues

**Error**: `cap sync failed` or `Unable to sync`

**Solution**:
```bash
# Ensure web build exists
npm run build

# Clean and re-sync
npx cap clean android
npx cap sync android

# If still failing, remove and re-add platform
npx cap remove android
npx cap add android
npx cap sync android
```

### 4. Android SDK Issues

**Error**: `Android SDK not found` or `compileSdkVersion not found`

**Solution**:
```bash
# Install Android SDK through Android Studio
# Or set ANDROID_HOME environment variable
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Accept SDK licenses
$ANDROID_HOME/tools/bin/sdkmanager --licenses
```

### 5. Build Script Permissions

**Error**: `Permission denied` when running gradlew

**Solution**:
```bash
chmod +x android/gradlew
chmod +x scripts/*.sh
```

### 6. Node.js/NPM Issues

**Error**: `Node modules not found` or version conflicts

**Solution**:
```bash
# Use Node.js 18+ (recommended: 20)
node --version

# Clean install
rm -rf node_modules package-lock.json
npm ci

# If using different Node versions, use nvm
nvm use 20
```

### 7. Memory Issues During Build

**Error**: `OutOfMemoryError` or build hanging

**Solution**:
```bash
# Increase Gradle memory in android/gradle.properties
echo "org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=512m" >> android/gradle.properties

# Or set environment variable
export GRADLE_OPTS="-Xmx4g"
```

### 8. APK Not Generated

**Error**: Build completes but no APK file found

**Solution**:
```bash
# Check build output directory
ls -la android/app/build/outputs/apk/debug/

# If empty, check for build errors
cd android
./gradlew assembleDebug --info --stacktrace

# Look for detailed error messages
```

## GitHub Actions Specific Issues

### 1. Actions Timeout

**Solution**: Add timeout and caching to workflow:
```yaml
- name: Cache Gradle packages
  uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*') }}

- name: Build with timeout
  timeout-minutes: 15
  run: ./gradlew assembleDebug
```

### 2. Artifact Upload Fails

**Solution**: Check APK path and ensure build completed:
```yaml
- name: List APK files
  run: find android/app/build/outputs/apk -name "*.apk" -ls

- name: Upload APK
  if: success()
  uses: actions/upload-artifact@v4
```

## Debugging Commands

```bash
# Full environment check
./scripts/validate-build.sh

# Test complete build process
./scripts/test-build.sh

# Build mobile app
./scripts/build-mobile.sh

# Check Capacitor status
npx cap doctor

# Verbose sync
npx cap sync android --verbose

# Gradle info
cd android && ./gradlew tasks --all
```

## Getting Help

1. **Check Console Output**: Look for specific error messages
2. **Enable Verbose Logging**: Use `--stacktrace --info` flags
3. **Validate Environment**: Run validation script first
4. **Clean Builds**: Always try clean builds for persistent issues
5. **Check File Permissions**: Ensure scripts are executable

## Emergency Reset

If all else fails, complete reset:
```bash
# Remove all build artifacts
rm -rf node_modules dist android/.gradle android/app/build

# Clean install everything
npm ci
npm run build
npx cap sync android
cd android && ./gradlew clean assembleDebug
```

---

For more help, check the main documentation or contact support.
