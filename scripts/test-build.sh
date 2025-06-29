
#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing GoodDeeds VPN Build Process...${NC}"
echo "========================================"
echo "This simulates what GitHub Actions will do"
echo ""

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ $1${NC}"
    echo "Build test failed at step: $2"
    exit 1
}

# Function to show success
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    handle_error "Run this script from the project root directory" "directory-check"
fi

# Step 1: Environment check
echo -e "${BLUE}📋 Checking build environment...${NC}"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "Java version: $(java -version 2>&1 | head -n1)"
show_success "Environment check completed"

# Step 2: Clean install dependencies
echo -e "${BLUE}📦 Installing dependencies (clean)...${NC}"
rm -rf node_modules package-lock.json 2>/dev/null
npm ci || handle_error "Failed to install dependencies" "npm-install"
show_success "Dependencies installed"

# Step 3: Build web app
echo -e "${BLUE}🔨 Building web application...${NC}"
npm run build || handle_error "Web build failed" "web-build"

# Verify build output
if [ ! -d "dist" ]; then
    handle_error "Build output directory not found" "build-output"
fi

if [ ! -f "dist/index.html" ]; then
    handle_error "Main HTML file not found in build output" "html-output"
fi

show_success "Web build completed and verified"

# Step 4: Capacitor configuration check
echo -e "${BLUE}⚡ Checking Capacitor configuration...${NC}"
if [ ! -f "capacitor.config.ts" ]; then
    handle_error "Capacitor configuration not found" "capacitor-config"
fi
show_success "Capacitor configuration verified"

# Step 5: Add Android platform (if needed)
if [ ! -d "android" ]; then
    echo -e "${BLUE}📱 Adding Android platform...${NC}"
    npx cap add android || handle_error "Failed to add Android platform" "android-platform"
    show_success "Android platform added"
else
    echo -e "${GREEN}✅ Android platform already exists${NC}"
fi

# Step 6: Sync with Capacitor
echo -e "${BLUE}🔄 Syncing with Capacitor...${NC}"
npx cap sync android || handle_error "Capacitor sync failed" "capacitor-sync"
show_success "Capacitor sync completed"

# Step 7: Gradle permissions
echo -e "${BLUE}🔧 Setting Gradle permissions...${NC}"
chmod +x android/gradlew
show_success "Gradle permissions set"

# Step 8: Test Android build
echo -e "${BLUE}🏗️  Testing Android build...${NC}"
cd android

# Clean first
./gradlew clean || handle_error "Gradle clean failed" "gradle-clean"
show_success "Gradle clean completed"

# Build debug APK
./gradlew assembleDebug --stacktrace || handle_error "Android debug build failed" "android-debug-build"
show_success "Android debug build completed"

# Try release build (continue on error)
echo -e "${BLUE}🏗️  Attempting release build...${NC}"
./gradlew assembleRelease --stacktrace 2>/dev/null
if [ $? -eq 0 ]; then
    show_success "Android release build completed"
else
    echo -e "${YELLOW}⚠️  Release build failed (expected without signing)${NC}"
fi

cd ..

# Step 9: Verify APK files
echo -e "${BLUE}📦 Verifying generated APK files...${NC}"
DEBUG_APK="android/app/build/outputs/apk/debug/app-debug.apk"
if [ -f "$DEBUG_APK" ]; then
    APK_SIZE=$(ls -lh "$DEBUG_APK" | awk '{print $5}')
    show_success "Debug APK generated successfully ($APK_SIZE)"
else
    handle_error "Debug APK not found" "apk-verification"
fi

# Step 10: Final verification
echo ""
echo -e "${GREEN}✅ All build tests passed!${NC}"
echo "=========================="
echo ""
echo -e "${BLUE}📊 Build Summary:${NC}"
echo "   • Web build: ✅ Success"
echo "   • Capacitor sync: ✅ Success"
echo "   • Android debug APK: ✅ Success"
echo "   • APK location: $DEBUG_APK"
echo "   • APK size: $(ls -lh "$DEBUG_APK" | awk '{print $5}')"
echo ""
echo -e "${GREEN}🚀 Ready for GitHub Actions build!${NC}"
echo "   Push your code to trigger automatic APK build"
echo ""
echo -e "${BLUE}📱 APK will be available in GitHub Actions artifacts${NC}"
echo "   Download from: Actions → Build Android APK → Artifacts"
echo ""
