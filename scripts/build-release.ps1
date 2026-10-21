param([string]$Architectures = 'arm64-v8a,x86_64')
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$env:NODE_ENV = 'production'
$env:CMAKE_BUILD_PARALLEL_LEVEL = '2'
$jdk17 = 'C:\Program Files\Microsoft\jdk-17.0.20.8-hotspot'
if (Test-Path -LiteralPath $jdk17) { $env:JAVA_HOME = $jdk17 }
$statusFile = Join-Path $projectRoot 'artifacts/build-status.json'
New-Item -ItemType Directory -Force -Path (Split-Path -Parent $statusFile) | Out-Null
@{ state = 'running'; startedAt = (Get-Date).ToString('o') } | ConvertTo-Json | Set-Content -LiteralPath $statusFile
try {
  & "$projectRoot/android/gradlew.bat" -p "$projectRoot/android" :app:assembleRelease `
    "-PreactNativeArchitectures=$Architectures" `
    "-Porg.gradle.java.installations.paths=$env:JAVA_HOME" `
    '-Porg.gradle.java.installations.auto-download=false' --max-workers=2 --console=plain
  $buildExitCode = $LASTEXITCODE
  @{ state = $(if ($buildExitCode -eq 0) { 'passed' } else { 'failed' }); exitCode = $buildExitCode; finishedAt = (Get-Date).ToString('o') } |
    ConvertTo-Json | Set-Content -LiteralPath $statusFile
  exit $buildExitCode
} catch {
  @{ state = 'failed'; message = $_.Exception.Message } | ConvertTo-Json | Set-Content -LiteralPath $statusFile
  throw
}
