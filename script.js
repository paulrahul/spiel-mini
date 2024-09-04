let currentIndex = 0;
let markedQuestions = JSON.parse(localStorage.getItem('markedQuestions')) || [];
let isRevising = false;
let revisionIndex = 0;
let lastSerialIndex = 0;
const dataLength = data.length;

const SERVER = "http://localhost:5000/";
// const SERVER = "https://deutsches-spiel-408818.lm.r.appspot.com/";

document.addEventListener('DOMContentLoaded', () => {
    loadQuestion();

    window.onload = function() {
        document.getElementById('user-answer').focus();
    };

    document.getElementById('submit-answer').addEventListener('click', checkAnswer);
    document.getElementById('next-question').addEventListener('click', nextQuestion);
    document.getElementById('mark-question').addEventListener('click', markQuestion);
    document.getElementById('unmark-question').addEventListener('click', unmarkQuestion);
    document.getElementById('revise-marked').addEventListener('click', reviseMarkedQuestions);
    document.getElementById('answerForm').addEventListener('submit', function(event) {
        event.preventDefault();
        checkAnswer();
    });
    document.getElementById('question-options').addEventListener('change', function() {
        const selectedValue = this.value;

        if (selectedValue == "revise") {
            populateMarkedQuestions();
        } else if (selectedValue == "normal") {
            populateNormalQuestions();
        } else {
            currentIndex = parseInt(selectedValue);
            loadQuestion();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (document.activeElement !== document.getElementById('user-answer')) {
            event.preventDefault();
            if (event.key === 'n' || event.key === 'N') {
                // If "N" key is pressed, trigger the next question
                nextQuestion();
            } else if (event.key === 'm' || event.key === 'M') {
                // If "M" key is pressed, mark the question
                markQuestion();
            } else if (event.key === 'u' || event.key === 'U') {
                unmarkQuestion();
            } else if (event.key === 'r' || event.key === 'R') {
                reviseMarkedQuestions();
            } else if (event.key === 'd' || event.key === 'D') {
                showDetails();
            }
        }
    });    
});

function populateMarkedQuestions() {
    populateQuestions(markedQuestions);
    isRevising = true;
}

function populateNormalQuestions() {
    populateQuestions(Array.from(Array(data.length).keys()));
    isRevising = false;
}

function populateQuestions(questions) {
    const questionOptionsElement = document.getElementById('question-options');
    questionOptionsElement.options.length = 0;

    var option = document.createElement("option");
    option.text = "Wählst ein Wort aus";
    questionOptionsElement.add(option);

    option = document.createElement("option");
    option.text = "Revise Marked Questions";
    option.value = "revise";
    questionOptionsElement.add(option);

    option = document.createElement("option");
    option.text = "Normal Questions";
    option.value = "normal";
    questionOptionsElement.add(option);

    for (const question of questions) {
        const currIndex = parseInt(question);
        var currQuestion = data[currIndex];
        const questionText = currQuestion.Deutsch || currQuestion.Englisch;

        option = document.createElement("option");
        option.text = questionText;
        option.value = currIndex;
        questionOptionsElement.add(option);
    }
}

function loadQuestion() {
    const currentQuestion = data[currentIndex];
    const questionText = currentQuestion.Deutsch || currentQuestion.Englisch;
    document.getElementById('question-text').textContent = `[${currentIndex + 1}/${dataLength}] Was bedeutet ${questionText}?`;
    document.getElementById('user-answer').value = '';
    document.getElementById('question-section').style.display = 'block';
    document.getElementById('result-section').style.display = 'none';
    document.getElementById('result-detail-text').style.display = 'none';

    document.getElementById('user-answer').focus();
}

function checkAnswer() {
    const userAnswer = document.getElementById('user-answer').value.trim().toLowerCase();
    const currentQuestion = data[currentIndex];
    const questionText = currentQuestion.Deutsch || currentQuestion.Englisch;
    const validAnswers = [currentQuestion.Bedeutung.toLowerCase(), ...(currentQuestion.Synonyms.toLowerCase().split(',').map(s => s.trim()))];

    if (userAnswer.length > 0 && validAnswers.includes(userAnswer)) {
        document.getElementById('result-text').textContent = 'Correct!';
    } else {
        document.getElementById('result-text').textContent = `Incorrect! The correct answers were: ${validAnswers.join(', ')}`;
    }

    document.getElementById('result-link').href = "https://deutsches-spiel-408818.lm.r.appspot.com/lookup?wort=" + questionText;
    document.getElementById('result-link').textContent = questionText;

    document.getElementById('question-section').style.display = 'none';
    document.getElementById('result-section').style.display = 'block';
    document.getElementById('result-link').style.display = 'block';
}

function nextQuestion() {
    if (isRevising) {
        revisionIndex++;
        if (revisionIndex >= markedQuestions.length) {
            alert("All marked questions revised, switching to normal questions.");
            isRevising = false;
            currentIndex = lastSerialIndex;
            nextQuestion();
            return;
        }
        currentIndex = markedQuestions[revisionIndex];
    } else {
        currentIndex = (currentIndex + 1) % data.length;
    }
    loadQuestion();

    document.getElementById('user-answer').focus();
    document.getElementById('user-answer').value = "";
}

function markQuestion() {
    if (!markedQuestions.includes(currentIndex)) {
        markedQuestions.push(currentIndex);
        localStorage.setItem('markedQuestions', JSON.stringify(markedQuestions));
        alert('Question marked for revision!');
    } else {
        alert('This question is already marked.');
    }
}

function unmarkQuestion() {
    if (markedQuestions.includes(currentIndex)) {
        markedQuestions.pop(currentIndex);
        localStorage.setItem('markedQuestions', JSON.stringify(markedQuestions));
        alert('Question unmarked.');
    } else {
        alert("This question was not even marked, so ignored.")
    }
}

function reviseMarkedQuestions() {
    lastSerialIndex = currentIndex;

    if (markedQuestions.length === 0) {
        alert('No marked questions.');
        return;
    }

    revisionIndex = 0;
    currentIndex = markedQuestions[revisionIndex];
    isRevising = true;

    loadQuestion();
}

function showDetails() {
    const currentQuestion = data[currentIndex];
    const questionText = currentQuestion.Deutsch || currentQuestion.Englisch;

    fetch(SERVER + "lookup?wort=" + questionText + "&mode=json")
    .then(response => response.json())
    .then(data => {
        let content = '';
        const examples = data.examples;
        examples.forEach(item => {
            content += `<div>${item[0]}</div>`;
            content += `<div style="font-style: italic;">${item[1]}</div>`;
            content += `<hr>`
        });

        let examplesPara = document.getElementById('result-detail-text');
        // Set the generated content to the p tag
        examplesPara.innerHTML = content;
        examplesPara.style.display = 'block';
    });
}
