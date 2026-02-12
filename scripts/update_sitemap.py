#!/usr/bin/env python3
import argparse
from datetime import date
from pathlib import Path
import xml.etree.ElementTree as ET

SITEMAP_PATH = Path('site/sitemap.xml')
BASE_URL = 'https://grupo-pacvil.vercel.app'


def _indent(elem, level=0):
    indent_str = "  "
    i = "\n" + level * indent_str
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + indent_str
        for child in elem:
            _indent(child, level + 1)
        if not child.tail or not child.tail.strip():
            child.tail = i
    if level and (not elem.tail or not elem.tail.strip()):
        elem.tail = i


def _load_sitemap(path):
    tree = ET.parse(path)
    root = tree.getroot()
    return tree, root


def _url_text(url_elem, tag):
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    node = url_elem.find(f'sm:{tag}', ns)
    return node.text if node is not None else ''


def _set_text(url_elem, tag, value):
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    node = url_elem.find(f'{{{ns}}}{tag}')
    if node is None:
        node = ET.SubElement(url_elem, f'{{{ns}}}{tag}')
    node.text = value


def _remove_url(root, url):
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    for url_elem in list(root.findall('sm:url', ns)):
        loc = url_elem.find('sm:loc', ns)
        if loc is not None and loc.text == url:
            root.remove(url_elem)


def _find_url(root, url):
    ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
    for url_elem in root.findall('sm:url', ns):
        loc = url_elem.find('sm:loc', ns)
        if loc is not None and loc.text == url:
            return url_elem
    return None


def _add_url(root, url, lastmod, changefreq='monthly', priority='0.6'):
    ns = 'http://www.sitemaps.org/schemas/sitemap/0.9'
    url_elem = ET.SubElement(root, f'{{{ns}}}url')
    ET.SubElement(url_elem, f'{{{ns}}}loc').text = url
    ET.SubElement(url_elem, f'{{{ns}}}lastmod').text = lastmod
    ET.SubElement(url_elem, f'{{{ns}}}changefreq').text = changefreq
    ET.SubElement(url_elem, f'{{{ns}}}priority').text = priority
    return url_elem


def main():
    parser = argparse.ArgumentParser(description='Update sitemap lastmod entries and add blog posts.')
    parser.add_argument('--post', help='Path to a post html file under site/, e.g. site/blog/posts/2026-02-12-mi-post.html')
    parser.add_argument('--date', help='Date for lastmod in YYYY-MM-DD (default: today)')
    parser.add_argument('--all', action='store_true', help='Update lastmod for all URLs in the sitemap')
    args = parser.parse_args()

    if not SITEMAP_PATH.exists():
        raise SystemExit(f'No sitemap found at {SITEMAP_PATH}')

    lastmod = args.date or date.today().isoformat()
    tree, root = _load_sitemap(SITEMAP_PATH)

    # Remove thank-you page from sitemap
    _remove_url(root, f'{BASE_URL}/gracias.html')

    post_url = None
    if args.post:
        post_path = Path(args.post)
        if not post_path.exists():
            raise SystemExit(f'Post not found: {post_path}')
        # Build URL relative to site/
        try:
            rel = post_path.relative_to('site')
        except ValueError:
            raise SystemExit('Post path must be inside the site/ folder')
        post_url = f'{BASE_URL}/{rel.as_posix()}'

        url_elem = _find_url(root, post_url)
        if url_elem is None:
            _add_url(root, post_url, lastmod)
        else:
            _set_text(url_elem, 'lastmod', lastmod)

        # Update blog index lastmod when a post is added/updated
        blog_index = _find_url(root, f'{BASE_URL}/blog/')
        if blog_index is not None:
            _set_text(blog_index, 'lastmod', lastmod)

    if args.all:
        ns = {'sm': 'http://www.sitemaps.org/schemas/sitemap/0.9'}
        for url_elem in root.findall('sm:url', ns):
            _set_text(url_elem, 'lastmod', lastmod)

    _indent(root)
    tree.write(SITEMAP_PATH, encoding='utf-8', xml_declaration=True)

    if post_url:
        print(f'Updated sitemap with post: {post_url}')
    else:
        print('Updated sitemap.')


if __name__ == '__main__':
    main()
