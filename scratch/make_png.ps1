Add-Type -AssemblyName System.Drawing;

$bmp = New-Object System.Drawing.Bitmap(512, 512);
$g = [System.Drawing.Graphics]::FromImage($bmp);
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias;
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit;

// Background transparent
$g.Clear([System.Drawing.Color]::Transparent);

// Dark Chocolate circle
$chocolate = [System.Drawing.ColorTranslator]::FromHtml('#4a2c1d');
$chocolateBrush = New-Object System.Drawing.SolidBrush($chocolate);
$g.FillEllipse($chocolateBrush, 16, 16, 480, 480);

// Gold Ring
$gold = [System.Drawing.ColorTranslator]::FromHtml('#d49a46');
$goldPen = New-Object System.Drawing.Pen($gold, 10);
$g.DrawEllipse($goldPen, 32, 32, 448, 448);

// Centered CK Text
$cream = [System.Drawing.ColorTranslator]::FromHtml('#f9e8ce');
$creamBrush = New-Object System.Drawing.SolidBrush($cream);
$font = New-Object System.Drawing.Font('Georgia', 150, [System.Drawing.FontStyle]::Bold);

$format = New-Object System.Drawing.StringFormat;
$format.Alignment = [System.Drawing.StringAlignment]::Center;
$format.LineAlignment = [System.Drawing.StringAlignment]::Center;

$rect = New-Object System.Drawing.RectangleF(0, 0, 512, 512);
$g.DrawString('CK', $font, $creamBrush, $rect, $format);

$g.Dispose();

// Save PNGs
$bmp.Save('src/app/icon.png', [System.Drawing.Imaging.ImageFormat]::Png);
$bmp.Save('public/icon.png', [System.Drawing.Imaging.ImageFormat]::Png);

// Create valid 32x32 ico
$smallBmp = New-Object System.Drawing.Bitmap($bmp, 32, 32);
$hIcon = $smallBmp.GetHicon();
$ico = [System.Drawing.Icon]::FromHandle($hIcon);

$fs1 = New-Object System.IO.FileStream('src/app/favicon.ico', [System.IO.FileMode]::Create);
$ico.Save($fs1);
$fs1.Close();

$fs2 = New-Object System.IO.FileStream('public/favicon.ico', [System.IO.FileMode]::Create);
$ico.Save($fs2);
$fs2.Close();

$smallBmp.Dispose();
$bmp.Dispose();

Write-Host "Real binary PNG & ICO files generated successfully!";
