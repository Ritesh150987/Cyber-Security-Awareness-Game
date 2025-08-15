const totalHearts = 5;
let hearts = totalHearts;
let currentIndex = 0;
let timeOfDay = 0;
let day = 1;
const timeSlots = ['Morning', 'Afternoon', 'Evening', 'Night'];
let allScenarios = [];
let scenarios = [];
let timerDuration = 0;
let timerInterval;
let difficultyMode = "Normal";
let correctStreak = 0;
let realLifeMode = false;
let isVolumeOn = true;

function playButtonSound() {
  const snd = document.getElementById('buttonSound');
  if (snd && !snd.muted) {
    snd.currentTime = 0;
    snd.play();
  }
}
function playWinSound() {
  const snd = document.getElementById('winSound');
  if (snd && !snd.muted) {
    snd.currentTime = 0;
    snd.play();
  }
}
function playLoseSound() {
  const snd = document.getElementById('loseSound');
  if (snd && !snd.muted) {
    snd.currentTime = 0;
    snd.play();
  }
}
function playGainHeartSound() {
  const snd = document.getElementById('gainHeartSound');
  if (snd && !snd.muted) {
    snd.currentTime = 0;
    snd.play();
  }
}
function playLoseHeartSound() {
  const snd = document.getElementById('loseHeartSound');
  if (snd && !snd.muted) {
    snd.currentTime = 0;
    snd.volume = 0.1;
    snd.play();
  }
}

function toggleVolume() {
  isVolumeOn = !isVolumeOn;
  updateVolumeIcon();
  const audios = document.querySelectorAll('audio');
  audios.forEach(audio => {
    audio.muted = !isVolumeOn;
  });
}
function updateVolumeIcon() {
  const btn = document.getElementById('volumeToggle');
  if (!btn) return;
  btn.textContent = isVolumeOn ? "🔊" : "🔇";
  btn.title = isVolumeOn ? "Mute" : "Unmute";
}

function renderHearts() {
  const heartDiv = document.getElementById('hearts');
  heartDiv.innerHTML = '';
  for (let i = 0; i < hearts; i++) {
    const span = document.createElement('span');
    span.className = 'heart';
    span.textContent = '❤️';
    heartDiv.appendChild(span);
  }
}
function animateLoseHeart(callback) {
  const heartDiv = document.getElementById('hearts');
  const heartsList = heartDiv.querySelectorAll('.heart');
  const lastHeart = heartsList[heartsList.length - 1];
  if (lastHeart) {
    lastHeart.classList.add('heart-fadeout');
    setTimeout(() => {
      lastHeart.remove();
      if (callback) callback();
    }, 400);
  } else if (callback) callback();
}
function animateGainHeart() {
  const heartDiv = document.getElementById('hearts');
  const span = document.createElement('span');
  span.className = 'heart heart-fadein';
  span.textContent = '❤️';
  heartDiv.appendChild(span);
  setTimeout(() => {
    span.classList.remove('heart-fadein');
  }, 400);
}

function showDayOverlay(dayNum, callback) {
  const overlay = document.getElementById('dayOverlay');
  const inner = document.getElementById('dayOverlayInner');
  inner.innerHTML = `
    <span class='label'>Welcome to</span>
    <span class='big-num'>Day ${dayNum}</span>
  `;
  overlay.style.display = 'flex';
  setTimeout(() => {
    overlay.style.display = 'none';
    if (callback) callback();
  }, 1000);
}

function showDifficultyMenu() {
  document.getElementById('startMenu').style.display = 'none';
  document.getElementById('difficultyMenu').style.display = 'block';
}
function startGame(difficulty) {
  document.getElementById('difficultyMenu').style.display = 'none';
  realLifeMode = (difficulty === 'RealLife');

  if (realLifeMode) {
    difficultyMode = 'Real Life';
  } else if (difficulty === 'Easy') {
    timerDuration = 15;
    difficultyMode = "Easy";
  } else if (difficulty === 'Normal') {
    timerDuration = 10;
    difficultyMode = "Normal";
  } else if (difficulty === 'Hard') {
    timerDuration = 5;
    difficultyMode = "Hard";
  } else {
    timerDuration = 10;
    difficultyMode = "Normal";
  }

  fetch('phishing_scenarios.json')
    .then(response => response.json())
    .then(data => {
      allScenarios = data.map(s => ({
        text: s.text,
        correct: s.correct,
        explanation: s.explanation
      }));
      beginGame();
    })
    .catch(() => {
      alert("Couldn't load game data. Please try again.");
    });
}
function beginGame() {
  document.getElementById('startMenu').style.display = 'none';
  document.getElementById('difficultyMenu').style.display = 'none';
  document.querySelector('.container').style.display = 'block';
  document.getElementById('gameOverScreen').style.display = 'none';
  document.getElementById('winScreen').style.display = 'none';
  scenarios = allScenarios.sort(() => Math.random() - 0.5).slice(0, 28);
  hearts = totalHearts;
  currentIndex = 0;
  timeOfDay = 0;
  day = 1;
  correctStreak = 0;
  document.querySelector('.buttons').style.display = 'block';
  showDayOverlay(day, updateUI);
}

function updateUI() {
  clearInterval(timerInterval);
  if (realLifeMode) {
    const options = [5, 10, 15];
    timerDuration = options[Math.floor(Math.random() * options.length)];
    document.getElementById('timer').style.display = 'none';
  } else {
    document.getElementById('timer').style.display = 'block';
  }
  const scenario = scenarios[currentIndex];
  document.getElementById('difficulty').innerText = `Difficulty: ${difficultyMode}`;
  document.getElementById('dayTime').innerText = `Day ${day} - ${timeSlots[timeOfDay]}`;
  renderHearts();
  document.getElementById('scenario').innerText = scenario.text;
  document.getElementById('feedback').innerText = '';
  document.getElementById('nextBtn').style.display = 'none';
  let timeLeft = timerDuration;
  document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
  timerInterval = setInterval(() => {
    timeLeft--;
    if (!realLifeMode) {
      document.getElementById('timer').innerText = `Time left: ${timeLeft}s`;
    }
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      handleTimeout();
    }
  }, 1000);
}
function handleChoice(choice) {
  clearInterval(timerInterval);
  const scenario = scenarios[currentIndex];
  let correct = choice.trim().toLowerCase() === scenario.correct.trim().toLowerCase();
  if (correct) {
    correctStreak++;
    let streakNeeded = 3;
    if (difficultyMode === 'Normal') streakNeeded = 5;
    if (difficultyMode === 'Hard') streakNeeded = 7;
    if (difficultyMode === 'Real Life') streakNeeded = 4;
    if (correctStreak >= streakNeeded && hearts < totalHearts) {
      hearts++;
      correctStreak = 0;
      document.getElementById('feedback').innerText = `✅ Correct! ${scenario.explanation} (+1 ❤️)`;
      animateGainHeart();
      playGainHeartSound();
    } else {
      document.getElementById('feedback').innerText = `✅ Correct! ${scenario.explanation}`;
    }
  } else {
    correctStreak = 0;
    playLoseHeartSound();
    animateLoseHeart(() => {
      hearts--;
      if (hearts <= 0) {
        document.getElementById('timer').innerText = "";
        document.querySelector('.container').style.display = 'none';
        document.getElementById('gameOverScreen').style.display = 'block';
        playLoseSound();
        return;
      }
    });
    document.getElementById('feedback').innerText = `❌ Wrong! ${scenario.explanation}`;
    document.querySelector('.buttons').style.display = 'none';
    document.getElementById('nextBtn').style.display = 'inline-block';
    return;
  }
  document.querySelector('.buttons').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'inline-block';
}
function handleTimeout() {
  correctStreak = 0;
  playLoseHeartSound();
  animateLoseHeart(() => {
    hearts--;
    if (hearts <= 0) {
      document.getElementById('timer').innerText = "";
      document.querySelector('.container').style.display = 'none';
      document.getElementById('gameOverScreen').style.display = 'block';
      playLoseSound();
      return;
    }
  });
  document.getElementById('feedback').innerText = `⏰ Time's up! ${scenarios[currentIndex].explanation}`;
  document.querySelector('.buttons').style.display = 'none';
  document.getElementById('nextBtn').style.display = 'inline-block';
}
function nextScenario() {
  currentIndex++;
  timeOfDay++;
  if (timeOfDay >= 4) {
    timeOfDay = 0;
    day++;
    if (currentIndex < scenarios.length) {
      showDayOverlay(day, () => {
        document.querySelector('.buttons').style.display = 'block';
        updateUI();
      });
    } else {
      clearInterval(timerInterval);
      document.getElementById('timer').innerText = "";
      document.querySelector('.container').style.display = 'none';
      document.getElementById('winScreen').style.display = 'block';
      playWinSound();
    }
  } else {
    if (currentIndex < scenarios.length) {
      document.querySelector('.buttons').style.display = 'block';
      updateUI();
    } else {
      clearInterval(timerInterval);
      document.getElementById('timer').innerText = "";
      document.querySelector('.container').style.display = 'none';
      document.getElementById('winScreen').style.display = 'block';
      playWinSound();
    }
  }
}
function goToMenu() {
  clearInterval(timerInterval);
  document.getElementById('startMenu').style.display = 'block';
  document.getElementById('difficultyMenu').style.display = 'none';
  document.querySelector('.container').style.display = 'none';
  document.getElementById('gameOverScreen').style.display = 'none';
  document.getElementById('winScreen').style.display = 'none';
}
function quitGame() {
  window.open('', '_self').close();
}
function updateDarkModeButton() {
  const btn = document.getElementById('darkModeToggle');
  if (!btn) return;
  if (document.body.classList.contains('dark-mode')) {
    btn.textContent = "🌜";    
  } else {
    btn.textContent = "🌞";
  }
}
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  if (document.body.classList.contains('dark-mode')) {
    localStorage.setItem('darkMode', 'enabled');
  } else {
    localStorage.setItem('darkMode', 'disabled');
  }
  updateDarkModeButton();
}



