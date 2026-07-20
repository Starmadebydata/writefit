#!/usr/bin/env python3
"""生成 WriteFit 品牌图片：public/og-image.png (1200x630) 和 public/logo.png (512x512)。

用法：python3 scripts/generate-og-image.py
品牌色取自 app/globals.css：primary 深青（oklch 0.35 0.08 165）、accent 暖琥珀（oklch 0.92 0.06 80）。
"""

from PIL import Image, ImageDraw, ImageFont
import os

# 品牌色（sRGB 近似值）
TEAL_DARK = (18, 61, 52)       # 深青背景
TEAL_MID = (31, 90, 78)        # 主色
CREAM = (245, 239, 221)        # 暖白文字
CREAM_DIM = (176, 196, 186)    # 次要文字
AMBER = (232, 196, 104)        # 琥珀强调色

FONT_CANDIDATES = [
    "/System/Library/Fonts/HelveticaNeue.ttc",
    "/System/Library/Fonts/Helvetica.ttc",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]


def load_font(size, bold=True):
    """按候选顺序加载系统字体；ttc 时优先尝试 Bold 索引。"""
    for path in FONT_CANDIDATES:
        if not os.path.exists(path):
            continue
        indices = [1, 0] if (bold and path.endswith(".ttc")) else [0]
        for idx in indices:
            try:
                return ImageFont.truetype(path, size, index=idx)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_tracked(draw, pos, text, font, fill, tracking=0):
    """逐字绘制以支持字距（tracking，单位 px）。"""
    x, y = pos
    for ch in text:
        draw.text((x, y), ch, font=font, fill=fill)
        x += draw.textlength(ch, font=font) + tracking
    return x


def make_og_image():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), TEAL_DARK)
    d = ImageDraw.Draw(img)

    margin = 90

    # 顶部小标签（琥珀色、加宽字距）
    label_font = load_font(30, bold=True)
    draw_tracked(d, (margin, 128), "AI WRITING COACH", label_font, AMBER, tracking=10)

    # 主标题
    title_font = load_font(168, bold=True)
    d.text((margin - 6, 180), "WriteFit", font=title_font, fill=CREAM)

    # 琥珀强调线
    d.rectangle([margin, 400, margin + 220, 408], fill=AMBER)

    # 副标题
    tag_font = load_font(42, bold=False)
    d.text((margin, 448), "Trains your writing ability —", font=tag_font, fill=CREAM)
    d.text((margin, 502), "never writes for you.", font=tag_font, fill=CREAM)

    # 右下角域名
    domain_font = load_font(28, bold=False)
    domain = "writefit.app"
    dw = d.textlength(domain, font=domain_font)
    d.text((W - margin - dw, H - 72), domain, font=domain_font, fill=CREAM_DIM)

    img.save("public/og-image.png", "PNG", optimize=True)
    print("public/og-image.png", img.size)


def make_logo():
    S = 512
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    # 圆角方块背景
    radius = 96
    d.rounded_rectangle([0, 0, S, S], radius=radius, fill=TEAL_DARK)

    # 居中 W
    w_font = load_font(300, bold=True)
    bbox = d.textbbox((0, 0), "W", font=w_font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text(((S - tw) / 2 - bbox[0], (S - th) / 2 - bbox[1] - 12), "W", font=w_font, fill=CREAM)

    # 右下角琥珀圆点（训练"打卡"意象）
    dot_r = 34
    cx, cy = S - 118, S - 118
    d.ellipse([cx - dot_r, cy - dot_r, cx + dot_r, cy + dot_r], fill=AMBER)

    img.save("public/logo.png", "PNG", optimize=True)
    print("public/logo.png", img.size)


if __name__ == "__main__":
    make_og_image()
    make_logo()
