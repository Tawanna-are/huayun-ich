$ErrorActionPreference = "Stop"

$assetDir = Join-Path $PSScriptRoot "..\public\assets"
New-Item -ItemType Directory -Force -Path $assetDir | Out-Null

Add-Type -AssemblyName System.Drawing

function New-Color($hex) {
  return [System.Drawing.ColorTranslator]::FromHtml($hex)
}

function New-Brush($hex) {
  return New-Object System.Drawing.SolidBrush (New-Color $hex)
}

function Save-Image($fileName, $title, $subtitle, $palette, $kind) {
  $width = 1600
  $height = 1000
  $bitmap = New-Object System.Drawing.Bitmap $width, $height
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, (New-Color $palette.bg1), (New-Color $palette.bg2), 28
  $graphics.FillRectangle($brush, $rect)

  $goldPen = New-Object System.Drawing.Pen (New-Color "#C8A96A"), 3
  $mutedPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(70, 248, 246, 242)), 1
  $accentBrush = New-Brush $palette.accent
  $goldBrush = New-Brush "#C8A96A"
  $riceBrush = New-Brush "#F8F6F2"
  $darkBrush = New-Brush "#0F0F0F"

  for ($i = 0; $i -lt 42; $i++) {
    $x = 80 + (($i * 97) % 1500)
    $y = 70 + (($i * 163) % 900)
    $graphics.DrawLine($mutedPen, $x, $y, $x + 160, $y + 28)
  }

  switch ($kind) {
    "opera" {
      $graphics.FillEllipse($accentBrush, 570, 190, 470, 560)
      $graphics.FillEllipse($riceBrush, 655, 245, 290, 430)
      $graphics.FillEllipse($darkBrush, 725, 365, 55, 75)
      $graphics.FillEllipse($darkBrush, 840, 365, 55, 75)
      $graphics.DrawArc($goldPen, 700, 435, 220, 165, 15, 150)
      $graphics.DrawLine($goldPen, 810, 250, 810, 680)
    }
    "silk" {
      for ($i = 0; $i -lt 22; $i++) {
        $pen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(140, (New-Color $palette.accent))), (2 + ($i % 3))
        $graphics.DrawBezier($pen, 140, 240 + $i * 24, 530, 80 + $i * 8, 900, 820 - $i * 20, 1460, 330 + $i * 16)
      }
      $graphics.DrawEllipse($goldPen, 780, 280, 360, 270)
    }
    "ceramic" {
      $graphics.FillEllipse($accentBrush, 480, 560, 640, 110)
      $graphics.FillPie($riceBrush, 520, 250, 560, 620, 0, 180)
      $graphics.DrawArc($goldPen, 530, 252, 540, 610, 0, 180)
      $graphics.DrawLine($goldPen, 560, 558, 1040, 558)
    }
    "porcelain" {
      $bluePen = New-Object System.Drawing.Pen (New-Color "#1F5C8D"), 9
      $graphics.FillEllipse($riceBrush, 555, 205, 490, 600)
      $graphics.DrawEllipse($goldPen, 555, 205, 490, 600)
      $graphics.DrawBezier($bluePen, 650, 430, 760, 280, 850, 650, 980, 410)
      $graphics.DrawArc($bluePen, 650, 330, 320, 220, 20, 165)
      $graphics.DrawLine($bluePen, 630, 530, 1000, 530)
    }
    "spark" {
      $sparkPen = New-Object System.Drawing.Pen (New-Color "#F8B24A"), 4
      for ($i = 0; $i -lt 72; $i++) {
        $angle = ($i * 17) * [Math]::PI / 180
        $length = 160 + (($i * 23) % 460)
        $x2 = 800 + [Math]::Cos($angle) * $length
        $y2 = 560 + [Math]::Sin($angle) * $length * 0.62
        $graphics.DrawLine($sparkPen, 800, 560, [int]$x2, [int]$y2)
      }
      $graphics.FillEllipse($accentBrush, 744, 508, 112, 112)
    }
    "portrait" {
      $graphics.FillEllipse($accentBrush, 650, 210, 300, 300)
      $graphics.FillPie($darkBrush, 550, 480, 500, 450, 180, 180)
      $graphics.DrawEllipse($goldPen, 620, 180, 360, 360)
    }
    default {
      $graphics.DrawRectangle($goldPen, 260, 190, 1080, 620)
      $graphics.FillRectangle($accentBrush, 420, 340, 760, 260)
    }
  }

  $titleFont = New-Object System.Drawing.Font "Microsoft YaHei UI", 76, ([System.Drawing.FontStyle]::Regular)
  $subtitleFont = New-Object System.Drawing.Font "Microsoft YaHei UI", 28, ([System.Drawing.FontStyle]::Regular)
  $graphics.DrawString($title, $titleFont, $riceBrush, 90, 760)
  $graphics.DrawString($subtitle, $subtitleFont, $goldBrush, 96, 860)

  $path = Join-Path $assetDir $fileName
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $graphics.Dispose()
  $bitmap.Dispose()
}

$items = @(
  @{ file = "hero-museum.png"; title = "HUAYUN"; subtitle = "Chinese Intangible Cultural Heritage"; kind = "default"; palette = @{ bg1 = "#0F0F0F"; bg2 = "#2A1715"; accent = "#B22222" } },
  @{ file = "jingju.png"; title = "JINGJU"; subtitle = "Peking Opera"; kind = "opera"; palette = @{ bg1 = "#140D0B"; bg2 = "#63191A"; accent = "#B22222" } },
  @{ file = "jingju-hero.png"; title = "JINGJU"; subtitle = "Stage Archive"; kind = "opera"; palette = @{ bg1 = "#0F0F0F"; bg2 = "#361414"; accent = "#B22222" } },
  @{ file = "jingju-detail.png"; title = "GESTURE"; subtitle = "Opera Movement"; kind = "opera"; palette = @{ bg1 = "#17110D"; bg2 = "#462419"; accent = "#8E1E1E" } },
  @{ file = "kunqu.png"; title = "KUNQU"; subtitle = "Kunqu Opera"; kind = "silk"; palette = @{ bg1 = "#111313"; bg2 = "#39473E"; accent = "#94A995" } },
  @{ file = "kunqu-hero.png"; title = "KUNQU"; subtitle = "Water-polished Melody"; kind = "silk"; palette = @{ bg1 = "#0F0F0F"; bg2 = "#1E3532"; accent = "#94A995" } },
  @{ file = "kunqu-detail.png"; title = "MELODY"; subtitle = "Kunshan"; kind = "silk"; palette = @{ bg1 = "#15201D"; bg2 = "#4E6457"; accent = "#DCE7EA" } },
  @{ file = "suzhou-embroidery.png"; title = "SUXIU"; subtitle = "Suzhou Embroidery"; kind = "silk"; palette = @{ bg1 = "#17110F"; bg2 = "#5B2425"; accent = "#C8A96A" } },
  @{ file = "suzhou-embroidery-hero.png"; title = "SUXIU"; subtitle = "Silk Thread"; kind = "silk"; palette = @{ bg1 = "#0F0F0F"; bg2 = "#442F2A"; accent = "#C8A96A" } },
  @{ file = "suzhou-embroidery-detail.png"; title = "NEEDLE"; subtitle = "Needlework"; kind = "silk"; palette = @{ bg1 = "#2B1516"; bg2 = "#71594C"; accent = "#F8F6F2" } },
  @{ file = "longquan-celadon.png"; title = "LONGQUAN"; subtitle = "Longquan Celadon"; kind = "ceramic"; palette = @{ bg1 = "#0F1412"; bg2 = "#3D574C"; accent = "#94A995" } },
  @{ file = "longquan-celadon-hero.png"; title = "CELADON"; subtitle = "Longquan"; kind = "ceramic"; palette = @{ bg1 = "#0F0F0F"; bg2 = "#283D36"; accent = "#94A995" } },
  @{ file = "longquan-celadon-detail.png"; title = "GLAZE"; subtitle = "Kiln Fire"; kind = "ceramic"; palette = @{ bg1 = "#121816"; bg2 = "#5A7065"; accent = "#DCE7EA" } },
  @{ file = "jingdezhen-porcelain.png"; title = "JINGDEZHEN"; subtitle = "Jingdezhen Porcelain"; kind = "porcelain"; palette = @{ bg1 = "#0F0F0F"; bg2 = "#20364C"; accent = "#DCE7EA" } },
  @{ file = "jingdezhen-porcelain-hero.png"; title = "PORCELAIN"; subtitle = "Porcelain Capital"; kind = "porcelain"; palette = @{ bg1 = "#0F0F0F"; bg2 = "#1D2D3D"; accent = "#DCE7EA" } },
  @{ file = "jingdezhen-porcelain-detail.png"; title = "BLUE WHITE"; subtitle = "Blue and White"; kind = "porcelain"; palette = @{ bg1 = "#1A2026"; bg2 = "#3C536D"; accent = "#F8F6F2" } },
  @{ file = "datiehua.png"; title = "DATIEHUA"; subtitle = "Iron Flower"; kind = "spark"; palette = @{ bg1 = "#0F0F0F"; bg2 = "#3C1611"; accent = "#B22222" } },
  @{ file = "datiehua-hero.png"; title = "IRON FLOWER"; subtitle = "Night Ritual"; kind = "spark"; palette = @{ bg1 = "#060606"; bg2 = "#30120D"; accent = "#B22222" } },
  @{ file = "datiehua-detail.png"; title = "SPARK"; subtitle = "Molten Iron"; kind = "spark"; palette = @{ bg1 = "#0F0F0F"; bg2 = "#4A1B12"; accent = "#F8B24A" } },
  @{ file = "inheritor-opera.png"; title = "INHERITOR"; subtitle = "Opera Inheritor"; kind = "portrait"; palette = @{ bg1 = "#0F0F0F"; bg2 = "#2C1515"; accent = "#B22222" } },
  @{ file = "inheritor-craft.png"; title = "CRAFT"; subtitle = "Craft Inheritor"; kind = "portrait"; palette = @{ bg1 = "#111313"; bg2 = "#3D3B2E"; accent = "#C8A96A" } },
  @{ file = "inheritor-ritual.png"; title = "RITUAL"; subtitle = "Ritual Inheritor"; kind = "portrait"; palette = @{ bg1 = "#080808"; bg2 = "#37140F"; accent = "#B22222" } }
)

foreach ($item in $items) {
  Save-Image $item.file $item.title $item.subtitle $item.palette $item.kind
}

Write-Host "Generated assets in $assetDir"
