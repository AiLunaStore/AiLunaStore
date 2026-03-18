#!/usr/bin/env python3
"""
Nurse Brain Sheet Watermarker
Adds PREVIEW watermark and copyright notice to screenshots for Etsy listings.

Usage:
    python watermark.py                    # Process all medsurg-preview-*.png files
    python watermark.py --input "*.jpg"    # Process custom pattern
    python watermark.py --opacity 0.3      # Adjust watermark opacity
    python watermark.py --width 2000       # Resize to specific width
"""

import os
import sys
import glob
import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageEnhance


def get_font(size):
    """Get a font for the watermark text."""
    # Try common system fonts
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",  # macOS
        "/System/Library/Fonts/Helvetica.ttc",  # macOS fallback
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",  # Linux
        "C:/Windows/Fonts/arial.ttf",  # Windows
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",  # Linux alt
    ]
    
    for font_path in font_paths:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except:
                pass
    
    # Fallback to default font
    return ImageFont.load_default()


def add_watermark(image_path, output_path, options):
    """
    Add PREVIEW watermark and copyright notice to an image.
    
    Args:
        image_path: Path to input image
        output_path: Path to save watermarked image
        options: Namespace with watermark options
    """
    try:
        # Open image
        with Image.open(image_path) as img:
            # Convert to RGBA for transparency support
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Resize if needed (maintain aspect ratio)
            if options.width and img.width != options.width:
                ratio = options.width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((options.width, new_height), Image.Resampling.LANCZOS)
            
            # Create transparent overlay for watermarks
            overlay = Image.new('RGBA', img.size, (255, 255, 255, 0))
            draw = ImageDraw.Draw(overlay)
            
            # === DIAGONAL PREVIEW WATERMARK ===
            preview_text = options.preview_text
            preview_font_size = int(min(img.width, img.height) * options.preview_scale)
            preview_font = get_font(preview_font_size)
            
            # Calculate text size
            bbox = draw.textbbox((0, 0), preview_text, font=preview_font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
            
            # Create a larger canvas for rotated text
            diagonal = int((img.width ** 2 + img.height ** 2) ** 0.5) + 100
            text_canvas = Image.new('RGBA', (diagonal, diagonal), (255, 255, 255, 0))
            text_draw = ImageDraw.Draw(text_canvas)
            
            # Draw text on canvas
            text_x = (diagonal - text_width) // 2
            text_y = (diagonal - text_height) // 2
            
            # Draw semi-transparent white text with slight shadow for visibility
            shadow_color = (0, 0, 0, int(255 * options.opacity * 0.3))
            text_color = (255, 255, 255, int(255 * options.opacity))
            
            # Shadow offset
            offset = max(2, preview_font_size // 50)
            text_draw.text((text_x + offset, text_y + offset), preview_text, 
                          font=preview_font, fill=shadow_color)
            text_draw.text((text_x, text_y), preview_text, 
                          font=preview_font, fill=text_color)
            
            # Rotate the text canvas
            rotated = text_canvas.rotate(45, expand=False, resample=Image.Resampling.BICUBIC)
            
            # Calculate position to center rotated text
            paste_x = (img.width - rotated.width) // 2
            paste_y = (img.height - rotated.height) // 2
            
            # Paste rotated text onto overlay
            overlay.paste(rotated, (paste_x, paste_y), rotated)
            
            # === COPYRIGHT NOTICE ===
            copyright_text = options.copyright_text
            copyright_font_size = int(min(img.width, img.height) * options.copyright_scale)
            copyright_font = get_font(copyright_font_size)
            
            # Calculate text size
            bbox = draw.textbbox((0, 0), copyright_text, font=copyright_font)
            copy_width = bbox[2] - bbox[0]
            copy_height = bbox[3] - bbox[1]
            
            # Position at bottom center with padding
            padding = int(img.height * 0.03)
            copy_x = (img.width - copy_width) // 2
            copy_y = img.height - copy_height - padding - bbox[1]
            
            # Draw copyright with background bar for readability
            bar_height = copy_height + padding * 2
            bar_y = img.height - bar_height
            
            # Semi-transparent black background bar
            bar_color = (0, 0, 0, int(255 * options.opacity * 0.7))
            draw.rectangle([0, bar_y, img.width, img.height], fill=bar_color)
            
            # White copyright text
            copy_color = (255, 255, 255, int(255 * min(options.opacity * 1.5, 0.9)))
            draw.text((copy_x, copy_y), copyright_text, font=copyright_font, fill=copy_color)
            
            # Composite overlay onto original image
            result = Image.alpha_composite(img, overlay)
            
            # Convert back to RGB for saving (JPEG doesn't support alpha)
            if result.mode == 'RGBA':
                # Create white background
                background = Image.new('RGB', result.size, (255, 255, 255))
                background.paste(result, mask=result.split()[3])  # Use alpha channel as mask
                result = background
            
            # Save with high quality
            result.save(output_path, 'PNG', optimize=True)
            
            return True
            
    except Exception as e:
        print(f"  ✗ Error processing {image_path}: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(
        description='Add watermarks to nurse brain sheet screenshots for Etsy.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python watermark.py                           # Process default pattern
  python watermark.py --input "*.jpg"           # Process JPG files
  python watermark.py --opacity 0.4             # More visible watermark
  python watermark.py --width 1500              # Resize to 1500px width
  python watermark.py --preview-scale 0.25      # Larger PREVIEW text
        """
    )
    
    parser.add_argument(
        '--input', '-i',
        default='medsurg-preview-*.png',
        help='Input file pattern (default: medsurg-preview-*.png)'
    )
    
    parser.add_argument(
        '--output-prefix', '-o',
        default='watermarked-',
        help='Output filename prefix (default: watermarked-)'
    )
    
    parser.add_argument(
        '--opacity',
        type=float,
        default=0.25,
        help='Watermark opacity 0.0-1.0 (default: 0.25)'
    )
    
    parser.add_argument(
        '--preview-text',
        default='PREVIEW',
        help='Preview watermark text (default: PREVIEW)'
    )
    
    parser.add_argument(
        '--preview-scale',
        type=float,
        default=0.18,
        help='Preview text size as ratio of image size (default: 0.18)'
    )
    
    parser.add_argument(
        '--copyright-text',
        default='© Nurse Brain Sheets - Purchase Required for Use',
        help='Copyright notice text'
    )
    
    parser.add_argument(
        '--copyright-scale',
        type=float,
        default=0.035,
        help='Copyright text size as ratio of image size (default: 0.035)'
    )
    
    parser.add_argument(
        '--width',
        type=int,
        default=1500,
        help='Output width in pixels, 0 to keep original (default: 1500)'
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Show what would be processed without making changes'
    )
    
    args = parser.parse_args()
    
    # Validate opacity
    args.opacity = max(0.0, min(1.0, args.opacity))
    
    # Find matching files
    pattern = args.input
    files = glob.glob(pattern)
    
    # Also check common variations
    if not files and pattern == 'medsurg-preview-*.png':
        # Try other common patterns
        for alt_pattern in ['*.png', '*.jpg', '*.jpeg']:
            alt_files = glob.glob(alt_pattern)
            if alt_files:
                print(f"No files matching '{pattern}' found.")
                print(f"Found {len(alt_files)} file(s) matching '{alt_pattern}'")
                response = input("Use these files instead? (y/n): ")
                if response.lower() == 'y':
                    files = alt_files
                    break
    
    if not files:
        print(f"No files found matching pattern: {pattern}")
        print("\nMake sure you're in the directory with your image files.")
        sys.exit(1)
    
    # Sort files for consistent ordering
    files.sort()
    
    print(f"\n{'='*60}")
    print("Nurse Brain Sheet Watermarker")
    print(f"{'='*60}")
    print(f"Found {len(files)} file(s) to process")
    print(f"Settings:")
    print(f"  Preview text: '{args.preview_text}' (scale: {args.preview_scale})")
    print(f"  Copyright: '{args.copyright_text}' (scale: {args.copyright_scale})")
    print(f"  Opacity: {args.opacity}")
    print(f"  Output width: {args.width}px" if args.width else "  Output width: original")
    print(f"{'='*60}\n")
    
    if args.dry_run:
        print("DRY RUN - No files will be modified")
        for f in files:
            output_name = args.output_prefix + os.path.basename(f)
            print(f"  Would create: {output_name}")
        print(f"\nRun without --dry-run to process files.")
        sys.exit(0)
    
    # Process files
    success_count = 0
    error_count = 0
    
    for i, filepath in enumerate(files, 1):
        filename = os.path.basename(filepath)
        output_name = args.output_prefix + filename
        
        # If input is PNG but we want to ensure PNG output
        if not output_name.lower().endswith('.png'):
            output_name = os.path.splitext(output_name)[0] + '.png'
        
        print(f"[{i}/{len(files)}] Processing: {filename}")
        print(f"  → Output: {output_name}")
        
        if add_watermark(filepath, output_name, args):
            print(f"  ✓ Success")
            success_count += 1
        else:
            error_count += 1
    
    # Summary
    print(f"\n{'='*60}")
    print("Processing Complete!")
    print(f"{'='*60}")
    print(f"  Successful: {success_count}")
    print(f"  Errors: {error_count}")
    print(f"  Total: {len(files)}")
    print(f"{'='*60}\n")
    
    if error_count > 0:
        sys.exit(1)


if __name__ == '__main__':
    main()