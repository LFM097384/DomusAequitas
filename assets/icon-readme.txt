# 图标占位符

这个文件是图标的占位符。在实际构建时，electron-builder会自动处理图标转换。

建议图标规格:
- Windows ICO: 256x256, 128x128, 64x64, 48x48, 32x32, 16x16
- macOS ICNS: 1024x1024, 512x512, 256x256, 128x128, 64x64, 32x32, 16x16
- Linux PNG: 512x512

如果有专业的图标文件，请替换 assets/ 目录下的相应文件:
- assets/icon.ico (Windows)
- assets/icon.icns (macOS)  
- assets/icon.png (Linux)
