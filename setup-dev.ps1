$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$projectRoot = $PSScriptRoot
$venvPython = Join-Path $projectRoot ".venv\Scripts\python.exe"
$requirements = Join-Path $projectRoot "backend\requirements.txt"

if (-not (Test-Path -LiteralPath $venvPython)) {
    Write-Host "Creating the local Python environment..."
    python -m venv (Join-Path $projectRoot ".venv")
}

Write-Host "Installing website and admin dependencies..."
& $venvPython -m pip install --disable-pip-version-check -r $requirements

Write-Host "Local setup is ready. Run .\start-dev.ps1"

