
#!/bin/bash

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Building GoodDeeds VPN Mobile App...${NC}"
echo "======================================"

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Function to show success
show_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to show warning
show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    handle_error "Run this script from the project root directory"
fi

# Step 1: Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf dist/
rm -rf android/app/build/
show_success "Cleaned previous build"

# Step 2: Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm ci || handle_error "Failed to install dependencies"
    show_success "Dependencies installed"
fi

# Step 3: Build the web app
echo -e "${BLUE}🔨 Building web application...${NC}"
npm run build || handle_error "Web build failed"
show_success "Web build completed"

# Step 4: Check if Android platform exists
if [ ! -d "android" ]; then
    echo -e "${BLUE}📱 Adding Android platform...${NC}"
    npx cap add android || handle_error "Failed to add Android platform"
    show_success "Android platform added"
fi

# Step 5: Ensure gradlew is executable
if [ ! -x "android/gradlew" ]; then
    echo -e "${BLUE}🔧 Setting gradlew permissions...${NC}"
    chmod +x android/gradlew
    show_success "Gradlew permissions set"
fi

# Step 6: Sync with Capacitor
echo -e "${BLUE}🔄 Syncing with Capacitor...${NC}"
npx cap sync android || handle_error "Capacitor sync failed"
show_success "Capacitor sync completed"

# Step 7: Build Android APK
echo -e "${BLUE}🏗️  Building Android APK...${NC}"
cd android
./gradlew clean
./gradlew assembleDebug --stacktrace || handle_error "Android build failed"
cd ..
show_success "Android APK built successfully"

# Step 8: Show build results
echo ""
echo -e "${GREEN}✅ Mobile app build completed successfully!${NC}"
echo "=========================================="

# Find and display APK files
echo -e "${BLUE}📦 Generated APK files:${NC}"
find android/app/build/outputs/apk -name "*.apk" -exec ls -lh {} \; 2>/dev/null || show_warning "No APK files found"

echo ""
echo -e "${BLUE}📱 Next Steps:${NC}"
echo "   • Test on emulator: npx cap run android"
echo "   • Open in Android Studio: npx cap open android"
echo "   • Install APK: adb install android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo -e "${BLUE}🚀 For distribution:${NC}"
echo "   • Push to GitHub for automatic CI/CD build"
echo "   • APK will be available in GitHub Actions artifacts"
echo ""
