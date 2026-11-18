# Démarre le site LSV (Windows) : vérifie les dépendances, installe ce qui manque,
# puis lance PostgreSQL, Mailpit, les migrations et le site.
# Usage : start.bat [-Build] [-Stop] [-NoOpen]
param([switch]$Build, [switch]$Stop, [switch]$NoOpen)
$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot

function Ok($m)   { Write-Host "  [OK] $m" -ForegroundColor Green }
function Info($m) { Write-Host "  [..] $m" -ForegroundColor Cyan }
function Die($m)  { Write-Host "  [X] $m" -ForegroundColor Red; exit 1 }
function Has($c)  { [bool](Get-Command $c -ErrorAction SilentlyContinue) }
function RefreshPath {
  $env:Path = [Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [Environment]::GetEnvironmentVariable('Path','User')
  $dd = "$env:ProgramFiles\Docker\Docker\resources\bin"
  if (Test-Path $dd) { $env:Path += ";$dd" }
}
function DockerUp { docker info *> $null; return ($LASTEXITCODE -eq 0) }

Write-Host "Verification des dependances"
RefreshPath

# 1. Docker Desktop (inclut Docker Compose)
if (Has docker) { Ok "Docker deja installe" }
else {
  if (-not (Has winget)) { Die "winget absent. Installez Docker Desktop : https://www.docker.com/products/docker-desktop/ puis relancez." }
  Info "Docker absent : installation de Docker Desktop (winget)..."
  winget install -e --id Docker.DockerDesktop --accept-package-agreements --accept-source-agreements
  RefreshPath
  if (-not (Has docker)) {
    Die "Docker Desktop est installe mais un redemarrage de Windows est necessaire (WSL2). Redemarrez, ouvrez Docker Desktop une fois (acceptez les conditions), puis relancez start.bat."
  }
}

# 2. Docker Compose v2
docker compose version *> $null
if ($LASTEXITCODE -eq 0) { Ok "Docker Compose deja disponible" }
else { Die "Docker Compose introuvable : mettez a jour Docker Desktop." }

# 3. Moteur Docker demarre
if (-not (DockerUp)) {
  Info "Demarrage de Docker Desktop (peut prendre une minute)..."
  $exe = "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
  if (Test-Path $exe) { Start-Process $exe } else { Die "Lancez Docker Desktop manuellement puis relancez." }
  $t = 0
  while (-not (DockerUp)) {
    Start-Sleep 3; $t += 3
    if ($t -gt 240) { Die "Docker ne repond pas. Ouvrez Docker Desktop, acceptez les conditions, puis relancez." }
  }
}
Ok "Docker operationnel"

if ($Stop) { docker compose down; Write-Host "Arrete (donnees conservees)."; exit 0 }

# 4. Fichier de configuration
if (Test-Path .env) { Ok "Fichier .env present" }
else {
  Copy-Item .env.example .env
  Die ".env cree depuis .env.example : renseignez-le (mots de passe, secret), puis relancez."
}

Write-Host "`nDemarrage du site (le premier lancement telecharge et construit les images, quelques minutes)"
$args = @('compose','up','-d','--wait')
if ($Build) { $args += '--build' }
$args += @('site','mailpit')
docker @args
if ($LASTEXITCODE -ne 0) { Die "Echec du demarrage (voir les messages ci-dessus)." }

function EnvVal($k, $def) {
  $l = Select-String -Path .env -Pattern "^$k=(.*)$" | Select-Object -First 1
  if ($l -and $l.Matches[0].Groups[1].Value) { $l.Matches[0].Groups[1].Value } else { $def }
}
$url = EnvVal 'NEXT_PUBLIC_SITE_URL' 'http://localhost:3000'
$adm = EnvVal 'SEED_ADMIN_EMAIL' ''
Write-Host @"

[OK] Pret
  Site        : $url
  Admin       : $url/admin   (identifiant : $adm, mot de passe : SEED_ADMIN_PASSWORD dans .env)
  Mails test  : http://localhost:8025
  Arreter     : start.bat -Stop
  Apres modif : start.bat -Build
"@ -ForegroundColor Green

if (-not $NoOpen) { Start-Process $url }
