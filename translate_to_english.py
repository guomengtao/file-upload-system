import os
import re

def replace_chinese_text(text):
    # 导航和页面标题替换
    replacements = {
        '文件管理系统': 'File Management System',
        '首页': 'Home',
        '文档上传': 'Document Upload',
        '存储桶管理': 'Bucket Management',
        '创建存储桶': 'Create Bucket',
        '存储桶': 'Bucket',
        '文档': 'Document',
        '文件': 'File',
        '页数': 'Pages',
        '名称': 'Name',
        '类型': 'Type',
        '说明': 'Description',
        '上传': 'Upload',
        '加载中': 'Loading',
        '调试信息': 'Debug Info',
        '选择': 'Select',
        '报告': 'Report',
        '合同': 'Contract',
        '发票': 'Invoice',
        '使用手册': 'Manual',
        '其他': 'Other',
        '可选': 'Optional',
        '页数（可选）': 'Pages (Optional)',
        '文档名称': 'Document Name',
        '文档类型': 'Document Type',
        '附加说明（可选）': 'Additional Notes (Optional)',
        '私有': 'Private',
        '公开': 'Public'
    }

    for chinese, english in replacements.items():
        text = text.replace(chinese, english)

    return text

def translate_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 使用正则表达式替换中文文本
    translated_content = replace_chinese_text(content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(translated_content)

    print(f"Translated: {file_path}")

def main():
    base_dir = '/Users/event/Documents/git-files/Github-Pages/upload-files'
    files_to_translate = [
        'bucket-files.html', 
        'documents-list.html',
        'bucket-status.html', 
        'documents-upload.html',
        'buckets-list.html', 
        'index.html',
        'combined-files.html', 
        'product-detail.html',
        'company-products.html', 
        'screenshots-files.html',
        'create-bucket.html', 
        'screenshots-status.html',
        'document-submission.html', 
        'screenshots-upload.html'
    ]

    for filename in files_to_translate:
        file_path = os.path.join(base_dir, filename)
        if os.path.exists(file_path):
            translate_html_file(file_path)

if __name__ == '__main__':
    main()
