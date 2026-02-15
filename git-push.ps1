# Git Push Script
# This script adds the remote repository and pushes your code to GitHub

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  Pushing to GitHub Repository" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to project directory
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host "Step 1: Adding remote repository..." -ForegroundColor Yellow
try {
    git remote add origin https://github.com/veltrixd-commits/Autopilot.git 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Remote 'origin' added successfully" -ForegroundColor Green
    } else {
        Write-Host "! Remote 'origin' already exists, continuing..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "! Remote 'origin' already exists, continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Pushing to GitHub..." -ForegroundColor Yellow
Write-Host "This may take a few moments..." -ForegroundColor Gray
Write-Host ""

try {
    git push -u origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "================================================" -ForegroundColor Green
        Write-Host "  SUCCESS! Code pushed to GitHub" -ForegroundColor Green
        Write-Host "================================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Your repository is now live at:" -ForegroundColor Cyan
        Write-Host "https://github.com/veltrixd-commits/Autopilot" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "Push failed. Please check your GitHub credentials." -ForegroundColor Red
        Write-Host "You may need to authenticate with a Personal Access Token." -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "Error occurred during push: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
