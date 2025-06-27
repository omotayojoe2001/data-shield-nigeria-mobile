
#!/bin/bash

echo "🧪 Testing local build process..."
echo "This simulates what GitHub Actions will do"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the project root directory"
    exit 1
fi

# Check Node.js version
echo "📋 Checking Node.js version..."
node --version

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build web app
echo "🔨 Building web application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed!"
    exit 1
fi

# Check if Capacitor is configured
echo "⚡ Checking Capacitor configuration..."
if [ ! -f "capacitor.config.ts" ]; then
    echo "❌ Capacitor not configured!"
    exit 1
fi

echo "✅ Build test completed successfully!"
echo ""
echo "🚀 Ready for GitHub Actions build!"
echo "   Push your code to trigger automatic APK build"
echo ""
echo "📱 APK will be available in GitHub Actions artifacts"
