document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const prioritySelect = document.getElementById('prioritySelect');
    const taskList = document.getElementById('taskList');
    const addTaskButton = document.getElementById('addTaskButton');
    const toggleModeButton = document.getElementById('toggleMode');
    const filterButtons = {
        all: document.getElementById('filterAll'),
        completed: document.getElementById('filterCompleted'),
        pending: document.getElementById('filterPending')
    };
    const clearCompletedButton = document.getElementById('clearCompleted');

    let darkMode = false;

    // Load tasks from localStorage on page load
    loadTasks();

    // Event Listeners
    addTaskButton.addEventListener('click', () => addTask());
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    toggleModeButton.addEventListener('click', toggleDarkMode);
    filterButtons.all.addEventListener('click', () => filterTasks('all'));
    filterButtons.completed.addEventListener('click', () => filterTasks('completed'));
    filterButtons.pending.addEventListener('click', () => filterTasks('pending'));
    clearCompletedButton.addEventListener('click', clearCompletedTasks);

    function addTask() {
        const taskText = taskInput.value.trim();
        const dueDate = dueDateInput.value;
        const priority = prioritySelect.value;

        if (taskText === '') {
            alert('Please enter a task.');
            return;
        }

        const task = {
            text: taskText,
            dueDate: dueDate,
            priority: priority,
            completed: false
        };

        const listItem = createTaskElement(task);
        taskList.appendChild(listItem);

        taskInput.value = '';
        dueDateInput.value = '';

        saveTasks();
    }

    function createTaskElement(task) {
        const listItem = document.createElement('li');
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

        listItem.className = `list-group-item fade-in ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''} ${task.priority}-priority`;
        listItem.innerHTML = `
            <span>${task.text} <small class="text-muted">${task.dueDate ? 'Due: ' + task.dueDate : ''}</small></span>
            <div>
                <button class="btn btn-success btn-sm completeBtn">Complete</button>
                <button class="btn btn-warning btn-sm editBtn">Edit</button>
                <button class="btn btn-danger btn-sm deleteBtn">Delete</button>
            </div>
        `;

        listItem.querySelector('.completeBtn').addEventListener('click', () => {
            listItem.classList.toggle('completed');
            saveTasks();
        });

        listItem.querySelector('.editBtn').addEventListener('click', () => editTask(listItem));

        listItem.querySelector('.deleteBtn').addEventListener('click', () => {
            taskList.removeChild(listItem);
            saveTasks();
        });

        return listItem;
    }

    function editTask(listItem) {
        const taskTextElement = listItem.querySelector('span');
        const currentText = taskTextElement.textContent;

        taskTextElement.innerHTML = `<input type="text" class="form-control" value="${currentText}">`;
        const inputField = taskTextElement.querySelector('input');

        inputField.focus();

        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                taskTextElement.textContent = inputField.value.trim();
                saveTasks();
            }
        });

        inputField.addEventListener('blur', () => {
            taskTextElement.textContent = inputField.value.trim();
            saveTasks();
        });
    }

    function toggleDarkMode() {
        darkMode = !darkMode;
        document.body.classList.toggle('dark-mode');
        document.querySelector('.card').classList.toggle('dark-mode');
        saveTasks();
    }

    function filterTasks(status) {
        const tasks = taskList.children;
        Array.from(tasks).forEach(task => {
            task.style.display = 'flex';

            if (status === 'completed' && !task.classList.contains('completed')) {
                task.style.display = 'none';
            } else if (status === 'pending' && task.classList.contains('completed')) {
                task.style.display = 'none';
            }
        });
    }

    function clearCompletedTasks() {
        const tasks = taskList.children;
        Array.from(tasks).forEach(task => {
            if (task.classList.contains('completed')) {
                taskList.removeChild(task);
            }
        });
        saveTasks();
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(item => {
            tasks.push({
                text: item.querySelector('span').textContent.trim(),
                completed: item.classList.contains('completed'),
                dueDate: item.querySelector('small') ? item.querySelector('small').textContent.replace('Due: ', '') : '',
                priority: item.classList.contains('low-priority') ? 'low' : item.classList.contains('medium-priority') ? 'medium' : 'high'
            });
        });

        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

        savedTasks.forEach(task => {
            const listItem = createTaskElement(task);
            taskList.appendChild(listItem);
        });
    }
});
