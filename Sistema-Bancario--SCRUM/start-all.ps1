param(
    [switch]$SkipDocker,
    [switch]$SkipInstall
)

$ErrorActionPreference = "Stop"

$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path

if (-not $SkipDocker) {
    Write-Host "`n[1/3] Iniciando bases de datos (Docker)..." -ForegroundColor Yellow
    Set-Location -LiteralPath $rootDir
    docker compose up -d
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Docker Compose falló. Asegúrate de que Docker Desktop esté corriendo." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Bases de datos iniciadas" -ForegroundColor Green
}

if (-not $SkipInstall) {
    Write-Host "`n[--] Instalando dependencias del frontend..." -ForegroundColor Yellow
    Set-Location -LiteralPath "$rootDir\frontend"
    pnpm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] pnpm install falló en frontend." -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Dependencias instaladas" -ForegroundColor Green
}

Write-Host "`n[2/3] Levantando servicios (3 en paralelo)..." -ForegroundColor Yellow
Write-Host "  [1] .NET AuthServiceBanco  -> http://localhost:5025/swagger" -ForegroundColor Cyan
Write-Host "  [2] Node.js Express API    -> http://localhost:3000/docs" -ForegroundColor Cyan
Write-Host "  [3] Vite Frontend Admin    -> http://localhost:5173" -ForegroundColor Cyan
Write-Host ""

Set-Location -LiteralPath $rootDir

concurrently -n "dotnet,node,frontend" -c "blue,green,magenta" "dotnet run --project src/AuthServiceBanco.Api\AuthServiceBanco.Api.csproj" "npm run dev" "pnpm --prefix frontend run dev"

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[ERROR] Uno de los servicios falló." -ForegroundColor Red
}
