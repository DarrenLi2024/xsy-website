#!/usr/bin/env python3
"""
激进去水印策略 v2:
1. 裁剪底部 80px（覆盖更宽的水印区域）
2. 对于底部剩余区域做模糊化处理（以防残留）
"""
import os
from PIL import Image, ImageFilter

IMAGES_DIR = os.path.join(os.path.dirname(__file__), "..", "public", "images")
CROP_BOTTOM = 80  # 增大裁剪高度
BLUR_H = 20       # 底部模糊区域高度

def remove_watermark_v2(filepath):
    try:
        img = Image.open(filepath)
        w, h = img.size
        
        # 裁剪底部 80px
        cropped = img.crop((0, 0, w, h - CROP_BOTTOM))
        
        # 对裁剪后的底部 20px 做轻微模糊（消除残留痕迹）
        new_h = h - CROP_BOTTOM
        if new_h > BLUR_H:
            upper = cropped.crop((0, 0, w, new_h - BLUR_H))
            lower = cropped.crop((0, new_h - BLUR_H, w, new_h))
            lower = lower.filter(ImageFilter.GaussianBlur(radius=3))
            result = Image.new('RGB', (w, new_h))
            result.paste(upper, (0, 0))
            result.paste(lower, (0, new_h - BLUR_H))
        else:
            result = cropped
        
        result.save(filepath, "PNG", optimize=True)
        return True, f"{w}x{h} → {result.size[0]}x{result.size[1]}"
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
        ok, msg = remove_watermark_v2(f)
        if ok:
            print(f"  ✅ {rel} ({msg})")
            success += 1
        else:
            print(f"  ❌ {rel}: {msg}")
            failed += 1
    
    print(f"\n处理完成: {success} 成功, {failed} 失败")

if __name__ == "__main__":
    main()
