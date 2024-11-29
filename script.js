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

const messageElement = document.getElementById('message');

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
let myChart;
let player;
let animationInterval;

const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const catMessages = {
    study: [
      "😻u got this!",
      "almost done yayayay😽",
      "😿thug it out",
      "lock in timee🐱"
    ],
    rest: [
      "fat nap time🛌",
      "😾go back to work",
      "bro what r u doing😼",
      "🍪i want crumbl"
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

document.addEventListener('DOMContentLoaded', () => {
    window.scrollTo(0, 0);
});

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
        startAnimating();
        timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
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
        clearInterval(timerId);
        timerId = null;
        startButton.textContent = 'Start';
        stopAnimating();
    }
}

function resetTimer() {
    stopAnimating();
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

function animateMessage() {
    const message = getRandomMessage(isStudyTime ? 'study' : 'rest');
    const randomX = Math.random() * (window.innerWidth - 200);
    const randomY = -1 * Math.random() * (window.innerHeight - 200);

    messageElement.style.left = `${randomX}px`;
    messageElement.style.transform = 'translateY(0)';
    messageElement.textContent = message;

    setTimeout(() => {
        messageElement.style.transform =  `translateY(${randomY}px)`;
    }, 100);

    setTimeout(() => {
        messageElement.style.transform = 'translateY(0)';
    }, 2500);
}

function startAnimating() {
    if (!animationInterval) {
        animateMessage();
        animationInterval = setInterval(animateMessage, 10000);
    }
}

function stopAnimating() {
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
        messageElement.style.transform = 'translateY(0)';
    }
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
        localStorage.setItem('playAlarm', true);
        localStorage.setItem('playSound', true);
        playSound = true;
        playAlarm = true;
    }
});

function resetAllTimer(){
    stopAnimating();
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

let todoTexts;
//spin wheel
function updateWheel() {
    const todos = Array.from(todoList.children).filter(todo => !todo.classList.contains('completed'));
    todoTexts = todos.map(todo => todo.textContent.replace('×', '').trim());
    spinBtn.disabled = false;
    console.log(todoTexts);
    if (todoTexts.length === 0) {
        spinBtn.disabled = true;
        finalValue.innerHTML = "<p>Add some todos first!</p>";
        return;
    } else {
        finalValue.innerHTML = "<p>Click spin!</p>";
    }

    const data = {
        labels: todoTexts,
        datasets: [{
            backgroundColor: todoTexts.map((_, index) => index % 2 === 0 ? "#ffcad4" : "#ffd4d4"),
            data: todoTexts.map(() => 1),
        }]
    };

    if (myChart) myChart.destroy();
    myChart = new Chart(wheel, {
        plugins: [ChartDataLabels],
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            plugins: {
                tooltip: false,
                legend: {
                    display: false,
                },
                datalabels: {
                    color: "#4a4a4a",
                    formatter: (_, context) => {
                        const label = context.chart.data.labels[context.dataIndex];
                        return label.length > 8 ? label.substr(0, 8) + '...' : label;
                    },
                    font: { size: 20, family: 'Kiddosy' }
                }
            },
            animation: { duration: 0 },
            rotation: 90
        }
    });
}

function spin() {
    const degrees = 1800 + (Math.floor((Math.random() * 350))+10);
    console.log("degrees " + (degrees-1800));
    let rotation = 90;
    let speed = 101;
    let speed2 = 20;
    spinBtn.disabled = true;
    finalValue.innerHTML = `<p>Picking a todo...</p>`;
    function animate() {
        if (rotation < 1800){
            rotation += speed;
            speed = Math.max(30, speed - 5); // Won't go below 5
        } else {
            rotation += speed2;
            speed2 = Math.max(2, speed2 - 1); // Won't go below 0.5
        }
        myChart.options.rotation = rotation;
        myChart.update();

        if (rotation < degrees + 90) {
            requestAnimationFrame(animate);
        } else {
            // Shifted the index calculation by adding items.length/2 to move winner to right
            const winner = todoTexts[Math.floor((360 - ((rotation-90) % 360)) / (360 / todoTexts.length)) % todoTexts.length];
            finalValue.innerHTML = 'Selected: <span class="highlight">' + winner + '</span>';
            spinBtn.disabled = false;
        }
    }
    animate();
}

spinBtn.addEventListener("click", () => {
    spin();
});
/*
function updateWheel() {
    const todos = Array.from(todoList.children).filter(todo => !todo.classList.contains('completed'));
    const todoTexts = todos.map(todo => todo.textContent.replace('×', '').trim());
    
    if (todos.length === 0) {
        spinBtn.disabled = true;
        finalValue.innerHTML = "<p>Add some todos first!</p>";
        return;
    } else {
        finalValue.innerHTML = "<p>Click spin!</p>";
    }

    spinBtn.disabled = false;
    segmentSize = 360 / todoTexts.length;
    
    // Adjust rotation values to make right side the winner
    const rotationValues = todoTexts.map((_, index) => ({
        minDegree: (index * segmentSize + 90) % 360,
        maxDegree: ((index + 1) * segmentSize + 90) % 360,
        value: todoTexts[index]
    }));

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(wheel, {
        plugins: [ChartDataLabels],
        type: "pie",
        data: {
            labels: todoTexts,
            datasets: [{
                backgroundColor: todoTexts.map((_, index) => index % 2 === 0 ? "#ffcad4" : "#ffd4d4"),
                data: new Array(todoTexts.length).fill(1)
            }]
        },
        options: {
            responsive: true,
            animation: { duration: 0 },
            rotation: 90, // Start with right side as winner
            plugins: {
                tooltip: false,
                legend: {
                    display: false,
                },
                datalabels: {
                    color: "#4a4a4a",
                    formatter: (_, context) => {
                        const label = context.chart.data.labels[context.dataIndex];
                        return label.length > 8 ? label.substr(0, 8) + '...' : label;
                    },
                    font: { size: 20, family: 'Kiddosy' }
                }
            }
        }
    });
    return rotationValues;
}

function valueGenerator(angleValue, rotationValues) {
    // Adjust angle value to account for 90-degree offset
    const adjustedAngle = (angleValue + 270) % 360;
    for (let i of rotationValues) {
        if (adjustedAngle >= i.minDegree && adjustedAngle < i.maxDegree) {
            finalValue.innerHTML = `<p>Do this: ${i.value}</p>`;
            spinBtn.disabled = false;
            break;
        }
    }
}

let count = 0;
let resultValue = 101;

spinBtn.addEventListener("click", () => {
    const rotationValues = updateWheel();
    if (!rotationValues) return;
    
    spinBtn.disabled = true;
    finalValue.innerHTML = `<p>Picking a todo...</p>`;
    let randomDegree = Math.floor(Math.random() * (350) + 10);
    
    let rotationInterval = window.setInterval(() => {
        myChart.options.rotation = myChart.options.rotation + resultValue;
        myChart.update();
        
        if (myChart.options.rotation >= 360) {
            count += 1;
            resultValue -= 5;
            myChart.options.rotation = (myChart.options.rotation) % 360;
        } else if (count > 15 && myChart.options.rotation == randomDegree) {
            valueGenerator(randomDegree, rotationValues);
            clearInterval(rotationInterval);
            count = 0;
            resultValue = 101;
        }
    }, 10);
});*/
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