// Task Manager App - ES6+ JavaScript

class TaskManager {
    constructor() {
        // DOM Elements
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.dueDateInput = document.getElementById('dueDateInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.tasksList = document.getElementById('tasksList');
        this.searchInput = document.getElementById('searchInput');
        this.clearSearchBtn = document.getElementById('clearSearchBtn');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.dateFilterBtns = document.querySelectorAll('.date-filter-btn');
        this.customRangeToggle = document.getElementById('customRangeToggle');
        this.dateRangePicker = document.querySelector('.date-range-picker');
        this.dateRangeStart = document.getElementById('dateRangeStart');
        this.dateRangeEnd = document.getElementById('dateRangeEnd');
        this.clearDateRangeBtn = document.getElementById('clearDateRangeBtn');
        this.downloadBtn = document.querySelector('.download-btn');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.helpOverlay = document.getElementById('helpOverlay');
        this.closeHelpBtn = document.getElementById('closeHelpBtn');
        this.editOverlay = document.getElementById('editOverlay');
        this.editForm = document.getElementById('editForm');
        this.closeEditBtn = document.getElementById('closeEditBtn');
        this.cancelEditBtn = document.getElementById('cancelEditBtn');
        this.editTaskInput = document.getElementById('editTaskInput');
        this.editPrioritySelect = document.getElementById('editPrioritySelect');
        this.editDueDateInput = document.getElementById('editDueDateInput');
        this.completedCount = document.getElementById('completedCount');
        this.totalCount = document.getElementById('totalCount');

        // State
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentDateFilter = 'all-dates';
        this.dateRange = { start: null, end: null };
        this.searchQuery = '';
        this.editingTaskId = null;
        this.storageKey = 'taskManagerData';
        this.themeKey = 'taskManagerTheme';
        
        this.themes = [
            { id: 'dark', icon: '🌙', className: '' },
            { id: 'light', icon: '☀️', className: 'light-mode' },
            { id: 'dracula', icon: '🧛', className: 'dracula-mode' },
            { id: 'ocean', icon: '🌊', className: 'ocean-mode' },
            { id: 'forest', icon: '🌲', className: 'forest-mode' },
            { id: 'sunset', icon: '🌅', className: 'sunset-mode' },
            { id: 'cyberpunk', icon: '🤖', className: 'cyberpunk-mode' },
            { id: 'nature', icon: '🏔️', className: 'wallpaper-nature' },
            { id: 'space', icon: '🚀', className: 'wallpaper-space' },
            { id: 'city', icon: '🏙️', className: 'wallpaper-city' },
            { id: 'abstract', icon: '🎨', className: 'wallpaper-abstract' },
            { id: 'beach', icon: '🏖️', className: 'wallpaper-beach' }
        ];
        this.currentThemeIndex = 0;

        // Initialize
        this.init();
    }

    init() {
        this.loadTheme();
        this.loadTasks();
        this.attachEventListeners();
        this.render();
    }

    attachEventListeners() {
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.clearSearchBtn.style.display = this.searchQuery ? 'block' : 'none';
            this.render();
        });

        this.clearSearchBtn.addEventListener('click', () => {
            this.searchInput.value = '';
            this.searchQuery = '';
            this.clearSearchBtn.style.display = 'none';
            this.render();
        });

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.render();
            });
        });

        // Date filter buttons
        this.dateFilterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.dateFilterBtns.forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentDateFilter = e.target.dataset.dateFilter;
                this.dateRange = { start: null, end: null };
                this.dateRangePicker.style.display = 'none';
                this.customRangeToggle.classList.remove('active');
                this.dateRangeStart.value = '';
                this.dateRangeEnd.value = '';
                this.render();
            });
        });

        // Custom date range
        this.customRangeToggle.addEventListener('click', (e) => {
            const isVisible = this.dateRangePicker.style.display !== 'none';
            if (isVisible) {
                this.dateRangePicker.style.display = 'none';
                this.customRangeToggle.classList.remove('active');
                this.dateRange = { start: null, end: null };
                this.dateRangeStart.value = '';
                this.dateRangeEnd.value = '';
                this.currentDateFilter = 'all-dates';
                this.dateFilterBtns.forEach(btn => btn.classList.remove('active'));
                this.dateFilterBtns[0].classList.add('active');
            } else {
                this.dateRangePicker.style.display = 'flex';
                this.customRangeToggle.classList.add('active');
                this.dateFilterBtns.forEach(btn => btn.classList.remove('active'));
                this.currentDateFilter = 'custom-range';
            }
        });

        this.dateRangeStart.addEventListener('change', () => {
            this.dateRange.start = this.dateRangeStart.value;
            this.render();
        });

        this.dateRangeEnd.addEventListener('change', () => {
            this.dateRange.end = this.dateRangeEnd.value;
            this.render();
        });

        this.clearDateRangeBtn.addEventListener('click', () => {
            this.dateRange = { start: null, end: null };
            this.dateRangeStart.value = '';
            this.dateRangeEnd.value = '';
            this.dateRangePicker.style.display = 'none';
            this.customRangeToggle.classList.remove('active');
            this.currentDateFilter = 'all-dates';
            this.dateFilterBtns.forEach(btn => btn.classList.remove('active'));
            this.dateFilterBtns[0].classList.add('active');
            this.render();
        });

        this.downloadBtn.addEventListener('click', () => this.downloadTasks());
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme());
        this.closeHelpBtn.addEventListener('click', () => this.hideHelp());
        this.helpOverlay.addEventListener('click', (e) => {
            if (e.target === this.helpOverlay) this.hideHelp();
        });

        this.closeEditBtn.addEventListener('click', () => this.hideEdit());
        this.cancelEditBtn.addEventListener('click', () => this.hideEdit());
        this.editOverlay.addEventListener('click', (e) => {
            if (e.target === this.editOverlay) this.hideEdit();
        });
        this.editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEditedTask();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl+N or Cmd+N: Focus task input
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
                e.preventDefault();
                this.taskInput.focus();
            }
            // Ctrl+F or Cmd+F: Focus search input
            else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
                e.preventDefault();
                this.searchInput.focus();
            }
            // Escape: Clear filters
            else if (e.key === 'Escape') {
                this.clearFilters();
            }
            // ?: Show help overlay
            else if (e.key === '?') {
                e.preventDefault();
                this.showHelp();
            }
        });
    }

    addTask() {
        const title = this.taskInput.value.trim();
        const priority = this.prioritySelect.value;
        const dueDate = this.dueDateInput.value;

        if (!title) {
            alert('Please enter a task title');
            return;
        }

        const task = {
            id: Date.now(),
            title,
            priority,
            dueDate,
            completed: false,
            createdAt: new Date().toISOString(),
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.taskInput.value = '';
        this.prioritySelect.value = 'Medium';
        this.dueDateInput.value = '';
        this.render();
    }

    deleteTask(id) {
        const taskElement = document.querySelector(`[data-task-id="${id}"]`);
        taskElement.classList.add('deleted');
        setTimeout(() => {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.saveTasks();
            this.render();
        }, 400);
    }

    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    getFilteredAndSearchedTasks() {
        return this.tasks.filter(task => {
            const matchesFilter =
                this.currentFilter === 'all' ||
                (this.currentFilter === 'completed' && task.completed) ||
                (this.currentFilter === 'active' && !task.completed);

            const matchesSearch = task.title.toLowerCase().includes(this.searchQuery);

            const matchesDateFilter = this.matchesDateFilter(task);

            return matchesFilter && matchesSearch && matchesDateFilter;
        });
    }

    matchesDateFilter(task) {
        // If no due date is set, only match if filtering by "no-date"
        if (!task.dueDate) {
            return this.currentDateFilter === 'all-dates' || this.currentDateFilter === 'no-date';
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        switch (this.currentDateFilter) {
            case 'all-dates':
                return true;
            case 'no-date':
                return false;
            case 'overdue':
                return dueDate < today;
            case 'today':
                return dueDate.getTime() === today.getTime();
            case 'this-week':
                const weekEnd = new Date(today);
                weekEnd.setDate(weekEnd.getDate() + 6);
                return dueDate >= today && dueDate <= weekEnd;
            case 'later':
                return dueDate > today;
            case 'custom-range':
                return this.isInDateRange(dueDate);
            default:
                return true;
        }
    }

    isInDateRange(dueDate) {
        const start = this.dateRange.start ? new Date(this.dateRange.start) : null;
        const end = this.dateRange.end ? new Date(this.dateRange.end) : null;

        if (start) {
            start.setHours(0, 0, 0, 0);
            if (dueDate < start) return false;
        }

        if (end) {
            end.setHours(0, 0, 0, 0);
            if (dueDate > end) return false;
        }

        return true;
    }

    isOverdue(dueDate) {
        if (!dueDate) return false;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const due = new Date(dueDate);
        due.setHours(0, 0, 0, 0);
        return due < today;
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    render() {
        const filtered = this.getFilteredAndSearchedTasks();
        const completed = this.tasks.filter(t => t.completed).length;
        const total = this.tasks.length;

        // Update counter
        this.completedCount.textContent = completed;
        this.totalCount.textContent = total;

        if (filtered.length === 0) {
            this.tasksList.innerHTML = `
                <div class="${this.searchQuery ? 'no-match' : 'empty-state'}">
                    <p>${this.searchQuery ? '🔍 No matching tasks' : '✨ No tasks yet. Add one above to get started!'}</p>
                </div>
            `;
            return;
        }

        this.tasksList.innerHTML = filtered.map(task => this.createTaskHTML(task)).join('');
        this.attachTaskListeners();
        this.attachDragListeners();
    }

    createTaskHTML(task) {
        const isOverdue = this.isOverdue(task.dueDate);
        const formattedDate = this.formatDate(task.dueDate);

        return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}" draggable="true">
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    data-task-id="${task.id}"
                >
                <div class="task-content">
                    <div class="task-header">
                        <span class="task-title">${this.escapeHTML(task.title)}</span>
                        <span class="task-priority ${task.priority}">${task.priority}</span>
                    </div>
                    ${task.dueDate ? `
                        <div class="task-meta">
                            <span class="task-date ${isOverdue ? 'overdue' : ''}">
                                📅 ${formattedDate}${isOverdue ? ' ⚠️ OVERDUE' : ''}
                            </span>
                        </div>
                    ` : ''}
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" data-task-id="${task.id}">Edit</button>
                    <button class="task-btn delete-btn" data-task-id="${task.id}">Delete</button>
                </div>
            </div>
        `;
    }

    attachTaskListeners() {
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.toggleTask(parseInt(e.target.dataset.taskId));
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                if (confirm('Are you sure you want to delete this task?')) {
                    this.deleteTask(taskId);
                }
            });
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.showEdit(taskId);
            });
        });
    }

    attachDragListeners() {
        const taskItems = document.querySelectorAll('.task-item');
        let draggedElement = null;

        taskItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedElement = item;
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', (e) => {
                item.classList.remove('dragging');
                taskItems.forEach(task => task.classList.remove('drag-over'));
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (item !== draggedElement) {
                    item.classList.add('drag-over');
                }
            });

            item.addEventListener('dragleave', (e) => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                if (item !== draggedElement) {
                    this.reorderTasks(draggedElement, item);
                }
            });
        });
    }

    reorderTasks(draggedElement, targetElement) {
        const draggedId = parseInt(draggedElement.dataset.taskId);
        const targetId = parseInt(targetElement.dataset.taskId);

        const draggedIndex = this.tasks.findIndex(t => t.id === draggedId);
        const targetIndex = this.tasks.findIndex(t => t.id === targetId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
            const [draggedTask] = this.tasks.splice(draggedIndex, 1);
            this.tasks.splice(targetIndex, 0, draggedTask);
            this.saveTasks();
            this.render();
        }
    }

    downloadTasks() {
        if (this.tasks.length === 0) {
            alert('No tasks to download');
            return;
        }

        const today = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        let content = `📋 My Tasks - Exported on ${today}\n`;
        content += '================================\n\n';

        this.tasks.forEach(task => {
            const status = task.completed ? '✅ COMPLETED' : '○';
            const priority = `Priority: ${task.priority}`;
            const dueDate = task.dueDate ? `, Due: ${task.dueDate}` : '';
            const overdue = this.isOverdue(task.dueDate) ? ' ⚠️ OVERDUE' : '';

            content += `${status} ${this.escapeHTML(task.title)} (${priority}${dueDate})${overdue}\n`;
        });

        const completed = this.tasks.filter(t => t.completed).length;
        const total = this.tasks.length;
        content += `\nSummary: ${completed} of ${total} tasks completed`;

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
        element.setAttribute('download', `tasks-${today.replace(/\s/g, '-')}.txt`);
        element.style.display = 'none';

        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    saveTasks() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
    }

    loadTasks() {
        const saved = localStorage.getItem(this.storageKey);
        this.tasks = saved ? JSON.parse(saved) : [];
    }

    toggleTheme() {
        this.currentThemeIndex = (this.currentThemeIndex + 1) % this.themes.length;
        this.applyTheme(this.themes[this.currentThemeIndex]);
    }

    applyTheme(theme) {
        this.themes.forEach(t => {
            if (t.className) {
                document.body.classList.remove(t.className);
            }
        });
        
        if (theme.className) {
            document.body.classList.add(theme.className);
        }
        
        this.themeToggleBtn.textContent = theme.icon;
        this.themeToggleBtn.title = `Switch theme (Current: ${theme.id})`;
        localStorage.setItem(this.themeKey, theme.id);
    }

    loadTheme() {
        const savedThemeId = localStorage.getItem(this.themeKey) || 'dark';
        const index = this.themes.findIndex(t => t.id === savedThemeId);
        this.currentThemeIndex = index !== -1 ? index : 0;
        this.applyTheme(this.themes[this.currentThemeIndex]);
    }

    showHelp() {
        this.helpOverlay.style.display = 'flex';
    }

    hideHelp() {
        this.helpOverlay.style.display = 'none';
    }

    clearFilters() {
        this.filterBtns.forEach(btn => btn.classList.remove('active'));
        this.filterBtns[0].classList.add('active');
        this.currentFilter = 'all';
        
        this.dateFilterBtns.forEach(btn => btn.classList.remove('active'));
        this.dateFilterBtns[0].classList.add('active');
        this.currentDateFilter = 'all-dates';
        
        this.dateRange = { start: null, end: null };
        this.dateRangePicker.style.display = 'none';
        this.customRangeToggle.classList.remove('active');
        this.dateRangeStart.value = '';
        this.dateRangeEnd.value = '';
        
        this.render();
    }

    showEdit(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        this.editingTaskId = taskId;
        this.editTaskInput.value = task.title;
        this.editPrioritySelect.value = task.priority;
        this.editDueDateInput.value = task.dueDate || '';
        this.editOverlay.style.display = 'flex';
        this.editTaskInput.focus();
    }

    hideEdit() {
        this.editOverlay.style.display = 'none';
        this.editingTaskId = null;
        this.editForm.reset();
    }

    saveEditedTask() {
        const title = this.editTaskInput.value.trim();
        const priority = this.editPrioritySelect.value;
        const dueDate = this.editDueDateInput.value;

        if (!title) {
            alert('Please enter a task title');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.title = title;
            task.priority = priority;
            task.dueDate = dueDate;
            this.saveTasks();
            this.render();
            this.hideEdit();
        }
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
