#!/usr/bin/env python3
"""
去水印 v3: 裁剪底部100px（共140px从原始高度）
水印区域通常占据50-100像素高度
"""
import os
from PIL import Image

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")
CROP_BOTTOM = 100

def process(filepath):
    try:
        img = Image.open(filepath)
        w, h = img.size
        cropped = img.crop((0, 0, w, h - CROP_BOTTOM))
        cropped.save(filepath, "PNG", optimize=True)
        return True, f"{w}x{h} → {w}x{h - CROP_BOTTOM}"
    except Exception as e:
        return False, str(e)

def main():
    png_files = []
    for root, dirs, files in os.walk(IMAGES_DIR):
        for f in files:
            if f.lower().endswith('.png'):
                png_files.append(os.path.join(root, f))
    
    print(f"找到 {len(png_files)} 张PNG图片")
    ok = fail = 0
    for f in sorted(png_files):
        rel = os.path.relpath(f, IMAGES_DIR)
        success, msg = process(f)
        print(f"  {'✅' if success else '❌'} {rel} ({msg})")
        if success: ok += 1
        else: fail += 1
    
    print(f"\n{ok} 成功, {fail} 失败")

if __name__ == "__main__":
    main()
