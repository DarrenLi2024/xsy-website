#!/usr/bin/env python3
"""
审计图片质量 - 检测过度裁剪问题
检查底部 20px 是否为纯色（表明内容被裁剪掉了）
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

def is_solid_color(image, bottom_rows=20, threshold=0.05):
    """
    检查图片底部 N 行是否为纯色
    返回: (is_solid, color, std_dev)
    """
    img_array = np.array(image)
    height, width = img_array.shape[:2]
    
    # 获取底部 N 行
    bottom = img_array[max(0, height - bottom_rows):height, :]
    
    # 计算标准差 - 如果所有像素都很接近，说明是纯色
    if len(bottom.shape) == 3:  # 彩色图片
        std_per_channel = []
        for channel in range(bottom.shape[2]):
            std_per_channel.append(np.std(bottom[:, :, channel]))
        total_std = np.mean(std_per_channel)
        avg_color = np.mean(bottom, axis=(0, 1)).astype(int).tolist()
    else:  # 灰度图
        total_std = np.std(bottom)
        avg_color = int(np.mean(bottom))
    
    is_solid = total_std < (255 * threshold)  # 标准差小于 5% 视为纯色
    return is_solid, avg_color, round(total_std, 2)

def check_image(filepath):
    """检查单个图片"""
    try:
        img = Image.open(filepath)
        img.load()  # 确保图片完全加载
        
        width, height = img.size
        format = img.format
        
        # 检查底部是否为纯色
        is_solid, avg_color, std = is_solid_color(img)
        
        return {
            "valid": True,
            "width": width,
            "height": height,
            "format": format,
            "mode": img.mode,
            "bottom_solid": is_solid,
            "bottom_color": avg_color,
            "bottom_std": std,
        }
    except Exception as e:
        return {
            "valid": False,
            "error": str(e)
        }

def main():
    print("=" * 80)
    print("图片质量审计 - 过度裁剪检测")
    print("=" * 80)
    print()
    
    # 获取所有 PNG 文件，按目录分组
    directories = [
        "ads", "covers", "cta", "hero", "logos", "testimonials", "topics"
    ]
    
    all_results = []
    problematic = []
    
    for directory in directories:
        dir_path = os.path.join(IMAGES_DIR, directory)
        if not os.path.exists(dir_path):
            print(f"目录不存在: {dir_path}")
            continue
        
        png_files = sorted([f for f in os.listdir(dir_path) if f.endswith('.png')])
        
        print(f"\n{'='*80}")
        print(f"目录: {directory}/ ({len(png_files)} 个文件)")
        print(f"{'='*80}")
        
        for filename in png_files:
            filepath = os.path.join(dir_path, filename)
            result = check_image(filepath)
            
            status = "✓" if result["valid"] else "✗"
            rel_path = f"{directory}/{filename}"
            
            if result["valid"]:
                solid_marker = "⚠️ 纯色底部" if result["bottom_solid"] else "  "
                print(f"{status} {solid_marker} {rel_path}")
                print(f"      尺寸: {result['width']}x{result['height']}, 模式: {result['mode']}, 底部标准差: {result['bottom_std']}")
                
                if result["bottom_solid"]:
                    print(f"      ⚠️ 底部20px接近纯色! 颜色: {result['bottom_color']}")
                    problematic.append({
                        "path": rel_path,
                        "width": result["width"],
                        "height": result["height"],
                        "bottom_color": result["bottom_color"],
                        "std": result["bottom_std"]
                    })
            else:
                print(f"{status} {rel_path}")
                print(f"      错误: {result['error']}")
            
            all_results.append({
                "path": rel_path,
                "result": result
            })
    
    # 总结
    print(f"\n{'='*80}")
    print("审计总结")
    print(f"{'='*80}")
    print(f"总文件数: {len(all_results)}")
    print(f"有效图片: {sum(1 for r in all_results if r['result']['valid'])}")
    print(f"无效图片: {sum(1 for r in all_results if not r['result']['valid'])}")
    print(f"疑似过度裁剪 (底部纯色): {len(problematic)}")
    
    if problematic:
        print(f"\n⚠️ 疑似过度裁剪的图片 (底部为纯色，内容可能已丢失):")
        print("-" * 80)
        for p in problematic:
            print(f"  {p['path']}")
            print(f"    尺寸: {p['width']}x{p['height']}, 底部颜色: {p['bottom_color']}, 标准差: {p['std']}")
    
    return problematic

if __name__ == "__main__":
    main()
