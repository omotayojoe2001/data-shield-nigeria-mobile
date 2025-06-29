
#!/bin/bash

echo "🔍 Validating GoodDeeds VPN Build Environment..."
echo "================================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

# Function to check command availability
check_command() {
    if command -v $1 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $1 is installed${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 is not installed${NC}"
        return 1
    fi
}

# Function to check version
check_version() {
    local cmd=$1
    local version_flag=$2
    local expected=$3
    
    if command -v $cmd >/dev/null 2>&1; then
        local version=$($cmd $version_flag 2>/dev/null | head -n1)
        echo -e "${GREEN}✅ $cmd: $version${NC}"
    else
        echo -e "${RED}❌ $cmd not found${NC}"
    fi
}

echo "📋 Checking Prerequisites..."
echo "----------------------------"
check_version "node" "--version"
check_version "npm" "--version"
check_version "java" "-version"

echo ""
echo "📦 Checking Dependencies..."
echo "---------------------------"
if [ -f "node_modules/.package-lock.json" ]; then
    echo -e "${GREEN}✅ Node modules installed${NC}"
else
    echo -e "${YELLOW}⚠️  Node modules not found. Run 'npm install'${NC}"
fi

echo ""
echo "⚡ Checking Capacitor Configuration..."
echo "------------------------------------"
if [ -f "capacitor.config.ts" ]; then
    echo -e "${GREEN}✅ Capacitor config found${NC}"
else
    echo -e "${RED}❌ Capacitor config missing${NC}"
fi

if [ -d "android" ]; then
    echo -e "${GREEN}✅ Android platform exists${NC}"
    
    # Check Android build files
    if [ -f "android/app/build.gradle" ]; then
        echo -e "${GREEN}✅ Android build.gradle found${NC}"
    else
        echo -e "${RED}❌ Android build.gradle missing${NC}"
    fi
    
    # Check gradlew permissions
    if [ -x "android/gradlew" ]; then
        echo -e "${GREEN}✅ Gradlew is executable${NC}"
    else
        echo -e "${YELLOW}⚠️  Gradlew needs execute permissions${NC}"
        chmod +x android/gradlew 2>/dev/null && echo -e "${GREEN}✅ Fixed gradlew permissions${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Android platform not added. Run 'npx cap add android'${NC}"
fi

echo ""
echo "🔨 Testing Build Process..."
echo "---------------------------"

# Test web build
echo "Building web app..."
if npm run build >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Web build successful${NC}"
else
    echo -e "${RED}❌ Web build failed${NC}"
    echo "Run 'npm run build' to see detailed error"
fi

# Test Capacitor sync
if [ -d "android" ]; then
    echo "Testing Capacitor sync..."
    if npx cap sync android >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Capacitor sync successful${NC}"
    else
        echo -e "${YELLOW}⚠️  Capacitor sync had issues${NC}"
    fi
fi

echo ""
echo "📱 Mobile Build Readiness..."
echo "----------------------------"

if [ -d "dist" ]; then
    echo -e "${GREEN}✅ Build output (dist) exists${NC}"
else
    echo -e "${RED}❌ No build output found${NC}"
fi

echo ""
echo "🎯 Summary and Next Steps"
echo "========================="
echo "If all checks pass, you can:"
echo "  • Run mobile build: npm run build-mobile"
echo "  • Test on emulator: npx cap run android"
echo "  • Open in Android Studio: npx cap open android"
echo ""
echo "For CI/CD, push to GitHub to trigger automatic APK build"
echo ""

# Exit with error if critical issues found
if [ ! -f "capacitor.config.ts" ] || [ ! -d "node_modules" ]; then
    echo -e "${RED}❌ Critical issues found. Please fix before continuing.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Validation completed successfully!${NC}"
