param(
  [string]$OutputDir = "backups"
)

$ErrorActionPreference = "Stop"

if (-not $env:SUPABASE_DB_URL) {
  throw "SUPABASE_DB_URL is required. Use a pooled or direct Postgres connection string with read access."
}

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue

if (-not $pgDump) {
  throw "pg_dump was not found. Install PostgreSQL client tools before running the backup."
}

if (-not (Test-Path $OutputDir)) {
  New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupPath = Join-Path $OutputDir "huayun-ich-$timestamp.dump"

& pg_dump $env:SUPABASE_DB_URL --format=custom --no-owner --no-privileges --file=$backupPath

if ($LASTEXITCODE -ne 0) {
  throw "pg_dump failed with exit code $LASTEXITCODE."
}

Write-Host "Backup created: $backupPath"
