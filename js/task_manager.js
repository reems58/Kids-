/**
 * إدارة المهام التعليمية
 * يوفر وظائف لجلب المهام، إضافة، حذف، وإعادة ترتيب المهام
 */

const TaskManager = {
    /**
     * جلب مهام طفل معين مع تفاصيل المحتوى
     */
    async getChildTasks(childId) {
        try {
            console.log('TaskManager.getChildTasks - جلب مهام الطفل:', childId);
            const response = await fetch(`../api/tasks/get_child_tasks.php?child_id=${childId}`, {
                method: 'GET',
                credentials: 'include'
            });
            
            console.log('TaskManager.getChildTasks - حالة الاستجابة:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('TaskManager.getChildTasks - خطأ في الاستجابة:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('TaskManager.getChildTasks - نتيجة JSON:', result);
            
            if (!result.success) {
                throw new Error(result.message || 'فشل جلب المهام');
            }
            
            console.log('TaskManager.getChildTasks - عدد المهام المسترجعة:', result.tasks?.length || 0);
            return result.tasks;
        } catch (error) {
            console.error('TaskManager.getChildTasks - خطأ:', error);
            throw error;
        }
    },

    /**
     * جلب كل المحتوى التعليمي
     */
    async getAllContent() {
        try {
            const response = await fetch('../api/tasks/get_all_content.php', {
                method: 'GET',
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'فشل جلب المحتوى');
            }
            
            return result.content;
        } catch (error) {
            console.error('خطأ في جلب المحتوى:', error);
            throw error;
        }
    },

    /**
     * جلب المحتوى التعليمي حسب العمر
     */
    async getContentByAge(age) {
        try {
            const url = `../api/tasks/get_content_by_age.php?age=${age}`;
            console.log('جاري طلب المحتوى من:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                credentials: 'include'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('نتيجة API للمحتوى:', result);
            
            if (!result.success) {
                throw new Error(result.message || 'فشل جلب المحتوى');
            }
            
            return result.content || [];
        } catch (error) {
            console.error('خطأ في جلب المحتوى حسب العمر:', error);
            throw error;
        }
    },

    /**
     * إضافة مهمة جديدة
     */
    async addTask(taskData) {
        try {
            console.log('TaskManager.addTask - إرسال البيانات:', taskData);
            
            const response = await fetch('../api/tasks/add_task.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(taskData)
            });
            
            console.log('TaskManager.addTask - حالة الاستجابة:', response.status, response.statusText);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('TaskManager.addTask - خطأ في الاستجابة:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            console.log('TaskManager.addTask - نتيجة JSON:', result);
            
            if (!result.success) {
                throw new Error(result.message || 'فشل إضافة المهمة');
            }
            
            return result.task;
        } catch (error) {
            console.error('TaskManager.addTask - خطأ:', error);
            throw error;
        }
    },

    /**
     * حذف مهمة
     */
    async deleteTask(taskId) {
        try {
            const response = await fetch('../api/tasks/delete_task.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ task_id: taskId })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'فشل حذف المهمة');
            }
            
            return true;
        } catch (error) {
            console.error('خطأ في حذف المهمة:', error);
            throw error;
        }
    },

    /**
     * تغيير ترتيب المهمة (للأعلى)
     */
    async moveTaskUp(taskId) {
        return await this.reorderTask(taskId, 'up');
    },

    /**
     * تغيير ترتيب المهمة (للأسفل)
     */
    async moveTaskDown(taskId) {
        return await this.reorderTask(taskId, 'down');
    },

    /**
     * تغيير ترتيب المهمة
     */
    async reorderTask(taskId, direction) {
        try {
            const response = await fetch('../api/tasks/reorder_task.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    task_id: taskId,
                    direction: direction
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'فشل تغيير ترتيب المهمة');
            }
            
            return result.task;
        } catch (error) {
            console.error('خطأ في تغيير ترتيب المهمة:', error);
            throw error;
        }
    },

    /**
     * عرض رسالة نجاح
     */
    showSuccess(message) {
        // يمكن تخصيص هذه الدالة حسب واجهة المستخدم
        console.log('✓ ' + message);
        if (typeof alert !== 'undefined') {
            alert(message);
        }
    },

    /**
     * عرض رسالة خطأ
     */
    showError(message) {
        // يمكن تخصيص هذه الدالة حسب واجهة المستخدم
        console.error('✗ ' + message);
        if (typeof alert !== 'undefined') {
            alert('خطأ: ' + message);
        }
    }
};

// تصدير للاستخدام في ملفات أخرى
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskManager;
}

