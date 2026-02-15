# Quick Setup Script for Veltrix Automation Platform
# Run this in PowerShell to get started quickly

Write-Host "🚀 Veltrix Automation Platform - Quick Setup" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is running (optional for local dev)
Write-Host ""
Write-Host "Checking for PostgreSQL..." -ForegroundColor Yellow
$pgRunning = Get-Process postgres -ErrorAction SilentlyContinue
if ($pgRunning) {
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL not detected. You can:" -ForegroundColor Yellow
    Write-Host "   1. Install PostgreSQL locally" -ForegroundColor Gray
    Write-Host "   2. Use Docker: docker-compose up -d postgres" -ForegroundColor Gray
    Write-Host "   3. Use a cloud database (recommended for production)" -ForegroundColor Gray
    Write-Host ""
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Setup environment variables
if (-Not (Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "✅ .env file created" -ForegroundColor Green
    Write-Host "⚠️  IMPORTANT: Edit .env and add your API keys!" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Setup database
Write-Host "Setting up database..." -ForegroundColor Yellow
$dbSetup = Read-Host "Do you want to setup the database now? (y/n)"
if ($dbSetup -eq "y" -or $dbSetup -eq "Y") {
    npm run db:push
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database setup complete" -ForegroundColor Green
    } else {
        Write-Host "❌ Database setup failed. Check your DATABASE_URL in .env" -ForegroundColor Red
    }
} else {
    Write-Host "⏭️  Skipping database setup" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Edit .env and add your API keys (TikTok, WhatsApp, etc.)" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Visit: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: README.md" -ForegroundColor Cyan
Write-Host "🎬 Demo Guide: DEMO_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "Need help? Check the docs or visit our GitHub" -ForegroundColor Gray
Write-Host ""

# Ask if user wants to start the server
$startServer = Read-Host "Start development server now? (y/n)"
if ($startServer -eq "y" -or $startServer -eq "Y") {
    Write-Host ""
    Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
    npm run dev
}
