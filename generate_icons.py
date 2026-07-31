from PIL import Image, ImageDraw

def create_app_icon(size, filename):
    # Create RGBA Image with rich indigo gradient background
    img = Image.new('RGBA', (size, size), (99, 102, 241, 255))
    draw = ImageDraw.Draw(img)

    # Draw rounded rectangle background
    padding = int(size * 0.05)
    corner_radius = int(size * 0.22)
    
    # Dark Midnight Blue Inner Container
    draw.rounded_rectangle(
        [padding, padding, size - padding, size - padding],
        radius=corner_radius,
        fill=(15, 23, 42, 255),
        outline=(99, 102, 241, 255),
        width=int(size * 0.03)
    )

    # Draw Graduation Cap / Mortarboard Symbol
    center_x = size // 2
    center_y = int(size * 0.42)
    width = int(size * 0.45)
    height = int(size * 0.22)

    # Cap Top Diamond
    top_poly = [
        (center_x, center_y - height),
        (center_x + width, center_y),
        (center_x, center_y + height),
        (center_x - width, center_y)
    ]
    draw.polygon(top_poly, fill=(255, 255, 255, 255))

    # Cap Base Skull
    skull_y = center_y + int(height * 0.5)
    draw.arc(
        [center_x - int(width * 0.6), skull_y, center_x + int(width * 0.6), skull_y + int(height * 1.2)],
        start=0, end=180,
        fill=(255, 255, 255, 255),
        width=int(size * 0.04)
    )

    # Emerald Pulse Dot
    dot_radius = int(size * 0.08)
    dot_x = center_x + int(width * 0.65)
    dot_y = center_y + int(height * 1.1)
    draw.ellipse(
        [dot_x - dot_radius, dot_y - dot_radius, dot_x + dot_radius, dot_y + dot_radius],
        fill=(16, 185, 129, 255),
        outline=(255, 255, 255, 255),
        width=int(size * 0.02)
    )

    img.save(filename, 'PNG')
    print(f"Generated {filename} ({size}x{size})")

create_app_icon(192, 'icon-192.png')
create_app_icon(512, 'icon-512.png')
