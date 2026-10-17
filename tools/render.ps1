# Gera os currículos em PDF (PT e EN) e a imagem de compartilhamento (og.png)
# a partir dos HTML em cv-src/, usando o Microsoft Edge em modo headless.
#
# Uso:  powershell -ExecutionPolicy Bypass -File tools\render.ps1
# Depois, para converter tools\og.png em assets\og.jpg e refazer o ícone:
#       node tools\image\icons.mjs assets tools\og.png

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$profileDir = Join-Path $env:TEMP 'portfolio-edge-profile'
$src = ($root -replace '\\', '/') + '/cv-src'

function Invoke-Edge([string[]] $extra, [string] $page) {
  $argList = @('--headless=new', '--disable-gpu', '--no-first-run', "--user-data-dir=$profileDir", '--virtual-time-budget=5000') + $extra + "file:///$src/$page"
  Start-Process -FilePath $edge -ArgumentList $argList -Wait -WindowStyle Hidden
}

Invoke-Edge @('--no-pdf-header-footer', "--print-to-pdf=$root\assets\cv\Curriculo-Henrique-Valois.pdf") 'curriculo-pt.html'
Invoke-Edge @('--no-pdf-header-footer', "--print-to-pdf=$root\assets\cv\Resume-Henrique-Valois.pdf") 'resume-en.html'
Invoke-Edge @('--hide-scrollbars', '--window-size=1200,630', '--force-device-scale-factor=1', "--screenshot=$root\tools\og.png") 'og.html'

Write-Host 'Pronto: assets\cv\*.pdf e tools\og.png'
