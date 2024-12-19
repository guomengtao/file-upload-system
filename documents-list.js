(function() {
    // Supabase配置
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // 获取文档列表
    async function fetchDocuments() {
        try {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                throw error;
            }

            renderDocuments(data);
        } catch (error) {
            console.error('获取文档列表错误:', error);
            document.getElementById('documentsTableBody').innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-danger">
                        无法加载文档列表：${error.message}
                    </td>
                </tr>
            `;
        }
    }

    // 渲染文档列表
    function renderDocuments(documents) {
        const tableBody = document.getElementById('documentsTableBody');
        tableBody.innerHTML = documents.map(doc => `
            <tr>
                <td>${doc.id}</td>
                <td>${doc.name}</td>
                <td>${doc.type}</td>
                <td>${doc.status}</td>
                <td>${new Date(doc.created_at).toLocaleString()}</td>
                <td>${doc.size} 字节</td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewDocument(${doc.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 页面加载时获取文档列表
    document.addEventListener('DOMContentLoaded', fetchDocuments);
})();
