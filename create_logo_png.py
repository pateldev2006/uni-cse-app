from PIL import Image, ImageDraw

def create_clean_logo(size=1024, filename="logo.png"):
    # Create dark obsidian background
    img = Image.new('RGBA', (size, size), (9, 13, 22, 255))
    draw = ImageDraw.Draw(img)

    padding = int(size * 0.08)
    radius = int(size * 0.22)
    
    # Outer Glowing Border
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=radius,
        fill=(19, 26, 41, 255),
        outline=(99, 102, 241, 255),
        width=int(size * 0.025)
    )

    cx, cy = size // 2, int(size * 0.45)
    w, h = int(size * 0.42), int(size * 0.2)

    # Graduation Cap Top Diamond
    diamond = [
        (cx, cy - h),
        (cx + w, cy),
        (cx, cy + h),
        (cx - w, cy)
    ]
    draw.polygon(diamond, fill=(255, 255, 255, 255))

    # Tech Pulse Base Arc
    arc_y = cy + int(h * 0.4)
    draw.arc(
        [cx - int(w * 0.55), arc_y, cx + int(w * 0.55), arc_y + int(h * 1.1)],
        start=0, end=180,
        fill=(6, 182, 212, 255),
        width=int(size * 0.035)
    )

    # Neon Emerald Pulse Node
    dot_r = int(size * 0.06)
    dot_x = cx + int(w * 0.6)
    dot_y = cy + int(h * 1.0)
    draw.ellipse(
        [dot_x - dot_r, dot_y - dot_r, dot_x + dot_r, dot_y + dot_r],
        fill=(16, 185, 129, 255),
        outline=(255, 255, 255, 255),
        width=int(size * 0.015)
    )

    img.save(filename, 'PNG')
    print(f"Clean logo generated: {filename}")

create_clean_logo(1024, "logo.png")
