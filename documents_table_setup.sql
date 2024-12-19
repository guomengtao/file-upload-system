-- 删除现有的 documents 表（如果存在）
DROP TABLE IF EXISTS documents;

-- 创建新的 documents 表，所有字段都可为空
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    name TEXT,
    size BIGINT,
    type TEXT,
    path TEXT,
    status TEXT,
    description TEXT
);

-- 添加默认值和约束
ALTER TABLE documents 
    ALTER COLUMN status SET DEFAULT 'draft',
    ALTER COLUMN created_at SET DEFAULT CURRENT_TIMESTAMP;

-- 创建索引以提高查询性能
CREATE INDEX idx_documents_name ON documents(name);
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_documents_status ON documents(status);

-- 插入测试数据到 documents 表
INSERT INTO documents (
    name, 
    type, 
    status, 
    description, 
    path, 
    size, 
    created_at
) VALUES 
-- 文档类型测试数据
(
    'Project Proposal', 
    'document', 
    'active', 
    'Initial project proposal document', 
    'https://tkcrnfgnspvtzwbbvyfv.supabase.co/storage/v1/object/public/documents/Project_Proposal.pdf', 
    1024000, 
    CURRENT_TIMESTAMP
),
(
    'Meeting Minutes', 
    'document', 
    'draft', 
    'Team weekly meeting notes', 
    'https://tkcrnfgnspvtzwbbvyfv.supabase.co/storage/v1/object/public/documents/Meeting_Minutes.docx', 
    512000, 
    CURRENT_TIMESTAMP - INTERVAL '1 day'
),
-- 截图类型测试数据
(
    'System Dashboard', 
    'screenshot', 
    'active', 
    'Dashboard performance screenshot', 
    'https://tkcrnfgnspvtzwbbvyfv.supabase.co/storage/v1/object/public/screenshots/Dashboard_Performance.png', 
    204800, 
    CURRENT_TIMESTAMP - INTERVAL '2 days'
),
(
    'Error Log', 
    'screenshot', 
    'archived', 
    'System error log screenshot', 
    'https://tkcrnfgnspvtzwbbvyfv.supabase.co/storage/v1/object/public/screenshots/Error_Log.jpg', 
    102400, 
    CURRENT_TIMESTAMP - INTERVAL '3 days'
),
-- 混合类型测试数据
(
    'User Guide', 
    'mixed', 
    'draft', 
    'Comprehensive user guide with screenshots and text', 
    'https://tkcrnfgnspvtzwbbvyfv.supabase.co/storage/v1/object/public/documents/User_Guide.pdf', 
    2048000, 
    CURRENT_TIMESTAMP - INTERVAL '4 days'
);

-- 验证插入的数据
SELECT * FROM documents;
