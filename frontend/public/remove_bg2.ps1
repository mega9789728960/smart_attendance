Add-Type -AssemblyName System.Drawing

$inPath = 'C:\Users\acer\OneDrive\Desktop\Final year project\smart_attendance\public\logo.png'
$outPath = 'C:\Users\acer\OneDrive\Desktop\Final year project\smart_attendance\public\logo_bg_removed.png'

# Check if file exists
if (-not (Test-Path $inPath)) {
    Write-Output "logo.png not found"
    exit
}

$img = New-Object System.Drawing.Bitmap $inPath

for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $p = $img.GetPixel($x, $y)
        # Increase tolerance to 65 to catch dark-grey jpeg artifacts
        if ($p.R -lt 65 -and $p.G -lt 65 -and $p.B -lt 65) {
            $img.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        }
    }
}

$img.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()

Copy-Item -Path $outPath -Destination $inPath -Force
Remove-Item -Path $outPath

Write-Output "Background removed successfully"
