#!/usr/bin/env python3
import argparse
from pathlib import Path
import re

IMAGE_URL = 'https://grupo-pacvil.vercel.app/assets/brand/logo-horizontal-color.svg'


def ensure_meta(html: str) -> str:
    og_tag = f'<meta property="og:image" content="{IMAGE_URL}">' 
    tw_tag = f'<meta name="twitter:image" content="{IMAGE_URL}">' 

    if 'og:image' not in html:
        html, n = re.subn(r'(<meta property="og:description"[^>]*>)', r'\1' + og_tag, html, count=1)
        if n == 0:
            html = html.replace('<link rel="canonical"', og_tag + '<link rel="canonical"', 1)

    if 'twitter:image' not in html:
        html, n = re.subn(r'(<meta name="twitter:description"[^>]*>)', r'\1' + tw_tag, html, count=1)
        if n == 0:
            html = html.replace('<link rel="canonical"', tw_tag + '<link rel="canonical"', 1)

    return html


def main():
    parser = argparse.ArgumentParser(description='Add og:image and twitter:image tags when missing.')
    parser.add_argument('path', nargs='+', help='HTML file(s) to update')
    args = parser.parse_args()

    for p in args.path:
        path = Path(p)
        if not path.exists():
            raise SystemExit(f'File not found: {path}')
        text = path.read_text(encoding='utf-8')
        updated = ensure_meta(text)
        if updated != text:
            path.write_text(updated, encoding='utf-8')
            print(f'Updated: {path}')
        else:
            print(f'No changes: {path}')


if __name__ == '__main__':
    main()
