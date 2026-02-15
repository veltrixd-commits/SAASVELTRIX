# Quick Start Development Server
# Starts the Next.js dev server and opens browser automatically

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Starting Veltrix Development Server" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    Write-Host ""
}

Write-Host "Starting development server..." -ForegroundColor Green
Write-Host ""
Write-Host "Local URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Opening browser in 5 seconds..." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start dev server in background and open browser after delay
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 5
    Start-Process "http://localhost:3000"
} | Out-Null

# Start the dev server (this will block until Ctrl+C)
npm run dev
