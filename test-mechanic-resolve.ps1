# Test Mechanic Resolve API
$baseUrl = "http://127.0.0.1:3000"

Write-Host "Testing Mechanic Resolve API..." -ForegroundColor Cyan

try {
    # Test health endpoint first
    Write-Host "Testing health endpoint..." -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "Health check: $($health.status)" -ForegroundColor Green
    
    # Test mechanic resolve
    Write-Host "Testing mechanic resolve for ABC123..." -ForegroundColor Yellow
    $mechanic = Invoke-RestMethod -Uri "$baseUrl/api/referral/resolve/ABC123" -Method GET
    Write-Host "Mechanic found:" -ForegroundColor Green
    Write-Host "  ID: $($mechanic.mechanicId)" -ForegroundColor White
    Write-Host "  Code: $($mechanic.mechanicCode)" -ForegroundColor White
    Write-Host "  Name: $($mechanic.mechanicName)" -ForegroundColor White
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}
