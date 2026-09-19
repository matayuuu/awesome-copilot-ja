---
name: image-manipulation-image-magick
description: 'ImageMagickを使用して画像を処理・操作する。サイズ変更、形式変換、バッチ処理、画像メタデータの取得に対応する。画像の操作、サムネイル作成、壁紙のサイズ変更、バッチ画像処理で使用する。'
compatibility: ImageMagickがインストールされ、PATH上で `magick` として利用できること。PowerShell（Windows）とBash（Linux/macOS）のクロスプラットフォーム例を含む。
---

# ImageMagickによる画像操作

このSkillは、Windows、Linux、macOSでImageMagickを使った画像処理・操作を行う。

## このSkillを使う場面

次の作業が必要なときに使用する。

- 画像をサイズ変更する（単一またはバッチ）
- 画像の寸法とメタデータを取得する
- 画像形式を変換する
- サムネイルを作成する
- 画面サイズごとに壁紙を処理する
- 特定の条件で画像をバッチ処理する

## 前提条件

- システムにImageMagickがインストールされていること
- **Windows**: `magick` として利用できるPowerShell（または `C:\Program Files\ImageMagick-*\magick.exe`）
- **Linux/macOS**: パッケージマネージャー（`apt`、`brew`など）でImageMagickをインストールしたBash

## 主な機能

### 1. 画像情報

- 画像の寸法（幅 x 高さ）を取得する
- 詳細なメタデータ（形式、色空間など）を取得する
- 画像形式を識別する

### 2. 画像のサイズ変更

- 単一画像のサイズを変更する
- 複数画像をバッチでサイズ変更する
- 指定寸法のサムネイルを作成する
- アスペクト比を維持する

### 3. バッチ処理

- 寸法に基づいて画像を処理する
- 特定のファイル形式を絞り込み処理する
- 複数ファイルに変換を適用する

## 使用例

### 例0: `magick` 実行ファイルを解決する

**PowerShell (Windows):**
```powershell
# Prefer ImageMagick on PATH
$magick = (Get-Command magick -ErrorAction SilentlyContinue)?.Source

# Fallback: common install pattern under Program Files
if (-not $magick) {
    $magick = Get-ChildItem "C:\\Program Files\\ImageMagick-*\\magick.exe" -ErrorAction SilentlyContinue |
        Select-Object -First 1 -ExpandProperty FullName
}

if (-not $magick) {
    throw "ImageMagick not found. Install it and/or add 'magick' to PATH."
}
```

**Bash (Linux/macOS):**
```bash
# Check if magick is available on PATH
if ! command -v magick &> /dev/null; then
    echo "ImageMagick not found. Install it using your package manager:"
    echo "  Ubuntu/Debian: sudo apt install imagemagick"
    echo "  macOS: brew install imagemagick"
    exit 1
fi
```

### 例1: 画像の寸法を取得する

**PowerShell (Windows):**
```powershell
# For a single image
& $magick identify -format "%wx%h" path/to/image.jpg

# For multiple images
Get-ChildItem "path/to/images/*" | ForEach-Object { 
    $dimensions = & $magick identify -format "%f: %wx%h`n" $_.FullName
    Write-Host $dimensions 
}
```

**Bash (Linux/macOS):**
```bash
# For a single image
magick identify -format "%wx%h" path/to/image.jpg

# For multiple images
for img in path/to/images/*; do
    magick identify -format "%f: %wx%h\n" "$img"
done
```

### 例2: 画像のサイズを変更する

**PowerShell (Windows):**
```powershell
# Resize a single image
& $magick input.jpg -resize 427x240 output.jpg

# Batch resize images
Get-ChildItem "path/to/images/*" | ForEach-Object { 
    & $magick $_.FullName -resize 427x240 "path/to/output/thumb_$($_.Name)"
}
```

**Bash (Linux/macOS):**
```bash
# Resize a single image
magick input.jpg -resize 427x240 output.jpg

# Batch resize images
for img in path/to/images/*; do
    filename=$(basename "$img")
    magick "$img" -resize 427x240 "path/to/output/thumb_$filename"
done
```

### 例3: 詳細な画像情報を取得する

**PowerShell (Windows):**
```powershell
# Get verbose information about an image
& $magick identify -verbose path/to/image.jpg
```

**Bash (Linux/macOS):**
```bash
# Get verbose information about an image
magick identify -verbose path/to/image.jpg
```

### 例4: 寸法に基づいて画像を処理する

**PowerShell (Windows):**
```powershell
Get-ChildItem "path/to/images/*" | ForEach-Object { 
    $dimensions = & $magick identify -format "%w,%h" $_.FullName
    if ($dimensions) {
        $width,$height = $dimensions -split ','
        if ([int]$width -eq 2560 -or [int]$height -eq 1440) {
            Write-Host "Processing $($_.Name)"
            & $magick $_.FullName -resize 427x240 "path/to/output/thumb_$($_.Name)"
        }
    }
}
```

**Bash (Linux/macOS):**
```bash
for img in path/to/images/*; do
    dimensions=$(magick identify -format "%w,%h" "$img")
    if [[ -n "$dimensions" ]]; then
        width=$(echo "$dimensions" | cut -d',' -f1)
        height=$(echo "$dimensions" | cut -d',' -f2)
        if [[ "$width" -eq 2560 || "$height" -eq 1440 ]]; then
            filename=$(basename "$img")
            echo "Processing $filename"
            magick "$img" -resize 427x240 "path/to/output/thumb_$filename"
        fi
    fi
done
```

## ガイドライン

1. **ファイルパスは常に引用符で囲む** - 空白を含む可能性があるファイルパスを引用符で囲む。
2. **`&` 演算子を使う（PowerShell）** - PowerShellでは `&` を使ってmagick実行ファイルを呼び出す。
3. **パスを変数に格納する（PowerShell）** - コードを明確にするため、ImageMagickのパスを `$magick` に代入する。
4. **ループで囲む** - 複数ファイルを処理するときは、PowerShellでは `ForEach-Object`、Bashでは `for` ループを使う。
5. **最初に寸法を検証する** - 不要な処理を避けるため、処理前に画像の寸法を確認する。
6. **適切なサイズ変更フラグを使う** - 正確な寸法を強制する `!` や最小寸法を指定する `^` の使用を検討する。

## よく使うパターン

### PowerShellのパターン

#### パターン: ImageMagickのパスを格納する

```powershell
$magick = (Get-Command magick).Source
```

#### パターン: 寸法を変数として取得する

```powershell
$dimensions = & $magick identify -format "%w,%h" $_.FullName
$width,$height = $dimensions -split ','
```

#### パターン: 条件付き処理

```powershell
if ([int]$width -gt 1920) {
    & $magick $_.FullName -resize 1920x1080 $outputPath
}
```

#### パターン: サムネイルを作成する

```powershell
& $magick $_.FullName -resize 427x240 "thumbnails/thumb_$($_.Name)"
```

### Bashのパターン

#### パターン: ImageMagickのインストールを確認する

```bash
command -v magick &> /dev/null || { echo "ImageMagick required"; exit 1; }
```

#### パターン: 寸法を変数として取得する

```bash
dimensions=$(magick identify -format "%w,%h" "$img")
width=$(echo "$dimensions" | cut -d',' -f1)
height=$(echo "$dimensions" | cut -d',' -f2)
```

#### パターン: 条件付き処理

```bash
if [[ "$width" -gt 1920 ]]; then
    magick "$img" -resize 1920x1080 "$outputPath"
fi
```

#### パターン: サムネイルを作成する

```bash
filename=$(basename "$img")
magick "$img" -resize 427x240 "thumbnails/thumb_$filename"
```

## 制限事項

- 大規模なバッチ処理は多くのメモリを消費する場合がある。
- 複雑な処理には追加のImageMagick delegateが必要な場合がある。
- 古いLinuxシステムでは `magick` の代わりに `convert` を使う（ImageMagick 6.xと7.xの違い）。
