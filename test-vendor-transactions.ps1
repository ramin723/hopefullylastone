# Test Vendor Transactions API
$baseUrl = "http://localhost:3000"
$vendorPhone = "09120000001"
$vendorPassword = "vendor123"

# Login Vendor
Write-Host "Logging in Vendor..." -ForegroundColor Yellow
$vendorLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -ContentType "application/json" -Body (@{ phone=$vendorPhone; password=$vendorPassword } | ConvertTo-Json)
$vendorToken = $vendorLogin.token
Write-Host "Vendor logged in successfully" -ForegroundColor Green

# Get vendor ID (assuming it's 1 for first vendor)
$vendorId = 1

# Get transactions
Write-Host "Getting vendor transactions..." -ForegroundColor Yellow
$transactions = Invoke-RestMethod -Method Get -Uri "$baseUrl/api/vendors/$vendorId/transactions" -Headers @{ Authorization = "Bearer $vendorToken" }

Write-Host "Transactions:" -ForegroundColor Cyan
$transactions | ConvertTo-Json -Depth 3

