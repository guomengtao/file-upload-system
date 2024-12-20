import os
import re

def update_footer(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 检查是否已经有站点地图链接
    if 'site-map.html' in content:
        return

    # 根据不同的页脚样式更新
    footer_patterns = [
        r'(<div class="footer-links mb-4">.*?)(</div>)',
        r'(<div class="container">.*?<div class="footer-links">.*?)(</div>)',
        r'(<div class="container">.*?<div class="row">.*?<div class="footer-links">.*?)(</div>)'
    ]

    site_map_link = '<a href="site-map.html"><i class="bi bi-map me-2"></i>站点地图</a>'

    for pattern in footer_patterns:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            updated_content = content[:match.start(1)] + match.group(1) + site_map_link + match.group(2) + content[match.end(2):]
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            print(f"Updated footer in {file_path}")
            return

    print(f"Could not update footer in {file_path}")

def main():
    base_dir = '/Users/event/Documents/git-files/Github-Pages/upload-files'
    html_files = [f for f in os.listdir(base_dir) if f.endswith('.html')]
    
    for file in html_files:
        file_path = os.path.join(base_dir, file)
        update_footer(file_path)

if __name__ == '__main__':
    main()
