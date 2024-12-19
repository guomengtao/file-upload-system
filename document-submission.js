(function() {
    // Supabase配置
    const SUPABASE_URL = 'https://tkcrnfgnspvtzwbbvyfv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRrY3JuZmduc3B2dHp3YmJ2eWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA5ODgwMTgsImV4cCI6MjA0NjU2NDAxOH0.o4kZY3X0XxcpM3OHO3yw7O3of2PPtXdQ4CBFgp3CMO8';
    let supabase = null;

    // 确保Supabase正确初始化
    function initSupabase() {
        if (!window.supabase) {
            console.error('Supabase library not loaded');
            return null;
        }
        return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }

    // DOM元素
    let documentSubmissionForm = null;
    let successMessage = null;
    let errorMessage = null;
    let errorMessageText = null;
    let documentFile = null;

    // 显示错误消息
    function showErrorMessage(message) {
        if (errorMessageText) {
            errorMessageText.textContent = message;
        }
        if (errorMessage) {
            errorMessage.style.display = 'block';
        }
        console.error(message);
    }

    // 显示成功消息
    function showSuccessMessage(message) {
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
        }
        
        // 自动隐藏成功消息
        setTimeout(() => {
            if (successMessage) {
                successMessage.style.display = 'none';
            }
        }, 5000);
    }

    // 准备文档数据（支持所有字段可空）
    function prepareDocumentData(formData) {
        return {
            name: formData.name || null,
            type: formData.type || null,
            description: formData.description || null,
            path: formData.path || null,
            status: formData.status || 'draft',
            size: formData.size || 0,
            created_at: formData.created_at || new Date().toISOString()
        };
    }

    // 提交文档处理
    async function handleSubmit(event) {
        // 阻止默认表单提交行为
        event.preventDefault();
        event.stopPropagation();

        // 重置消息
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';

        // 重新初始化Supabase
        supabase = initSupabase();
        if (!supabase) {
            showErrorMessage('Supabase initialization failed');
            return;
        }

        // 安全地获取元素
        const documentNameEl = document.getElementById('documentName');
        const documentTypeEl = document.getElementById('documentType');
        const documentDescriptionEl = document.getElementById('documentDescription');
        const documentPagesEl = document.getElementById('documentPages');
        const documentFileEl = document.getElementById('documentFile');

        try {
            // 收集表单数据（允许为空）
            const documentData = {
                name: documentNameEl ? documentNameEl.value.trim() : null,
                type: documentTypeEl ? documentTypeEl.value : null,
                description: documentDescriptionEl ? documentDescriptionEl.value.trim() : null,
                size: documentFileEl && documentFileEl.files[0] ? documentFileEl.files[0].size : 0,
                status: 'draft',
                path: null,
                created_at: new Date().toISOString()
            };

            // 处理文件上传（可选）
            if (documentFileEl && documentFileEl.files.length > 0) {
                const file = documentFileEl.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = documentData.name 
                    ? `${documentData.name}.${fileExt}` 
                    : `document_${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // 上传文件到Supabase存储
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('documents')
                    .upload(filePath, file);

                if (!uploadError) {
                    // 获取文件URL
                    const { data: urlData } = supabase.storage
                        .from('documents')
                        .getPublicUrl(filePath);

                    documentData.path = urlData.publicUrl;
                }
            }

            // 插入文档数据到Supabase
            const { data, error } = await supabase
                .from('documents')
                .insert(prepareDocumentData(documentData));

            if (error) {
                throw error;
            }

            // 显示成功消息
            showSuccessMessage('Document submitted successfully!');

            // 重置表单
            if (documentSubmissionForm) {
                documentSubmissionForm.reset();
            }

        } catch (error) {
            // 显示错误消息
            showErrorMessage(error.message || 'An unexpected error occurred');
        }
    }

    // 测试表单处理
    async function handleTestSubmit(event) {
        event.preventDefault();
        const testInput = document.getElementById('testInput');
        const testResult = document.getElementById('testResult');
        
        // 重新初始化Supabase
        supabase = initSupabase();
        if (!supabase) {
            testResult.innerHTML = `
                <div class="alert alert-danger">
                    Supabase initialization failed
                </div>
            `;
            console.error('Supabase initialization failed');
            return;
        }

        const inputValue = testInput.value.trim();
        
        try {
            // 准备要插入的数据（所有字段可空）
            const testData = {
                name: inputValue ? `Test Document-${inputValue}` : null,
                type: 'test',
                description: inputValue || null,
                status: 'draft',
                path: null,
                size: 0,
                created_at: new Date().toISOString()
            };

            // 插入数据到Supabase
            const { data, error } = await supabase
                .from('documents')
                .insert(testData);

            if (error) {
                throw error;
            }

            // 成功处理
            testResult.innerHTML = `
                <div class="alert alert-success">
                    Test successful: Data submitted to Supabase
                </div>
            `;
            console.log('Test data submitted successfully:', data);
            
            // 清空输入框
            testInput.value = '';

        } catch (error) {
            // 错误处理
            testResult.innerHTML = `
                <div class="alert alert-danger">
                    Submission failed: ${error.message}
                </div>
            `;
            console.error('Test data submission error:', error);
        }
    }

    // 初始化测试表单
    function initTestForm() {
        const testForm = document.getElementById('testForm');
        if (testForm) {
            testForm.addEventListener('submit', handleTestSubmit);
        }
    }

    // 页面加载时初始化
    document.addEventListener('DOMContentLoaded', () => {
        // 确保Supabase脚本已加载
        if (window.supabase) {
            // 获取表单元素
            documentSubmissionForm = document.getElementById('documentSubmissionForm');
            successMessage = document.getElementById('successMessage');
            errorMessage = document.getElementById('errorMessage');
            errorMessageText = document.getElementById('errorMessageText');

            // 添加提交事件监听器
            if (documentSubmissionForm) {
                documentSubmissionForm.addEventListener('submit', handleSubmit);
            }
            initTestForm();
        } else {
            console.error('Supabase script not loaded');
        }
    });
})();
