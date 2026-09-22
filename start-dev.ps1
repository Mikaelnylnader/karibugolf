$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = $PSScriptRoot
$venvPython = Join-Path $projectRoot ".venv\Scripts\python.exe"
$runner = Join-Path $projectRoot "execution\run_local.py"

if (-not (Test-Path -LiteralPath $venvPython)) {
    & (Join-Path $projectRoot "setup-dev.ps1")
}

& $venvPython -c "import flask" 2>$null
if ($LASTEXITCODE -ne 0) {
    & (Join-Path $projectRoot "setup-dev.ps1")
}

Set-Location -LiteralPath $projectRoot
& $venvPython $runner

