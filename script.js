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

const musicPlayer = document.getElementById('music');
const alarm = document.getElementById('alarm');
const stopAlarm = document.getElementById('stop');
const alarmSound = new Audio('sprites/alarm.wav');
const musicCross = document.querySelector('.music-no');
const bellCross = document.querySelector('.bell-no');

const resetTmr = document.getElementById('resetTimerBtn');
const resetTodo = document.getElementById('resetTodoBtn');
const resetAll = document.getElementById('resetAllBtn');

const todoValue = document.getElementById("todoInput");
const todoAlert = document.getElementById("Alert");
const listItems = document.getElementById("todoList");
const addUpdate = document.getElementById("addTodo");

const wheel = document.getElementById("wheel");
const spinBtn = document.getElementById("spin-btn");
const finalValue = document.getElementById("final-value");

let todos = JSON.parse(localStorage.getItem('todos')) || [];

let playAlarm = localStorage.getItem('playAlarm') === 'true' || true;
let play = localStorage.getItem('playSound') === 'true' || true;;
let timeLeft = 0;
let totalTime = 0;
let timerId = null;
let isStudyTime = localStorage.getItem('isStudyTime') === 'true' || true;
let sessionCount = parseInt(localStorage.getItem('sessionCount')) || 0;
let savedTimeLeft = localStorage.getItem('timeLeft') || 0;
let savedTotalTime = localStorage.getItem('totalTime') || 0;
let isStudying = false;
let myChart;
let player;

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

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

localStorage.setItem('playAlarm', playAlarm);
localStorage.setItem('playSound', play);

//initial values
updateSessionCount();
progress.style.width = 0;
studyTimeInput.value = localStorage.getItem('studyTime') || 25;
restTimeInput.value = localStorage.getItem('restTime') || 5;
localStorage.setItem('isStudyTime', isStudyTime);
timerLabel.textContent = isStudyTime ? 'Time to Study! 📚' : 'Rest Time! 😴';
musicCross.style.display = "none";
bellCross.style.display = "none";

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
    if (studyTimeInput.value == 0 || restTimeInput.value == 0 || studyTimeInput.value == null || restTimeInput.value == null) {
        timerDisplay.textContent = "include a time!";
    }
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
        if (playAlarm){alarmSound.play();}
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
    
    if (studyTimeInput.value == 0 || restTimeInput.value == 0 || studyTimeInput.value == null || restTimeInput.value == null) {
        timerDisplay.textContent = "include a time!";
    } else {
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
        myChart.destroy();
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
    setupTimer();
}

function resetTodoList() {
    todos = [];
    saveTodos();
    renderTodos();
    showAlert('Todo list has been reset!');
    updateWheel();
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
    updateWheel();
}

function deleteTodo(index) {
    todos.splice(index, 1);
    saveTodos();
    renderTodos();
    showAlert('Task deleted successfully!');
    updateWheel();
}

function toggleTodo(index) {
    todos[index].completed = !todos[index].completed;
    saveTodos();
    renderTodos();
    if (todos[index].completed) {
        // Store the todo's text for identification
        const todoText = todos[index].text;
        setTimeout(() => {
            // Find the todo by its text instead of index
            const currentIndex = todos.findIndex(todo => 
                todo.text === todoText && todo.completed
            );
            if (currentIndex !== -1) {
                todos.splice(currentIndex, 1);
                saveTodos();
                renderTodos();
                updateWheel();
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

//spin wheel
function updateWheel() {
    // Get all todos
    const todos = Array.from(todoList.children).filter(todo => !todo.classList.contains('completed'));
    const todoTexts = todos.map(todo => todo.textContent.replace('×', '').trim());

    // If there are no todos, disable spin button and show message
    if (todos.length === 0) {
        spinBtn.disabled = true;
        finalValue.innerHTML = "<p>Add some todos first!</p>";
        return;
    } else {
        finalValue.innerHTML = "<p>Click spin!</p>";
    }

    spinBtn.disabled = false;

    // Calculate rotation values based on number of todos
    const segmentSize = 360 / todoTexts.length;
    const rotationValues = todoTexts.map((_, index) => ({
        minDegree: index * segmentSize,
        maxDegree: (index + 1) * segmentSize,
        value: todoTexts[index]
    }));

    // Create alternating colors based on number of todos
    const pieColors = todoTexts.map((_, index) => 
        index % 2 === 0 ? "#ffcad4" : "#ffd4d4"
    );

    // If chart exists, destroy it before creating new one
    if (myChart) {
        myChart.destroy();
    }

    // Create new chart
    myChart = new Chart(wheel, {
        plugins: [ChartDataLabels],
        type: "pie",
        data: {
            labels: todoTexts,
            datasets: [{
                backgroundColor: pieColors,
                data: new Array(todoTexts.length).fill(1) // Equal segments
            }]
        },
        options: {
            responsive: true,
            animation: { duration: 0 },
            plugins: {
                tooltip: false,
                legend: {
                    display: false,
                },
                datalabels: {
                    color: "#4a4a4a",
                    formatter: (_, context) => {
                        const label = context.chart.data.labels[context.dataIndex];
                        // Truncate long labels
                        return label.length > 10 ? label.substr(0, 10) + '...' : label;
                    },
                    font: { size: 30, family: 'Kiddosy' }
                }
            }
        }
    });

    return rotationValues;
}

// Value generator function
function valueGenerator(angleValue, rotationValues) {
    for (let i of rotationValues) {
        if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
            finalValue.innerHTML = `<p>Do this: ${i.value}</p>`;
            spinBtn.disabled = false;
            break;
        }
    }
}

// Initialize variables for spinning
let count = 0;
let resultValue = 101;

// Spin button event listener
spinBtn.addEventListener("click", () => {
    const rotationValues = updateWheel();
    if (!rotationValues) return;

    spinBtn.disabled = true;
    finalValue.innerHTML = `<p>Picking a todo...</p>`;
    let randomDegree = Math.floor(Math.random() * (355 - 0 + 1) + 0);

    let rotationInterval = window.setInterval(() => {
        myChart.options.rotation = myChart.options.rotation + resultValue;
        myChart.update();

        if (myChart.options.rotation >= 360) {
            count += 1;
            resultValue -= 5;
            myChart.options.rotation = 0;
        } else if (count > 15 && myChart.options.rotation == randomDegree) {
            valueGenerator(randomDegree, rotationValues);
            clearInterval(rotationInterval);
            count = 0;
            resultValue = 101;
        }
    }, 10);
});

// Update wheel when removing todos
todoList.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-todo")) {
        setTimeout(updateWheel, 0);
    }
});

document.addEventListener("DOMContentLoaded", updateWheel);


//musicc
function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: '0',
        width: '0',
        videoId: 'jfKfPfyJRdk',  // Lofi Girl study beats
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'volume': 20  // Set volume to 50%
        },
        events: {
            'onReady': onPlayerReady
        }
    });
}

function onPlayerReady(event) {
    // Play/pause with timer
    player.playVideo();
}

musicPlayer.addEventListener("click", () => {
    play = !play;
    if (play) {
        player.playVideo();
        musicCross.style.display = "none";
    } else {
        player.pauseVideo();
        musicCross.style.display = "block";
    }
    localStorage.setItem('playSound', play);
});

stopAlarm.addEventListener("click", () => {
    playAlarm = !playAlarm;
    localStorage.setItem('playAlarm', playAlarm);
    if (!playAlarm) {
        bellCross.style.display = "block";
    } else {
        bellCross.style.display = "none";
    }
});

alarm.addEventListener("click", () => {
    alarmSound.pause();
    
});