Add-Type -AssemblyName System.Drawing
$path = 'C:\Users\acer\OneDrive\Desktop\Final year project\smart_attendance\public\logo.jpeg'
$outPath = 'C:\Users\acer\OneDrive\Desktop\Final year project\smart_attendance\public\logo.png'
$img = New-Object System.Drawing.Bitmap $path
for ($y = 0; $y -lt $img.Height; $y++) {
    for ($x = 0; $x -lt $img.Width; $x++) {
        $p = $img.GetPixel($x, $y)
        if ($p.R -lt 25 -and $p.G -lt 25 -and $p.B -lt 25) {
            $img.SetPixel($x, $y, [System.Drawing.Color]::Transparent)
        }
    }
}
$img.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
Write-Output "Background removed and saved to logo.png"
