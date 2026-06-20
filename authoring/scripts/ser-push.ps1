$ErrorActionPreference = "Stop"

$RepoRoot = Resolve-Path "$PSScriptRoot\..\.."
$EnvFile = "$RepoRoot\local-containers\.env"

if (-not (Test-Path $EnvFile)) {
  throw "Missing $EnvFile. Run local-containers/scripts/init.ps1 first."
}

$envContent = Get-Content $EnvFile -Encoding UTF8
$xmCloudHost = ($envContent | Where-Object { $_ -imatch "^CM_HOST=.+" }).Split("=")[1]
$ClientCredentialsLogin = ($envContent | Where-Object { $_ -imatch "^SITECORE_FedAuth_dot_Auth0_dot_ClientCredentialsLogin=.+" }).Split("=")[1]

Push-Location $RepoRoot
try {
  Write-Host "Restoring Sitecore CLI..." -ForegroundColor Green
  dotnet tool restore | Out-Null
  dotnet sitecore --help | Out-Null

  Write-Host "Connecting to Sitecore CM at https://$xmCloudHost ..." -ForegroundColor Green
  if ($ClientCredentialsLogin -eq "true") {
    $domain = ($envContent | Where-Object { $_ -imatch "^SITECORE_FedAuth_dot_Auth0_dot_Domain=.+" }).Split("=")[1]
    $audience = ($envContent | Where-Object { $_ -imatch "^SITECORE_FedAuth_dot_Auth0_dot_ClientCredentialsLogin_Audience=.+" }).Split("=")[1]
    $clientId = ($envContent | Where-Object { $_ -imatch "^SITECORE_FedAuth_dot_Auth0_dot_ClientCredentialsLogin_ClientId=.+" }).Split("=")[1]
    $clientSecret = ($envContent | Where-Object { $_ -imatch "^SITECORE_FedAuth_dot_Auth0_dot_ClientCredentialsLogin_ClientSecret=.+" }).Split("=")[1]

    dotnet sitecore cloud login --client-id $clientId --client-secret $clientSecret --client-credentials true
    dotnet sitecore login --authority $domain --audience $audience --client-id $clientId --client-secret $clientSecret --cm "https://$xmCloudHost" --client-credentials true --allow-write true
  }
  else {
    dotnet sitecore cloud login
    dotnet sitecore connect --ref xmcloud --cm "https://$xmCloudHost" --allow-write true -n default
  }

  Write-Host "Pushing serialized items to CM from authoring/items/nextjs-starter ..." -ForegroundColor Green
  dotnet sitecore ser push -i nextjs-starter

  Write-Host "Done." -ForegroundColor Green
}
finally {
  Pop-Location
}
