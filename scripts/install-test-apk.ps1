param(
  [Parameter(Mandatory = $true)][string]$Serial,
  [switch]$UseDebugKey
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$apk = Join-Path $projectRoot 'android/app/build/outputs/apk/release/app-release.apk'
if (!(Test-Path -LiteralPath $apk)) { throw 'Chưa có APK release. Chạy build-release.ps1 trước.' }
$statusFile = Join-Path $projectRoot 'artifacts/build-status.json'
if (!(Test-Path -LiteralPath $statusFile) -or
    (Get-Content -LiteralPath $statusFile -Raw | ConvertFrom-Json).state -ne 'passed') {
  throw 'Lượt build gần nhất chưa thành công. Không cài APK có thể đã cũ.'
}

if ($UseDebugKey) {
  # Keep the original release artifact. This copy can update the existing
  # development app without uninstalling it or clearing its local data.
  $sdkRoot = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { Join-Path $env:LOCALAPPDATA 'Android/Sdk' }
  $signer = Join-Path $sdkRoot 'build-tools/37.0.0/apksigner.bat'
  $deviceApk = Join-Path $projectRoot 'artifacts/shopai-device-test.apk'
  & $signer sign --ks "$projectRoot/android/app/debug.keystore" `
    --ks-key-alias androiddebugkey --ks-pass pass:android --key-pass pass:android `
    --out $deviceApk $apk
  if ($LASTEXITCODE -ne 0) { throw 'Không ký được bản APK thử trên thiết bị.' }
  $apk = $deviceApk
}

& adb -s $Serial install -r $apk
if ($LASTEXITCODE -ne 0) {
  throw 'Cài cập nhật thất bại. Không tự gỡ app hoặc xóa dữ liệu; kiểm tra chữ ký và dung lượng.'
}
& adb -s $Serial reverse tcp:3000 tcp:3000
if ($LASTEXITCODE -ne 0) { throw 'Chưa nối được cổng backend qua USB.' }
& adb -s $Serial shell am start -n com.shopai/.MainActivity
