# 🚀 Veltrix Deployment Preparation Script
# This script prepares your app for deployment to Host Africa

Write-Host "🚀 Veltrix Deployment Preparation" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if node_modules exists
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""

# Step 2: Build the production version
Write-Host "🔨 Building production version..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green
Write-Host ""

# Step 3: Check if out folder was created
if (Test-Path "out") {
    $fileCount = (Get-ChildItem -Path "out" -Recurse -File).Count
    Write-Host "✅ Static files generated: $fileCount files in 'out' folder" -ForegroundColor Green
} else {
    Write-Host "⚠️  'out' folder not found." -ForegroundColor Yellow
    Write-Host "   Make sure you've uncommented the export config in next.config.js" -ForegroundColor Yellow
}

Write-Host ""

# Step 4: Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$zipName = "veltrix-deploy-$timestamp.zip"

if (Test-Path "out") {
    # Compress the out folder
    Compress-Archive -Path "out\*" -DestinationPath $zipName -Force
    
    # Copy .htaccess.example if it exists
    if (Test-Path ".htaccess.example") {
        Write-Host "📄 Remember to rename .htaccess.example to .htaccess after upload!" -ForegroundColor Yellow
    }
    
    Write-Host "✅ Deployment package created: $zipName" -ForegroundColor Green
    Write-Host ""
    
    # Show instructions
    Write-Host "📋 Next Steps:" -ForegroundColor Cyan
    Write-Host "==============" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Upload $zipName to your Host Africa server" -ForegroundColor White
    Write-Host "2. Extract it in your web directory (e.g., /public_html/demo/)" -ForegroundColor White
    Write-Host "3. Rename .htaccess.example to .htaccess" -ForegroundColor White
    Write-Host "4. Edit .htaccess and update RewriteBase if needed" -ForegroundColor White
    Write-Host "5. Set folder permissions to 755 and files to 644" -ForegroundColor White
    Write-Host "6. Test your site!" -ForegroundColor White
    Write-Host ""
    Write-Host "📖 For detailed instructions, see: DEPLOYMENT_CHECKLIST.md" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🌐 Your demo will be live at:" -ForegroundColor Cyan
    Write-Host "   Subdomain: https://demo.yourdomain.com" -ForegroundColor White
    Write-Host "   OR" -ForegroundColor Gray
    Write-Host "   Subdirectory: https://yourdomain.com/demo" -ForegroundColor White
    Write-Host ""
    Write-Host "🎉 Preparation complete! Good luck with your deployment!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Cannot create package - 'out' folder not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 To enable static export:" -ForegroundColor Yellow
    Write-Host "   1. Open next.config.js" -ForegroundColor White
    Write-Host "   2. Uncomment the lines marked for deployment" -ForegroundColor White
    Write-Host "   3. Run this script again" -ForegroundColor White
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
