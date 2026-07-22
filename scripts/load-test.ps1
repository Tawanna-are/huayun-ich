param(
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [int]$RequestCount = 200,
  [int]$Concurrency = 10
)

$ErrorActionPreference = "Stop"

if ($RequestCount -le 0) {
  throw "RequestCount must be greater than 0."
}

if ($Concurrency -le 0) {
  throw "Concurrency must be greater than 0."
}

$targets = @(
  "$BaseUrl/api/health",
  "$BaseUrl/zh",
  "$BaseUrl/zh/heritage",
  "$BaseUrl/zh/museum"
)

$startedAt = Get-Date
$jobs = @()
$results = @()

function Receive-FinishedJobs {
  param(
    [array]$CurrentJobs,
    [switch]$Wait
  )

  $remainingJobs = @()
  $receivedResults = @()

  foreach ($job in $CurrentJobs) {
    if ($Wait -or $job.State -ne "Running") {
      $receivedResults += Receive-Job $job -Wait:$Wait
      Remove-Job $job
    } else {
      $remainingJobs += $job
    }
  }

  return @{
    Jobs = $remainingJobs
    Results = $receivedResults
  }
}

for ($i = 0; $i -lt $RequestCount; $i++) {
  while (($jobs | Where-Object { $_.State -eq "Running" }).Count -ge $Concurrency) {
    Start-Sleep -Milliseconds 50
    $batch = Receive-FinishedJobs -CurrentJobs $jobs
    $results += $batch.Results
    $jobs = $batch.Jobs
  }

  $url = $targets[$i % $targets.Count]
  $jobs += Start-Job -ScriptBlock {
    param($RequestUrl)
    $watch = [System.Diagnostics.Stopwatch]::StartNew()
    try {
      $response = Invoke-WebRequest -Uri $RequestUrl -UseBasicParsing -TimeoutSec 30
      $watch.Stop()
      [pscustomobject]@{
        Url = $RequestUrl
        StatusCode = [int]$response.StatusCode
        DurationMs = [int]$watch.ElapsedMilliseconds
      }
    } catch {
      $watch.Stop()
      [pscustomobject]@{
        Url = $RequestUrl
        StatusCode = 0
        DurationMs = [int]$watch.ElapsedMilliseconds
      }
    }
  } -ArgumentList $url
}

$batch = Receive-FinishedJobs -CurrentJobs $jobs -Wait
$results += $batch.Results

$duration = (Get-Date) - $startedAt
$success = ($results | Where-Object { $_.StatusCode -ge 200 -and $_.StatusCode -lt 400 }).Count
$failure = $results.Count - $success
$durations = @($results | ForEach-Object { $_.DurationMs } | Sort-Object)
$p95Index = [Math]::Max([Math]::Ceiling($durations.Count * 0.95) - 1, 0)
$p95 = if ($durations.Count -gt 0) { $durations[$p95Index] } else { 0 }

Write-Host "Load test complete"
Write-Host "Requests: $($results.Count)"
Write-Host "Success: $success"
Write-Host "Failure: $failure"
Write-Host "P95 latency: $p95 ms"
Write-Host "Elapsed: $([int]$duration.TotalSeconds) seconds"

if ($results.Count -ne $RequestCount) {
  Write-Host "Expected $RequestCount results but received $($results.Count)."
  exit 1
}

if ($failure -gt 0) {
  exit 1
}
