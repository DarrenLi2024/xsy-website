#!/usr/bin/env python3
"""
精确检测裁剪问题 - 检查底部 140px 是否包含有效内容
通过比较底部 140px 与上方像素的差异来判断
"""

import os
import sys
from pathlib import Path

try:
    from PIL import Image
    import numpy as np
except ImportError:
    print("Missing dependencies. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow", "numpy", "-q"])
    from PIL import Image
    import numpy as np

IMAGES_DIR = "/Users/lirundong/Code/work/芯师爷/web/public/images"

CROP_AMOUNT = 140  # 裁剪掉的像素数

def analyze_crop_boundary(image_path):
    """分析图片裁剪边界 - 检查最后可见的 20px 与裁剪掉的区域是否有内容"""
    try:
        img = Image.open(image_path)
        img.load()
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        arr = np.array(img)
        height, width = arr.shape[:2]
        
        # 裁剪掉了底部 CROP_AMOUNT px，所以我们现在看到图片的 bottom 就是裁剪边界
        # 检查底部 30px 的像素多样性
        bottom_region = arr[max(0, height - 30):height, :]
        top_region = arr[0:30, :]  # 顶部 30px 作为参考
        
        # 计算底部区域的通道统计
        bottom_std = []
        for c in range(3):
            bottom_std.append(float(np.std(bottom_region[:, :, c])))
        
        # 检查从底部向上，像素在哪一行的方差开始变大（说明开始有内容）
        # 如果底部 N px 方差很小，说明是纯色背景
        row_variances = []
        for row_idx in range(height - 1, max(0, height - 60), -1):
            row = arr[row_idx, :]
            row_var = np.std(row.astype(float))
            row_variances.append((row_idx, row_var))
        
        # 找到"内容开始"的行（方差突然变大）
        content_start_row = height
        for row_idx, var in reversed(row_variances):
            if var > 10:  # 方差阈值
                content_start_row = row_idx
                break
        
        # 底部纯色区域的高度
        solid_height = height - content_start_row
        
        return {
            "valid": True,
            "width": width,
            "height": height,
            "bottom_std_r": round(bottom_std[0], 2),
            "bottom_std_g": round(bottom_std[1], 2),
            "bottom_std_b": round(bottom_std[2], 2),
            "solid_height": solid_height,
            "content_start_row": content_start_row,
            "likely_overcropped": solid_height >= 20  # 如果纯色区域 >= 20px，可能过度裁剪
        }
    except Exception as e:
        return {"valid": False, "error": str(e)}

def check_original_vs_current(image_path):
    """通过检查图片判断是否被过度裁剪"""
    filename = os.path.basename(image_path)
    dir_name = os.path.basename(os.path.dirname(image_path))
    
    result = analyze_crop_boundary(image_path)
    
    if not result["valid"]:
        return f"✗ {dir_name}/{filename}: {result['error']}"
    
    status = "⚠️ 可能过度裁剪" if result["likely_overcropped"] else "✓ 正常"
    
    info = f"{status} {dir_name}/{filename}\n"
    info += f"  尺寸: {result['width']}x{result['height']}\n"
    info += f"  底部标准差: R={result['bottom_std_r']}, G={result['bottom_std_g']}, B={result['bottom_std_b']}\n"
    info += f"  底部纯色区域高度: {result['solid_height']}px\n"
    
    if result["likely_overcropped"]:
        info += f"  ⚠️ 底部 {result['solid_height']}px 可能是被裁剪后留下的纯色背景\n"
    
    return info

def main():
    print("=" * 80)
    print(f"裁剪边界分析 - 检测底部 {CROP_AMOUNT}px 裁剪是否过度")
    print("=" * 80)
    print()
    
    directories = ["ads", "covers", "cta", "hero", "logos", "testimonials", "topics"]
    
    overcropped = []
    
    for directory in directories:
        dir_path = os.path.join(IMAGES_DIR, directory)
        if not os.path.exists(dir_path):
            continue
        
        png_files = sorted([f for f in os.listdir(dir_path) if f.endswith('.png')])
        
        print(f"\n目录: {directory}/")
        print("-" * 80)
        
        for filename in png_files:
            filepath = os.path.join(dir_path, filename)
            info = check_original_vs_current(filepath)
            print(info)
            
            if "⚠️ 可能过度裁剪" in info:
                overcropped.append(f"{directory}/{filename}")
    
    print(f"\n{'='*80}")
    print("总结")
    print(f"{'='*80}")
    print(f"疑似过度裁剪的图片: {len(overcropped)}")
    
    if overcropped:
        print("\n需要检查的文件:")
        for f in overcropped:
            print(f"  - {f}")
    
    return overcropped

if __name__ == "__main__":
    main()
