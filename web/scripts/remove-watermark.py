#!/usr/bin/env python3
"""批量移除AI水印：裁剪图片底部40像素"""
import os
import sys
from PIL import Image

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")
CROP_BOTTOM = 40  # 裁剪底部像素数

def remove_watermark(filepath):
    try:
        img = Image.open(filepath)
        w, h = img.size
        
        # 裁剪掉底部 CROP_BOTTOM 像素
        cropped = img.crop((0, 0, w, h - CROP_BOTTOM))
        
        # 覆盖保存
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
    
    success = 0
    failed = 0
    
    for f in sorted(png_files):
        rel = os.path.relpath(f, IMAGES_DIR)
        ok, msg = remove_watermark(f)
        if ok:
            print(f"  ✅ {rel} ({msg})")
            success += 1
        else:
            print(f"  ❌ {rel}: {msg}")
            failed += 1
    
    print(f"\n处理完成: {success} 成功, {failed} 失败")

if __name__ == "__main__":
    main()
