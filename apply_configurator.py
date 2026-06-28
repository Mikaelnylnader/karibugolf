#!/usr/bin/env python3
"""Add dropdown configurator to all iron product pages."""
import os, re

base = 'C:/Users/mikae/workspace/golf-kenya/dist/products'
tmqi_path = os.path.join(base, 'gk-ir-tmqi.html')

# Read the template (TMQI) to extract configurator CSS, HTML, and JS
with open(tmqi_path, 'r', encoding='utf-8') as f:
    tmqi = f.read()

# Extract configurator CSS block
css_start = tmqi.find('/* Configurator */')
css_end = tmqi.find('/* Loft Table */')
config_css = tmqi[css_start:css_end].rstrip()

# Extract configurator HTML block
html_start = tmqi.find('<!-- Dropdown Configurator -->')
html_end = tmqi.find('<div class="product-detail-desc">')
config_html = tmqi[html_start:html_end]

# Extract configurator JS
js_start = tmqi.find('function updateConfig()')
js_end = tmqi.find('</script>', js_start)
config_js = tmqi[js_start:js_end]

# List all iron pages except TMQI
iron_pages = sorted([f for f in os.listdir(base) if f.startswith('gk-ir-') and f != 'gk-ir-tmqi.html'])

for page in iron_pages:
    path = os.path.join(base, page)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # 1. Add configurator CSS before the @media query
    media_pos = content.find('@media (max-width: 768px)')
    if media_pos == -1:
        print(f'{page}: no @media found, skipping')
        continue
    
    before_media = content[:media_pos].rstrip()
    after_media = content[media_pos:]
    
    # Check if configurator CSS already exists
    if '/* Configurator */' in before_media:
        print(f'{page}: configurator already exists, skipping')
        continue
    
    new_content = before_media + '\n        ' + config_css + '\n        ' + after_media
    
    # 2. Replace the product-detail-meta section with configurator HTML
    # Find the meta section - from <div class="product-detail-meta"> to </div> after it
    meta_start = new_content.find('<div class="product-detail-meta">')
    meta_end = new_content.find('</div>', meta_start)
    # Find the closing </div> of the meta div - need the NEXT </div> after the meta items
    # Actually let's find the </div> that closes product-detail-meta
    meta_end = new_content.find('</div>', meta_start)
    meta_end = new_content.find('</div>', meta_end + 6)
    meta_end = new_content.find('</div>', meta_end + 6) + 6  # Third </div> closes the meta
    
    # Also remove the <p class="product-detail-size"> line
    size_start = new_content.find('<p class="product-detail-size">')
    size_end = new_content.find('</p>', size_start) + 4
    
    if meta_start == -1 or size_start == -1:
        print(f'{page}: no meta/size section found')
        continue
    
    # Get the price div
    price_start = new_content.find('<div class="product-detail-price">', size_end)
    price_end = new_content.find('</div>', price_start) + 6
    
    # Get the product name for the config summary
    title_match = re.search(r'<h1 class="product-detail-title">(.+?)</h1>', new_content)
    product_name = title_match.group(1) if title_match else page.replace('.html', '')
    
    # Build the configurator HTML with the product name
    config_html_custom = config_html.replace('TaylorMade Qi10 Steel Irons', product_name)
    
    # Replace meta + size + price with just price + configurator
    before_price = new_content[:meta_start]
    after_price = new_content[price_end:]
    new_content = before_price + new_content[meta_start:price_end] + '\n\n' + config_html_custom + after_price
    
    # 3. Add JS at the end before </body>
    body_end = new_content.rfind('</body>')
    if body_end != -1 and 'function updateConfig()' not in new_content:
        before_body = new_content[:body_end].rstrip()
        after_body = new_content[body_end:]
        new_content = before_body + '\n    <script>\n' + config_js + '\n    </script>\n' + after_body
    
    if new_content != original:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'{page}: UPDATED')
    else:
        print(f'{page}: no changes')
