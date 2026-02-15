# Replace 3000 with the default port your project uses
$PORT = 3000

# Kill any process using that port
Write-Host "Checking port $PORT..."
$processOnPort = Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processOnPort) {
    Write-Host "Killing process on port $PORT..."
    $processOnPort | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
} else {
    Write-Host "Port $PORT is free"
}

# Find a free port starting at 3000 (increments if taken)
while (Get-NetTCPConnection -LocalPort $PORT -ErrorAction SilentlyContinue) {
    $PORT++
    Write-Host "Port in use, trying $PORT..."
}

Write-Host "Starting new project on port $PORT"

# Start the project (React example)
# Set the PORT environment variable and start the project
$env:PORT = $PORT
npm start
