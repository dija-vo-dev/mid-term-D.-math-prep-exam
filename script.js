// ============================================================
// MAT2033 DISCRETE MATH - PRACTICE HUB LOGIC
// ============================================================

// ===== State Management =====
let state = {
    currentTopic: 'all',
    currentIndex: 0,
    filteredQuestions: [],
    score: 0,
    totalAnswered: 0,
    streak: 0,
    selectedOption: null,
    answered: false,
    hintShown: false
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    loadProgress();
    setupEventListeners();
    filterQuestions();
    renderQuestion();
    updateScoreBoard();
});

// ===== Event Listeners =====
function setupEventListeners() {
    // Topic buttons
    document.querySelectorAll('.topic-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.topic-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.currentTopic = btn.dataset.topic;
            state.currentIndex = 0;
            filterQuestions();
            renderQuestion();
        });
    });

    // Action buttons
    document.getElementById('checkBtn').addEventListener('click', checkAnswer);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('hintBtn').addEventListener('click', showHint);
    document.getElementById('resetBtn').addEventListener('click', resetProgress);
    document.getElementById('restartBtn').addEventListener('click', () => {
        state.currentIndex = 0;
        filterQuestions();
        renderQuestion();
    });
}

// ===== Filter Questions =====
function filterQuestions() {
    if (state.currentTopic === 'all') {
        state.filteredQuestions = [...QUESTIONS];
    } else {
        state.filteredQuestions = QUESTIONS.filter(q => q.topic === state.currentTopic);
    }
    updateProgress();
}

// ===== Render Question =====
function renderQuestion() {
    const card = document.getElementById('questionCard');
    const empty = document.getElementById('emptyState');

    if (state.filteredQuestions.length === 0 || state.currentIndex >= state.filteredQuestions.length) {
        card.classList.add('hidden');
        empty.classList.remove('hidden');
        return;
    }

    card.classList.remove('hidden');
    empty.classList.add('hidden');

    const q = state.filteredQuestions[state.currentIndex];

    // Reset state
    state.selectedOption = null;
    state.answered = false;
    state.hintShown = false;

    // Update header
    document.getElementById('questionTopic').textContent = q.topicName;
    document.getElementById('questionNumber').textContent = `#${state.currentIndex + 1}`;
    document.getElementById('questionText').innerHTML = q.question;

    // Hide hint and solution
    document.getElementById('hintBox').classList.add('hidden');
    document.getElementById('solutionBox').classList.add('hidden');

    // Reset buttons
    document.getElementById('checkBtn').disabled = false;
    document.getElementById('nextBtn').disabled = true;
    document.getElementById('hintBtn').disabled = false;

    // Render options based on type
    const container = document.getElementById('optionsContainer');
    container.innerHTML = '';

    if (q.type === 'mcq') {
        q.options.forEach((opt, idx) => {
            const optEl = document.createElement('div');
            optEl.className = 'option';
            optEl.dataset.index = idx;
            optEl.innerHTML = `
                <span class="option-letter">${String.fromCharCode(65 + idx)}</span>
                <span class="option-text">${opt}</span>
            `;
            optEl.addEventListener('click', () => selectOption(idx));
            container.appendChild(optEl);
        });
    } else if (q.type === 'text') {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'text-input';
        input.id = 'textInput';
        input.placeholder = 'Type your answer here...';
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !state.answered) checkAnswer();
        });
        container.appendChild(input);
        setTimeout(() => input.focus(), 100);
    }

    updateProgress();
}

// ===== Select Option (MCQ) =====
function selectOption(idx) {
    if (state.answered) return;
    state.selectedOption = idx;
    document.querySelectorAll('.option').forEach((opt, i) => {
        opt.classList.toggle('selected', i === idx);
    });
}

// ===== Check Answer =====
function checkAnswer() {
    if (state.answered) return;

    const q = state.filteredQuestions[state.currentIndex];
    let isCorrect = false;

    if (q.type === 'mcq') {
        if (state.selectedOption === null) {
            alert('Please select an answer first!');
            return;
        }
        isCorrect = state.selectedOption === q.correct;

        // Visual feedback
        document.querySelectorAll('.option').forEach((opt, i) => {
            if (i === q.correct) opt.classList.add('correct');
            else if (i === state.selectedOption && !isCorrect) opt.classList.add('incorrect');
            opt.style.pointerEvents = 'none';
        });
    } else if (q.type === 'text') {
        const input = document.getElementById('textInput');
        const userAnswer = input.value.trim();
        if (!userAnswer) {
            alert('Please enter an answer!');
            return;
        }
        isCorrect = userAnswer.toLowerCase() === String(q.correct).toLowerCase();
        input.classList.add(isCorrect ? 'correct' : 'incorrect');
        input.disabled = true;
        if (!isCorrect) {
            input.value = `${userAnswer}  →  Correct: ${q.correct}`;
        }
    }

    // Update state
    state.answered = true;
    state.totalAnswered++;
    if (isCorrect) {
        state.score++;
        state.streak++;
    } else {
        state.streak = 0;
    }

    // Show solution
    document.getElementById('solutionBox').classList.remove('hidden');
    document.getElementById('solutionText').innerHTML = q.solution;

    // Update buttons
    document.getElementById('checkBtn').disabled = true;
    document.getElementById('nextBtn').disabled = false;
    document.getElementById('hintBtn').disabled = true;

    updateScoreBoard();
    saveProgress();
}

// ===== Next Question =====
function nextQuestion() {
    state.currentIndex++;
    renderQuestion();
}

// ===== Show Hint =====
function showHint() {
    if (state.hintShown || state.answered) return;
    const q = state.filteredQuestions[state.currentIndex];
    document.getElementById('hintText').textContent = q.hint;
    document.getElementById('hintBox').classList.remove('hidden');
    state.hintShown = true;
}

// ===== Update Score Board =====
function updateScoreBoard() {
    document.getElementById('score').textContent = state.score;
    document.getElementById('streak').textContent = `${state.streak} 🔥`;
    const accuracy = state.totalAnswered > 0
        ? Math.round((state.score / state.totalAnswered) * 100)
        : 0;
    document.getElementById('accuracy').textContent = `${accuracy}%`;
}

// ===== Update Progress =====
function updateProgress() {
    const total = state.filteredQuestions.length;
    const current = Math.min(state.currentIndex + 1, total);
    const percent = total > 0 ? (current / total) * 100 : 0;

    document.getElementById('progressFill').style.width = `${percent}%`;
    document.getElementById('progressText').textContent =
        `Question ${current} of ${total}`;
}

// ===== Save/Load Progress (localStorage) =====
function saveProgress() {
    const data = {
        score: state.score,
        totalAnswered: state.totalAnswered,
        streak: state.streak
    };
    localStorage.setItem('discreteMathProgress', JSON.stringify(data));
}

function loadProgress() {
    const saved = localStorage.getItem('discreteMathProgress');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state.score = data.score || 0;
            state.totalAnswered = data.totalAnswered || 0;
            state.streak = data.streak || 0;
        } catch (e) {
            console.error('Error loading progress:', e);
        }
    }
}

function resetProgress() {
    if (confirm('Are you sure you want to reset all progress?')) {
        state.score = 0;
        state.totalAnswered = 0;
        state.streak = 0;
        state.currentIndex = 0;
        localStorage.removeItem('discreteMathProgress');
        filterQuestions();
        renderQuestion();
        updateScoreBoard();
    }
}