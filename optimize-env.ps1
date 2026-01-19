# Antigravity Environment Optimizer for Low-RAM Machines
# This script helps secure memory for Antigravity by managing WSL2 and Windows processes.

function Get-MemoryStats {
    $os = Get-CimInstance Win32_OperatingSystem
    $total = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    $free = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $used = $total - $free
    return @{ Total = $total; Free = $free; Used = $used; Percent = [math]::Round(($used/$total)*100, 1) }
}

Write-Host "--- 🟢 Antigravity Environment Optimizer ---" -ForegroundColor Green

$stats = Get-MemoryStats
Write-Host "Current Memory Usage: $($stats.Used)GB / $($stats.Total)GB ($($stats.Percent)%)"

# 1. WSL2 Optimization
Write-Host "`n[1] Checking WSL2 (Vmmem)..." -ForegroundColor Cyan
$vmmem = Get-Process -Name "vmmem*" -ErrorAction SilentlyContinue
if ($vmmem) {
    $wslMem = [math]::Round($vmmem.WorkingSet64 / 1GB, 2)
    Write-Host "WSL2 (Vmmem) is consuming: $wslMem GB" -ForegroundColor Yellow
    Write-Host "If you are not using WSL2 right now, shutting it down can free up this memory."
    Write-Host "Command to shutdown: wsl --shutdown"
} else {
    Write-Host "WSL2 is not currently consuming significant memory."
}

# 2. Top Memory Hogs
Write-Host "`n[2] Top 5 Memory Consuming Processes:" -ForegroundColor Cyan
Get-Process | Sort-Object WorkingSet64 -Descending | Select-Object -First 5 Name, @{Name='RAM(GB)';Expression={[math]::round($_.WorkingSet64 / 1GB, 2)}} | Format-Table -AutoSize

# 3. .wslconfig Check/Update
Write-Host "`n[3] .wslconfig Strategy:" -ForegroundColor Cyan
$wslConfigPath = "$HOME\.wslconfig"
Write-Host "Your machine has 8GB RAM. Recommendation: Limit WSL2 to 2GB or 3GB."

$currentConfig = Get-Content $wslConfigPath -ErrorAction SilentlyContinue
if ($currentConfig -match "memory=") {
    Write-Host "Existing memory limit found: $($currentConfig -match 'memory=')"
} else {
    Write-Host "No memory limit set for WSL2. It might grow up to 6GB-7GB!" -ForegroundColor Red
    Write-Host "Recommended action: Add 'memory=2GB' to $wslConfigPath"
}

Write-Host "`n--- Optimization Suggestions ---" -ForegroundColor Green
Write-Host "1. Run 'wsl --shutdown' if you don't need Linux right now."
Write-Host "2. Close unused Browser tabs (Edge/Chrome/Core)."
Write-Host "3. Limit WSL2 memory in .wslconfig to 2GB."

Write-Host "`nOptimization script finished."
