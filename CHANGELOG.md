# Changelog

## [1.2.13] - 2024-12-19
### 改进
- 优化表单提交逻辑
- 阻止页面刷新
- 实现客户端侧错误处理
- 添加错误和成功消息显示函数

### 变更
- 重构表单提交事件处理
- 使用 `preventDefault()` 和 `stopPropagation()`
- 改进消息显示机制
- 简化错误处理流程

### 技术细节
- 前端表单提交完全由 JavaScript 控制
- 提供友好的用户反馈
- 减少页面重新加载

## [1.2.12] - 2024-12-19
### 新增
- 创建 `documents_table_setup.sql` 脚本
- 添加数据库表结构和测试数据的完整 SQL 脚本
- 包含表创建、索引和测试数据插入

### 变更
- 整合数据库初始化和测试数据脚本
- 添加多样化的测试数据集
- 支持文档和截图类型的测试记录

### 技术细节
- SQL 脚本支持所有字段可空
- 添加性能索引
- 使用真实的 Supabase 存储桶 URL

## [1.2.11] - 2024-12-19
### 变更
- 支持文档表所有字段可为空
- 优化数据提交逻辑
- 移除强制必填字段限制
- 添加默认值处理

### 技术细节
- 重构文档数据准备函数
- 增加数据提交的灵活性
- 改进错误处理机制

## [1.2.10] - 2024-12-19
### 修复
- 重构 Supabase 初始化逻辑
- 修复表单提交和测试表单的初始化问题
- 优化错误处理和日志记录

### 变更
- 将测试表单文本转换为英文
- 改进代码健壮性和可读性
- 调整表单初始化和提交流程

## [1.2.9] - 2024-12-19
### 新增
- 创建文档列表页面 `documents-list.html`
- 实现 Supabase 文档数据获取和展示
- 添加文档列表页面的动态数据渲染
- 在测试表单中添加 Supabase 数据插入功能

### 变更
- 更新导航栏，添加文档列表页面链接
- 优化测试表单提交逻辑
- 增加错误处理和日志记录

### 技术细节
- 使用 Supabase JavaScript 客户端
- 实现异步数据获取和插入
- 添加响应式设计和用户友好的界面

## [1.2.8] - 2024-12-19
### 新增
- 简化测试表单功能
- 添加基本的表单验证
- 提供即时用户反馈

### 变更
- 重构测试表单实现
- 优化表单交互逻辑
- 改进错误处理机制

## [1.2.7] - 2024-12-19
### 新增
- 添加测试表单功能
- 实现简单的前端测试提交逻辑
- 增加测试结果反馈机制

### 变更
- 在文档提交页面集成测试表单
- 添加测试表单事件处理函数
- 优化页面交互和用户反馈

## [1.2.6] - 2024-12-19
### 修复
- 解决表单元素空值和未定义错误
- 增加健壮性检查和安全的元素获取
- 优化DOM加载和事件绑定逻辑

### 变更
- 添加多重初始化方法确保表单正常加载
- 实现更安全的元素访问和默认值设置
- 改进错误处理和日志记录机制

## [1.2.5] - 2024-12-19
### 改进
- 添加表单默认值和初始化逻辑
- 防止空值和未定义值导致的错误
- 优化表单用户体验

### 变更
- 为所有输入字段添加默认值
- 实现动态表单初始化函数
- 改进错误处理和用户反馈机制

## [1.2.4] - 2024-12-19
### 修复
- 完全移除日期输入字段
- 简化文档提交表单
- 优化错误处理和用户反馈

### 变更
- 移除不必要的日期相关逻辑
- 更新中文本地化支持
- 保持与Supabase表结构的兼容性

## [1.2.3] - 2024-12-19
### Fixed
- Strictly adhered to Supabase documents table schema
- Correctly mapped `path` and `size` columns
- Removed unsupported column references

### Changes
- Updated document submission logic to match exact table structure
- Improved file upload metadata handling

## [1.2.2] - 2024-12-19
### Fixed
- Removed custom date column references
- Use default `created_at` timestamp for document creation date
- Simplified metadata submission logic

### Changes
- Adjusted document submission to use standard Supabase timestamp
- Improved compatibility with existing table schema

## [1.2.1] - 2024-12-19
### Fixed
- Adjusted document submission metadata to match Supabase table schema
- Replaced 'description' with 'notes' column
- Added dynamic field mapping for optional document details

### Changes
- Updated form labels and JavaScript submission logic
- Improved schema compatibility with Supabase documents table

## [1.2.0] - 2024-12-19
### Added
- Document Submission Form page
- Ability to submit document metadata to Supabase documents table
- Optional file upload with document details
- Comprehensive form validation and error handling

### Features
- Dynamic form with multiple input types
- Supabase database integration
- File upload to documents bucket
- Responsive and user-friendly design

### Improvements
- Enhanced metadata tracking
- Flexible document submission process
- Improved user interaction

## [1.1.0] - 2024-12-19
### Added
- Company Products Showcase page
- Product Detail page with dynamic content generation
- Enhanced file management across Screenshots and Documents buckets
- Comprehensive footer with quick navigation links

### Features
- Dynamic product information generation
- Supabase storage integration
- Responsive design with Bootstrap 5
- Interactive product gallery and details view

### Improvements
- Code organization and modularity
- Enhanced user experience
- Consistent design across all pages

## [1.0.0] - Initial Release
- Initial version of File Upload System
- Basic file upload and management functionality
- Supabase integration for storage and file management
