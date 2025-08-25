# Test Authentication Flow
Write-Host "Testing Authentication Flow..." -ForegroundColor Green

# Test 1: Login
Write-Host "`n1. Testing Login..." -ForegroundColor Yellow
$loginResponse = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/auth/login" -Method POST -ContentType "application/json" -Body '{"phone":"admin","password":"admin"}'
Write-Host "Login Response: $($loginResponse | ConvertTo-Json)" -ForegroundColor Cyan

# Test 2: Get User Info
Write-Host "`n2. Testing Get User Info..." -ForegroundColor Yellow
$meResponse = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/auth/me" -Method GET
Write-Host "Me Response: $($meResponse | ConvertTo-Json)" -ForegroundColor Cyan

# Test 3: Refresh Token
Write-Host "`n3. Testing Refresh Token..." -ForegroundColor Yellow
$refreshResponse = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/auth/refresh" -Method POST
Write-Host "Refresh Response: $($refreshResponse | ConvertTo-Json)" -ForegroundColor Cyan

# Test 4: Logout
Write-Host "`n4. Testing Logout..." -ForegroundColor Yellow
$logoutResponse = Invoke-RestMethod -Uri "http://127.0.0.1:3000/api/auth/logout" -Method POST
Write-Host "Logout Response: $($logoutResponse | ConvertTo-Json)" -ForegroundColor Cyan

Write-Host "`nAuthentication Flow Test Completed!" -ForegroundColor Green
