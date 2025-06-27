
#!/bin/bash

echo "🚀 Building GoodDeeds Data VPN Mobile App..."

# Build the web app
echo "📦 Building web application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Web build failed!"
    exit 1
fi

# Sync with Capacitor
echo "🔄 Syncing with Capacitor..."
npx cap sync

# Check if sync was successful
if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed!"
    exit 1
fi

echo "✅ Mobile app build completed successfully!"
echo ""
echo "📱 To run on Android:"
echo "   npx cap run android"
echo ""
echo "🍎 To run on iOS:"
echo "   npx cap run ios"
echo ""
echo "🔧 To open in IDE:"
echo "   npx cap open android"
echo "   npx cap open ios"
