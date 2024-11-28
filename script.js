const timerDisplay = document.getElementById('timerDisplay');
const timerLabel = document.getElementById('timerLabel');
const startButton = document.getElementById('startTimer');
const resetButton = document.getElementById('resetTimer');
const skipButton = document.getElementById('skipTimer');
const progress = document.getElementById('progress');
const catStatus = document.getElementById('catStatus');
const studyTimeInput = document.getElementById('studyTime');
const restTimeInput = document.getElementById('restTime');
const sessionCountDisplay = document.getElementById('sessionCount');

const resetTmr = document.getElementById('resetTimerBtn');
const resetTodo = document.getElementById('resetTodoBtn');
const resetAll = document.getElementById('resetAllBtn');

const todoValue = document.getElementById("todoInput");
const todoAlert = document.getElementById("Alert");
const listItems = document.getElementById("todoList");
const addUpdate = document.getElementById("addTodo");

let todos = JSON.parse(localStorage.getItem('todos')) || [];

let timeLeft = 0;
let totalTime = 0;
let timerId = null;
let isStudyTime = localStorage.getItem('isStudyTime') === 'true' || true;
let sessionCount = parseInt(localStorage.getItem('sessionCount')) || 0;
let savedTimeLeft = localStorage.getItem('timeLeft') || 0;
let savedTotalTime = localStorage.getItem('totalTime') || 0;
let isStudying = false;

const catMessages = {
    study: [
      "Kitty is focusing hard with you! 😺",
      "Keep it up, you're doing paw-some! 🐱",
      "Studying like a clever cat! 😸",
      "You're feline great! 😺"
    ],
    rest: [
      "Time for a cat nap! 😴",
      "Stretch like a kitty! 🐱",
      "Rest your paws! 😺",
      "Purr-fect time to relax! 😸"
    ]
};

updateSessionCount();
progress.style.width = 0;
studyTimeInput.value = localStorage.getItem('studyTime') || 25;
restTimeInput.value = localStorage.getItem('restTime') || 5;
localStorage.setItem('isStudyTime', isStudyTime);
timerLabel.textContent = isStudyTime ? 'Time to Study! 📚' : 'Rest Time! 😴';

function updateSessionCount() {
  sessionCountDisplay.textContent = sessionCount;
  localStorage.setItem('sessionCount', sessionCount);
}

function getRandomMessage(type) {
    const messages = catMessages[type];
    return messages[Math.floor(Math.random() * messages.length)];
}

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;
    progress.style.width = `${progressPercent}%`;
    
    // Save current state including progress
    localStorage.setItem('timeLeft', timeLeft);
    localStorage.setItem('totalTime', totalTime);
    localStorage.setItem('progressWidth', progress.style.width);
}

function startTimer() {
  if (timerId === null) {
    isStudying = true;
    timerId = setInterval(() => {
      timeLeft--;
      updateDisplay();
      if (timeLeft % 30 === 0) {
        catStatus.textContent = getRandomMessage(isStudyTime ? 'study' : 'rest');
      }
      if (timeLeft <= 0) {
        clearInterval(timerId);
        timerId = null;
        if (isStudyTime) {
            sessionCount++;
            updateSessionCount();
        }
        progress.style.width = 0;
        // Force a click on the start button
        startButton.click();
        toggleMode();
      }
    }, 1000);
    startButton.textContent = 'Pause';
  } else {
    isStudying = false;
    clearInterval(timerId);
    timerId = null;
    startButton.textContent = 'Start';
  }
}

function resetTimer() {
    if (isStudying){
        
    }
    progress.style.width = 0;
    saveSettings();
    clearInterval(timerId);
    timerId = null;
    localStorage.setItem('timeLeft', 0);
    localStorage.setItem('totalTime', 0);
    localStorage.setItem('progressWidth', '0%');
    startButton.textContent = 'Start';
    setupTimer();
}

function setupTimer() {
    const studyMins = parseInt(studyTimeInput.value);
    const restMins = parseInt(restTimeInput.value);
    
    // Use saved timeLeft if it exists and is not 0
    if (savedTimeLeft > 0) {
        timeLeft = parseInt(savedTimeLeft);
        totalTime = parseInt(savedTotalTime);
        // Restore progress bar
        progress.style.width = localStorage.getItem('progressWidth') || '0%';
        savedTimeLeft = 0; // Reset so it's only used on initial load
        savedTotalTime = 0;
    } else {
        timeLeft = isStudyTime ? studyMins * 60 + Math.round((studyTimeInput.value-studyMins)*60) : restMins * 60 + Math.round((restTimeInput.value-restMins)*60);
        totalTime = timeLeft;
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (studyTimeInput.value == 0 || restTimeInput.value == 0 || 
        studyTimeInput.value == null || restTimeInput.value == null) {
        timerDisplay.textContent = "include a time!";
    }
    timerLabel.textContent = isStudyTime ? 'Time to Study! 📚' : 'Rest Time! 😴';
    
    // Update status message based on current mode
    /*if (timeLeft > 0) {
        catStatus.textContent = getRandomMessage(isStudyTime ? 'study' : 'rest');
    }*/
    updateDisplay();
}

function toggleMode() {
    isStudyTime = !isStudyTime;
    localStorage.setItem('isStudyTime', isStudyTime);
    setupTimer();
}

studyTimeInput.addEventListener('change', resetTimer);
restTimeInput.addEventListener('change', resetTimer);
startButton.addEventListener('click', startTimer);
resetButton.addEventListener('click', resetTimer);
skipButton.addEventListener('click', () => {
    if (confirm('Skip current timer? 🐱')) {
        progress.style.width = 0;
        if (isStudyTime) {
            sessionCount++;
            updateSessionCount();
        }
        toggleMode();
    }
});

//reset buttons

// Event Listeners
// Timer Events
resetTmr.addEventListener('click', () => {
    if (confirm('Reset your timer settings? ⌛')) {
        resetAllTimer();
    }
});

resetTodo.addEventListener('click', () => {
    if (confirm('Reset todo list? 📝')) {
        resetTodoList();
    }
});

resetAll.addEventListener('click', () => {
    if (confirm('Reset everything? ⚠️')) {
        resetAllTimer();
        resetTodoList();
    }
});

function resetAllTimer(){
    progress.style.width = 0;
    clearInterval(timerId);
    timeLeft = 0;
    totalTime = 0;
    timerId = null;
    isStudyTime = true;
    startButton.textContent = 'Start';
    localStorage.setItem('timeLeft', 0);
    localStorage.setItem('totalTime', 0);
    localStorage.setItem('progressWidth', 0);
    localStorage.setItem('studyTime', 25);
    localStorage.setItem('restTime', 5);
    localStorage.setItem('sessionCount', 0);
    localStorage.setItem('isStudyTime', true);
    studyTimeInput.value = localStorage.getItem('studyTime');
    restTimeInput.value = localStorage.getItem('restTime');
    sessionCountDisplay.textContent = localStorage.getItem('sessionCount');
}

function resetTodoList() {
    todos = [];
    saveTodos();
    renderTodos();
    showAlert('Todo list has been reset!');
}

// Initialize
setupTimer();
updateSessionCount();
renderTodos();

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('studyTime', studyTimeInput.value);
    localStorage.setItem('restTime', restTimeInput.value);
}

function showAlert(message, isError = false) {
    alertElement.textContent = message;
    alertElement.style.color = isError ? '#ff6b6b' : '#2b7242';

    setTimeout(() => {
        alertElement.textContent = '';
    }, 5000);
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function renderTodos() {
    todoList.innerHTML = '';
    todos.forEach((todo, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (todo.completed ? ' completed' : '');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = todo.completed;
        checkbox.addEventListener('change', () => toggleTodo(index));
        
        const todoText = document.createElement('span');
        todoText.textContent = todo.text;
        todoText.addEventListener('dblclick', () => startEditing(todoText, index));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-todo';
        deleteBtn.textContent = '×';
        deleteBtn.addEventListener('click', () => deleteTodo(index));
        
        li.appendChild(checkbox);
        li.appendChild(todoText);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
    });
}

function addTodo() {
    const todoText = todoInput.value.trim();
    
    if (!todoText) {
        showAlert('Please enter a task!', true);
        return;
    }
    
    if (todos.some(todo => todo.text.toLowerCase() === todoText.toLowerCase())) {
        showAlert('This task already exists!', true);
        return;
    }
    
    todos.push({ text: todoText, completed: false });
    todoInput.value = '';
    saveTodos();
    renderTodos();
    showAlert('Task added successfully!');
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
    showAlert('Task deleted successfully!');
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
    if (todos[index].completed) {
        // Automatically delete after 3 seconds
        setTimeout(() => {
            // Check again if the task is still marked as completed before deleting
            if (todos[index]?.completed) {
                todos.splice(index, 1);
                saveTodos();
                renderTodos();
            }
        }, 1000);
    }
}

function startEditing(element, index) {
    const input = document.createElement('input');
    input.type = 'text';
    input.value = todos[index].text;
    input.className = 'edit-input';
    
    element.parentNode.replaceChild(input, element);
    input.focus();
    
    const finishEditing = () => {
        const newText = input.value.trim();
        if (newText && !todos.some((todo, i) => i !== index && todo.text.toLowerCase() === newText.toLowerCase())) {
            todos[index].text = newText;
            saveTodos();
            renderTodos();
            showAlert('Task updated successfully!');
        } else {
            renderTodos();
            if (!newText) {
                showAlert('Task cannot be empty!', true);
            } else {
                showAlert('This task already exists!', true);
            }
        }
    };
    
    input.addEventListener('blur', finishEditing);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            finishEditing();
        }
    });
}

// Todo Events
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});
addTodoBtn.addEventListener('click', addTodo);