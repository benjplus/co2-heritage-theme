<#
.SYNOPSIS
    Crée un lien (Junction Windows) entre ce dépôt de développement et le dossier Data/modules de Foundry VTT.
    Permet de modifier le CSS/JS ici et de voir le résultat immédiatement dans Foundry VTT v14.
#>

param(
    [string]$FoundryDataPath = "$env:LOCALAPPDATA\FoundryVTT\Data"
)

$ModuleId = "co2-heritage-theme"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ModulesDir = Join-Path $FoundryDataPath "modules"
$TargetLink = Join-Path $ModulesDir $ModuleId

Write-Host "=== Configuration du lien Foundry VTT v14 ===" -ForegroundColor Cyan
Write-Host "Dossier source : $ProjectRoot"
Write-Host "Dossier cible  : $TargetLink"

if (-not (Test-Path $ModulesDir)) {
    Write-Warning "Le dossier '$ModulesDir' n'a pas été trouvé."
    Write-Host "Si votre dossier Data de Foundry VTT est ailleurs, lancez :" -ForegroundColor Yellow
    Write-Host "  .\tools\link-foundry.ps1 -FoundryDataPath 'D:\Chemin\Vers\FoundryVTT\Data'" -ForegroundColor Yellow
    exit 1
}

if (Test-Path $TargetLink) {
    Write-Host "Le dossier ou lien '$TargetLink' existe déjà." -ForegroundColor Green
} else {
    New-Item -ItemType Junction -Path $TargetLink -Target $ProjectRoot | Out-Null
    Write-Host "Lien Junction créé avec succès vers '$TargetLink' !" -ForegroundColor Green
}

$Co2SystemDir = Join-Path $FoundryDataPath "systems\co2"
if (Test-Path $Co2SystemDir) {
    Write-Host "Système Chroniques Oubliées 2 ('co2') détecté dans : $Co2SystemDir" -ForegroundColor Green
} else {
    Write-Host "Note : Le système 'co2' n'a pas été détecté dans '$Co2SystemDir'." -ForegroundColor Yellow
}
