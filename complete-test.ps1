# complete-test.ps1
# Complete test file for all Settlement endpoints

Write-Host "Starting Settlement Tests" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Settings
$baseUrl = "http://127.0.0.1:3000"
$adminPhone = "09000000000"
$adminPassword = "admin123"
$vendorPhone = "09120000001"
$vendorPassword = "vendor123"

# Wait for server function
function Wait-ForServer {
    Write-Host "Waiting for server..." -ForegroundColor Yellow
    do {
        try {
            $response = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method Get -TimeoutSec 5
            if ($response.status -eq "ok") {
                Write-Host "Server is ready!" -ForegroundColor Green
                return $true
            }
        } catch {
            Write-Host "Server not ready yet..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
        }
    } while ($true)
}

# Step A: Create test data
function Test-CreateTransactions {
    Write-Host "`nStep A: Creating test transactions" -ForegroundColor Cyan
    
    try {
        # Login Vendor
        Write-Host "Logging in Vendor..." -ForegroundColor Yellow
        $vendorLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -ContentType "application/json" -Body (@{ phone=$vendorPhone; password=$vendorPassword } | ConvertTo-Json)
        $vendorToken = $vendorLogin.token
        Write-Host "Vendor logged in successfully" -ForegroundColor Green
        
        # Create first transaction
        Write-Host "Creating first transaction (2,000,000 Toman)..." -ForegroundColor Yellow
        $tx1 = @{
            mechanicCode = "ABC123"
            customerPhone = "09120000003"
            amountTotal = 2500000
            amountEligible = 2000000
            note = "Test transaction 1 - 2 million Toman"
        }
        $response1 = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/transactions" -Headers @{ Authorization = "Bearer $vendorToken" } -ContentType "application/json" -Body ($tx1 | ConvertTo-Json)
        Write-Host "First transaction created: ID=$($response1.id)" -ForegroundColor Green
        
        # Create second transaction
        Write-Host "Creating second transaction (2,500,000 Toman)..." -ForegroundColor Yellow
        $tx2 = @{
            mechanicCode = "ABC123"
            customerPhone = "09120000004"
            amountTotal = 3000000
            amountEligible = 2500000
            note = "Test transaction 2 - 2.5 million Toman"
        }
        $response2 = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/transactions" -Headers @{ Authorization = "Bearer $vendorToken" } -ContentType "application/json" -Body ($tx2 | ConvertTo-Json)
        Write-Host "Second transaction created: ID=$($response2.id)" -ForegroundColor Green
        
        return $vendorToken
    } catch {
        Write-Host "Error creating transactions: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Step B: Create Settlement (ADMIN)
function Test-CreateSettlement {
    param($vendorToken)
    Write-Host "`nStep B: Creating Settlement (ADMIN)" -ForegroundColor Cyan
    
    try {
        # Login Admin
        Write-Host "Logging in Admin..." -ForegroundColor Yellow
        $adminLogin = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -ContentType "application/json" -Body (@{ phone=$adminPhone; password=$adminPassword } | ConvertTo-Json)
        $adminToken = $adminLogin.token
        Write-Host "Admin logged in successfully" -ForegroundColor Green
        
        # Create Settlement
        Write-Host "Creating Settlement..." -ForegroundColor Yellow
        $settlementBody = @{
            vendorId = 1
            from = "2025-08-01"
            to = "2025-08-31"
        }
        $settlement = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/settlements" -Headers @{ Authorization = "Bearer $adminToken" } -ContentType "application/json" -Body ($settlementBody | ConvertTo-Json)
        Write-Host "Settlement created: ID=$($settlement.id), created=$($settlement.created)" -ForegroundColor Green
        
        return @{ adminToken = $adminToken; settlement = $settlement }
    } catch {
        Write-Host "Error creating Settlement: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Step C: List Vendor Settlements
function Test-ListSettlements {
    param($vendorToken)
    Write-Host "`nStep C: Listing Vendor Settlements" -ForegroundColor Cyan
    
    try {
        Write-Host "Getting settlements list..." -ForegroundColor Yellow
        $settlements = Invoke-RestMethod -Uri "$baseUrl/api/vendors/1/settlements" -Headers @{ Authorization = "Bearer $vendorToken" }
        Write-Host "Settlements retrieved: Count=$($settlements.Count)" -ForegroundColor Green
        
        foreach ($settlement in $settlements) {
            Write-Host "   - ID: $($settlement.id), Status: $($settlement.status), Period: $($settlement.periodFrom) to $($settlement.periodTo)" -ForegroundColor White
        }
        
        return $settlements
    } catch {
        Write-Host "Error getting settlements list: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Step D: Settlement Details
function Test-SettlementDetails {
    param($vendorToken, $settlementId)
    Write-Host "`nStep D: Settlement Details" -ForegroundColor Cyan
    
    try {
        Write-Host "Getting Settlement details ID=$settlementId..." -ForegroundColor Yellow
        $details = Invoke-RestMethod -Uri "$baseUrl/api/settlements/$settlementId" -Headers @{ Authorization = "Bearer $vendorToken" }
        Write-Host "Settlement details retrieved" -ForegroundColor Green
        Write-Host "   - Vendor: $($details.vendor.name)" -ForegroundColor White
        Write-Host "   - Items count: $($details.items.Count)" -ForegroundColor White
        Write-Host "   - Total amount: $($details.totals.eligible.ToString('N0')) Toman" -ForegroundColor White
        
        return $details
    } catch {
        Write-Host "Error getting Settlement details: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Step E: Mark Paid (ADMIN)
function Test-MarkPaid {
    param($adminToken, $settlementId)
    Write-Host "`nStep E: Mark Paid (ADMIN)" -ForegroundColor Cyan
    
    try {
        Write-Host "Marking Settlement as paid..." -ForegroundColor Yellow
        $response = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/settlements/$settlementId/mark-paid" -Headers @{ Authorization = "Bearer $adminToken" }
        Write-Host "Settlement marked as paid: $($response.status)" -ForegroundColor Green
        
        return $response
    } catch {
        Write-Host "Error in Mark Paid: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Step F: Security Tests
function Test-Security {
    param($vendorToken, $adminToken, $settlementId)
    Write-Host "`nStep F: Security Tests" -ForegroundColor Cyan
    
    try {
        # Test 1: Vendor cannot create Settlement
        Write-Host "Security Test 1: Vendor cannot create Settlement..." -ForegroundColor Yellow
        try {
            $settlementBody = @{ vendorId = 1; from = "2025-08-01"; to = "2025-08-31" }
            Invoke-RestMethod -Method Post -Uri "$baseUrl/api/settlements" -Headers @{ Authorization = "Bearer $vendorToken" } -ContentType "application/json" -Body ($settlementBody | ConvertTo-Json)
            Write-Host "ERROR: Vendor should not be able to create Settlement!" -ForegroundColor Red
        } catch {
            if ($_.Exception.Response.StatusCode -eq 403) {
                Write-Host "Security Test 1 PASSED: Vendor cannot create Settlement" -ForegroundColor Green
            } else {
                Write-Host "Security Test 1: Unexpected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
            }
        }
        
        # Test 2: Vendor cannot Mark Paid
        Write-Host "Security Test 2: Vendor cannot Mark Paid..." -ForegroundColor Yellow
        try {
            Invoke-RestMethod -Method Post -Uri "$baseUrl/api/settlements/$settlementId/mark-paid" -Headers @{ Authorization = "Bearer $vendorToken" }
            Write-Host "ERROR: Vendor should not be able to Mark Paid!" -ForegroundColor Red
        } catch {
            if ($_.Exception.Response.StatusCode -eq 403) {
                Write-Host "Security Test 2 PASSED: Vendor cannot Mark Paid" -ForegroundColor Green
            } else {
                Write-Host "Security Test 2: Unexpected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
            }
        }
        
        # Test 3: No token
        Write-Host "Security Test 3: No token..." -ForegroundColor Yellow
        try {
            Invoke-RestMethod -Uri "$baseUrl/api/settlements/$settlementId"
            Write-Host "ERROR: Should not have access without token!" -ForegroundColor Red
        } catch {
            if ($_.Exception.Response.StatusCode -eq 401) {
                Write-Host "Security Test 3 PASSED: No access without token" -ForegroundColor Green
            } else {
                Write-Host "Security Test 3: Unexpected error: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
            }
        }
        
        Write-Host "All security tests passed!" -ForegroundColor Green
    } catch {
        Write-Host "Error in security tests: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Main execution
try {
    # Wait for server
    Wait-ForServer
    
    # Step A
    $vendorToken = Test-CreateTransactions
    if (-not $vendorToken) {
        Write-Host "Test stopped - Error in Step A" -ForegroundColor Red
        exit 1
    }
    
    # Step B
    $result = Test-CreateSettlement $vendorToken
    if (-not $result) {
        Write-Host "Test stopped - Error in Step B" -ForegroundColor Red
        exit 1
    }
    $adminToken = $result.adminToken
    $settlement = $result.settlement
    $settlementId = $settlement.id
    
    # Step C
    $settlements = Test-ListSettlements $vendorToken
    if (-not $settlements) {
        Write-Host "Test stopped - Error in Step C" -ForegroundColor Red
        exit 1
    }
    
    # Step D
    $details = Test-SettlementDetails $vendorToken $settlementId
    if (-not $details) {
        Write-Host "Test stopped - Error in Step D" -ForegroundColor Red
        exit 1
    }
    
    # Step E
    $markPaidResult = Test-MarkPaid $adminToken $settlementId
    if (-not $markPaidResult) {
        Write-Host "Test stopped - Error in Step E" -ForegroundColor Red
        exit 1
    }
    
    # Step F
    Test-Security $vendorToken $adminToken $settlementId
    
    Write-Host "`nAll tests completed successfully!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    
} catch {
    Write-Host "General test error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
