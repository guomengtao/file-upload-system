(function() {
    // 调试日志函数
    function debugLog(message) {
        const debugOutput = document.getElementById('debugOutput');
        if (debugOutput) {
            debugOutput.textContent += message + '\n';
        }
        console.log(message);
    }

    // Supabase 配置
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';
    let supabase = null;

    // 显示错误消息
    function showError(message) {
        const errorContainer = document.getElementById('errorContainer');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.style.display = 'block';
        }
        
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        debugLog(`错误: ${message}`);
        console.error(message);
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // 创建存储桶卡片
    function createBucketCard(bucket) {
        const card = document.createElement('div');
        card.className = 'col-md-4 bucket-card';
        card.innerHTML = `
            <div class="card h-100">
                <div class="card-header">
                    <span>${bucket.name}</span>
                    <span class="badge ${bucket.public ? 'bg-success' : 'bg-secondary'} bucket-status">
                        ${bucket.public ? '公开' : '私有'}
                    </span>
                </div>
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <i class="bi bi-cloud-upload text-primary" style="font-size: 2rem;"></i>
                    </div>
                    <p class="card-text text-muted small mb-2">
                        <i class="bi bi-calendar me-2"></i>
                        创建时间：${formatDate(bucket.created_at)}
                    </p>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewBucketDetails('${bucket.name}')">
                            <i class="bi bi-eye me-1"></i>详情
                        </button>
                        <span class="text-muted small">
                            <i class="bi bi-info-circle me-1"></i>文件数量：加载中
                        </span>
                    </div>
                </div>
            </div>
        `;
        return card;
    }

    // 显示空状态
    function showEmptyState() {
        const bucketsContainer = document.getElementById('bucketsContainer');
        if (bucketsContainer) {
            bucketsContainer.innerHTML = `
                <div class="col-12 empty-state">
                    <i class="bi bi-cloud-slash empty-state-icon"></i>
                    <h3>暂无存储桶</h3>
                    <p class="text-muted">您还没有创建任何存储桶。点击 "创建存储桶" 开始使用。</p>
                    <a href="create-bucket.html" class="btn btn-primary mt-3">
                        <i class="bi bi-plus-circle"></i> 创建存储桶
                    </a>
                </div>
            `;
        }
    }

    // 初始化Supabase客户端
    function initSupabase() {
        try {
            debugLog('尝试初始化 Supabase 客户端...');
            
            if (typeof window.supabase === 'undefined') {
                throw new Error('Supabase 库未加载。请检查脚本引入。');
            }

            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            if (!client) {
                throw new Error('Supabase 客户端创建失败。');
            }

            debugLog('Supabase 客户端初始化成功');
            return client;
        } catch (error) {
            showError(`Supabase 初始化失败: ${error.message}`);
            return null;
        }
    }

    // 获取存储桶列表
    async function listBuckets() {
        try {
            const loadingSpinner = document.getElementById('loadingSpinner');
            const bucketsContainer = document.getElementById('bucketsContainer');
            const errorContainer = document.getElementById('errorContainer');
            
            if (loadingSpinner) loadingSpinner.style.display = 'block';
            if (bucketsContainer) bucketsContainer.innerHTML = '';
            if (errorContainer) errorContainer.style.display = 'none';

            debugLog('开始获取存储桶列表...');

            const { data: buckets, error } = await supabase.storage.listBuckets();

            if (loadingSpinner) loadingSpinner.style.display = 'none';

            if (error) {
                throw error;
            }

            if (!buckets || buckets.length === 0) {
                showEmptyState();
                return;
            }

            debugLog(`获取到 ${buckets.length} 个存储桶`);

            buckets.forEach(bucket => {
                const bucketCard = createBucketCard(bucket);
                bucketsContainer.appendChild(bucketCard);
            });

        } catch (error) {
            showError(`获取存储桶列表失败: ${error.message}`);
        }
    }

    // 查看存储桶详情（预留功能）
    window.viewBucketDetails = function(bucketName) {
        alert(`查看存储桶 "${bucketName}" 的详情 - 功能开发中`);
    };

    // 页面加载时初始化
    document.addEventListener('DOMContentLoaded', () => {
        debugLog('页面加载完成，开始初始化...');
        
        // 初始化Supabase
        supabase = initSupabase();
        if (!supabase) return;

        // 获取存储桶列表
        listBuckets();
    });
})();
