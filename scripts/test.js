const elements = {
    play : {
        screen: document.getElementById("play-screen"),
        playButton: document.getElementById("play-playButton"),
    },
    login: {
        screen: document.getElementById("login-screen"),
        loginButton: document.getElementById("login-loginButton"),
        nameInput: document.getElementById("login-nameInput")
    },
    game: {
        screen: document.getElementById("game-screen"),
        playerName: document.getElementById("game-playerName"),
        playerHealth: document.getElementById("game-playerHealth"),
        enemyName: document.getElementById("game-enemyName"),
        enemyHealth: document.getElementById("game-enemyHealth"),
        button1: document.getElementById("game-button1"),
        button2: document.getElementById("game-button2"),
        button3: document.getElementById("game-button3"),
        button4: document.getElementById("game-button4"),
        canvas: document.getElementById("game-canvas"),
        time: document.getElementById("game-time"),
        questionText: document.getElementById("game-questionText"),
    },
    instructions: {
        screen: document.getElementById("instructions-screen"),
        startGameButton: document.getElementById("instructions-startGameButton")
    },
    highscores: {
        screen: document.getElementById("highscores-screen"),
        restartButton: document.getElementById("highscores-restartButton"),
        scores: document.getElementById("highscores-scores"),
    }
}

const screens = {
    playScreen: elements.play.screen,
    loginScreen: elements.login.screen, 
    gameScreen: elements.game.screen, 
    instructionsScreen: elements.instructions.screen, 
    highscoresScreen: elements.highscores.screen
};

class Question {
    constructor(questionText, answer, possibleAnswers, correctAnswerIndex, maxTime) {
      this.questionText = questionText;
      this.answer = answer;
      this.possibleAnswers = possibleAnswers;
      this.correctAnswerIndex = correctAnswerIndex;
      this.maxTime = maxTime;
    }
}

let difficulty = 1;
var tid;
let timeLeft;
let playerName;
let playerHealth;
let enemyName;
let enemyHealth;
let playerPos = elements.game.canvas.width / 8;
let enemyPos =  elements.game.canvas.width * (3 / 4);
let hasMoved = false;
var ctx = elements.game.canvas.getContext("2d");
var playerImage = new Image();
var enemyImage = new Image();
const enemyImagePath = 'assets/images/enemy';
let enemyImageChooser;
var gameMusic = document.createElement("audio");

elements.play.playButton.addEventListener("click", function(){
    showLogin();
});

elements.login.loginButton.addEventListener("click", function(){
    if (elements.login.nameInput.value === "") {
        alert("Please enter a name");
    } else {
        if (elements.login.nameInput.value.includes(",") || elements.login.nameInput.value.includes(".")) {
            alert("Please enter a name which does not contain '.' or ','");
        } else {
            showInstructions();
            playerName = elements.login.nameInput.value;
        }  
    }  
});

elements.instructions.startGameButton.addEventListener("click", function(){
    showGame();
});

elements.highscores.restartButton.addEventListener("click", function(){
    window.location.reload();
});

function hideScreens() {
    Object.values(screens).forEach(screen => {
        screen.style.display = "none";
    });
}

function showScreen(screen) {
    hideScreens();
    screen.style.display = "block";
}

function showPlay() {
    showScreen(elements.play.screen);
}

function showLogin() {
    gameMusic.src = "assets/sounds/startTheme.mp3"
    gameMusic.loop = true;
    gameMusic.play();
    showScreen(elements.login.screen);
}

function showInstructions() {
    showScreen(elements.instructions.screen);
}

function showGame() {
    gameMusic.src = "assets/sounds/gameTheme.mp3";
    gameMusic.play();
    enemyName = randomNameGen();
    playerHealth = 100;
    enemyHealth = 100;
    elements.game.playerName.innerText = playerName;
    elements.game.playerHealth.innerText = playerHealth;
    elements.game.enemyName.innerText = enemyName;
    elements.game.enemyHealth.innerText = enemyHealth;
    elements.game.canvas.width = window.screen.width / 4;
    elements.game.canvas.height = window.screen.height / 4;
    enemyImageChooser = Math.floor(Math.random() * 6) + 1;
    playerImage.src = 'assets/images/man.jpg';
    enemyImage.src = enemyImagePath + enemyImageChooser + ".png";
    playerImage.onload = () => {
        ctx.drawImage(playerImage, elements.game.canvas.width / 8, elements.game.canvas.height / 4, elements.game.canvas.width / 8, elements.game.canvas.height / 2)
    }
    enemyImage.onload = () => {
        ctx.drawImage(enemyImage, elements.game.canvas.width * (5 / 8), elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2)
    }
    showScreen(elements.game.screen);
    newQuestion();
}

function btn1Click() {
    handleInput(x, 0, false);
}

function btn2Click() {
    handleInput(x, 1, false);
}

function btn3Click() {
    handleInput(x, 2, false);
}

function btn4Click() {
    handleInput(x, 3, false);
}

function newQuestion() {
    chooseQuestion(difficulty);
    timeLeft = x.maxTime;
    tid = setTimeout(timer, 1000);
    setTimeout(updateUI, 500);
}

function chooseQuestion(difficulty) {
    if (difficulty === 1) {
        x = createAdditionQuestion(difficulty);
    } else if (difficulty === 2) {
        var rand = Math.floor(Math.random() * 2 + 1);
        if (rand === 1) {
            x = createSubtractionQuestion(difficulty);
        } else {
            x = createAdditionQuestion(difficulty);
        }
    } else {
        var rand = Math.floor(Math.random() * 3 + 1);
        if (rand === 1) {
            x = createSubtractionQuestion(difficulty);
        } else if (rand === 2) {
            x = createAdditionQuestion(difficulty);
        } else {
            x = createMultiplicationQuestion(difficulty);
        }
    }
}

function createAdditionQuestion(difficulty) {
    const maxNum = (10 ** difficulty);
    const num1 = Math.floor(Math.random() * maxNum);
    const num2 = Math.floor(Math.random() * maxNum);
    const text = String(num1) + " + " + String(num2);
    const answer = num1 + num2;
    const possibleAnswers = [];
    const correctAnswerIndex = Math.floor(Math.random() * 4)
    while (possibleAnswers.length < 5) {
        const possibleAnswer = Math.floor(Math.random() * (maxNum * 2));
        if (possibleAnswer !== answer && !possibleAnswers.includes(possibleAnswer)) {
            possibleAnswers.push(possibleAnswer);
        }
    }
    possibleAnswers[correctAnswerIndex] = answer;
    const maxtime = 3 + (difficulty - 1) * 2;
    return new Question(text, answer, possibleAnswers, correctAnswerIndex, maxtime);
}

function createSubtractionQuestion(difficulty) {
    const maxNum = 10 ** (difficulty - 1);
    const num1 = Math.floor(Math.random() * maxNum);
    const num2 = Math.floor(Math.random() * maxNum);
    const text = String(num1) + " - " + String(num2);
    const answer = num1 - num2;
    const possibleAnswers = [];
    const correctAnswerIndex = Math.floor(Math.random() * 4)
    while (possibleAnswers.length < 5) {
        const possibleAnswer = Math.floor(Math.random() * ((maxNum + 1) - (-maxNum)) - maxNum);
        if (possibleAnswer != answer && possibleAnswers.includes(possibleAnswer) === false) {
            possibleAnswers.push(possibleAnswer);
        }
    }
    possibleAnswers[correctAnswerIndex] = answer;
    const maxtime = 5 + (difficulty - 1) * 2;
    return new Question(text, answer, possibleAnswers, correctAnswerIndex, maxtime);
}

function createMultiplicationQuestion(difficulty) {
    const maxNum = 10 ** (difficulty - 2);
    const num1 = Math.floor(Math.random() * maxNum);
    const num2 = Math.floor(Math.random() * maxNum);
    const text = String(num1) + " X " + String(num2);
    const answer = num1 * num2;
    const possibleAnswers = [];
    const correctAnswerIndex = Math.floor(Math.random() * 4)
    while (possibleAnswers.length < 5) {
        const possibleAnswer = Math.floor(Math.random() * (maxNum ** 2));
        if (possibleAnswer != answer && possibleAnswers.includes(possibleAnswer) === false) {
            possibleAnswers.push(possibleAnswer);
        }
    }
    possibleAnswers[correctAnswerIndex] = answer;
    const maxtime = 5 + (difficulty - 1) * 2;
    return new Question(text, answer, possibleAnswers, correctAnswerIndex, maxtime);
}

function timer() {
    if (timeLeft % 1 == 0) {
        elements.game.time.innerText = timeLeft;
    }
    if (timeLeft === 0) {
        handleInput(5, x, true);
    } else {
        timeLeft -= 0.5;
        tid = setTimeout(timer, 500);
    }
}
function abortTimer() { 
    clearTimeout(tid);
}

function updateUI() {
    elements.game.playerName.innerText = playerName;
    elements.game.playerHealth.innerText = playerHealth;
    elements.game.enemyName.innerText = enemyName;
    elements.game.enemyHealth.innerText = enemyHealth;
    elements.game.button1.innerText = x.possibleAnswers[0];
    elements.game.button2.innerText = x.possibleAnswers[1];
    elements.game.button3.innerText = x.possibleAnswers[2];
    elements.game.button4.innerText = x.possibleAnswers[3];
    elements.game.questionText.innerText = x.questionText;
    elements.game.button1.disabled = false;
    elements.game.button2.disabled = false;
    elements.game.button3.disabled = false;
    elements.game.button4.disabled = false;
}

function handleInput(question, num, timeOut) {
    abortTimer();
    elements.game.button1.disabled = true;
    elements.game.button2.disabled = true;
    elements.game.button3.disabled = true;
    elements.game.button4.disabled = true; 
    if (! timeOut) {
        if (question.possibleAnswers[num] === question.answer) {
            playerPos = elements.game.canvas.width / 8;
            movePlayer();
            enemyHealth -= Math.floor((15 - (15 / (timeLeft + 1.5))));      
        } else {
            moveEnemy();
        }
    } else {
        moveEnemy();
    }
    playerHealth -= Math.floor(Math.random() * 11); 
}

function randomNameGen() {
    const vowels = ["a", "e", "i", "o", "u"];
    const consonants = ["b", "c", "d", "f", "g", "h", "j", "k", "l", "m", "n", "p", "q", "r", "s", "t", "v", "w", "x", "y", "z"];
    let name = "";
    const nameLength = Math.floor(Math.random() * 15) + 1;
    let i = 0;
    while (i < nameLength) {
        const vowelNum =  Math.floor(Math.random() * vowels.length);
        const consonantNum =  Math.floor(Math.random() * consonants.length);
        name = name + consonants[consonantNum] + vowels[vowelNum];
        i += 1;
    }
    return name;
}

function movePlayer() {
    if (playerPos >= elements.game.canvas.width * (5 / 8)) {
        hasMoved = true;
    }
    if (hasMoved) {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        playerPos = playerPos - 8;
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, elements.game.canvas.width / 8, elements.game.canvas.height / 2);
        ctx.drawImage(enemyImage, elements.game.canvas.width * (5 / 8), elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
    } else {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        playerPos = playerPos + 8;
        ctx.drawImage(playerImage, playerPos, elements.game.canvas.height / 4, elements.game.canvas.width / 8, elements.game.canvas.height / 2);
        ctx.drawImage(enemyImage, elements.game.canvas.width * (5 / 8), elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
    }
    if (playerPos < elements.game.canvas.width / 8) {
        hasMoved = false;
        enemyPos = elements.game.canvas.width * (5 / 8);
        if (enemyHealth <= 0) {
            alert("You have defeated " + enemyName + ", now prepare for the next enemy! \n Health Partially Restored.");
            enemyHealth = 100;
            enemyName = randomNameGen();
            enemyImageChooser = Math.floor(Math.random() * 6) + 1;
            enemyImage.src = enemyImagePath + enemyImageChooser + ".png";
            difficulty += 1;
            ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
            ctx.drawImage(enemyImage, elements.game.canvas.width * (5 / 8), elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2)
            ctx.drawImage(playerImage, elements.game.canvas.width / 8, elements.game.canvas.height / 4, elements.game.canvas.width / 8, elements.game.canvas.height / 2);
            playerHealth += Math.floor(playerHealth / 2);
            newQuestion();
        } else {
            moveEnemy();
        }
    } else {
        requestAnimationFrame(movePlayer);
    }
    
}

function moveEnemy() {
    if (enemyPos <= elements.game.canvas.width * (1 / 4)) {
        hasMoved = true;
    }
    if (hasMoved) {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        enemyPos = enemyPos + 8;
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
        ctx.drawImage(playerImage, elements.game.canvas.width / 8, elements.game.canvas.height / 4, elements.game.canvas.width / 8, elements.game.canvas.height / 2);
    } else {
        ctx.clearRect(0, 0, elements.game.canvas.width, elements.game.canvas.height);
        enemyPos = enemyPos - 8;
        ctx.drawImage(enemyImage, enemyPos, elements.game.canvas.height / 4, enemyImage.width / 2, enemyImage.height / 2);
        ctx.drawImage(playerImage, elements.game.canvas.width / 8, elements.game.canvas.height / 4, elements.game.canvas.width / 8, elements.game.canvas.height / 2);
    }
    if (enemyPos > elements.game.canvas.width * (5 / 8)) {
        hasMoved = false;
        if (playerHealth > 0) {
            newQuestion();
        } else {
            playerHealth = 0;
            updateUI();
            showHighscores();
        }
    } else {
        requestAnimationFrame(moveEnemy);
    }
    
}

function showHighscores() {
    let scores;
    if (localStorage.getItem("highScoresList") === null) {
        localStorage.setItem("highScoresList", playerName + "." + difficulty + ",");
        scores = localStorage.getItem("highScoresList");
    } else {
        scores = localStorage.getItem("highScoresList");
        scores = scores + playerName + "." + difficulty + ",";
    }
    localStorage.setItem("highScoresList", scores);
    scores = scores.split(",");
    const sortedScores = sortHighscores(scores);
    console.log(sortedScores);
    elements.highscores.scores.innerText = sortedScores;
    gameMusic.pause();
    gameMusic.src = "assets/sounds/deathTheme.mp3"
    gameMusic.load();
    gameMusic.play();
    showScreen(elements.highscores.screen);
}

function sortHighscores(highscores) {
    let len = highscores.length;
    for (let i = 0; i < len; i++) {
        let max = i;
        for (let j = i + 1; j < len; j++) {
            if (Number(highscores[max].split(".")[1]) < Number(highscores[j].split(".")[1])) {
                max = j;
            }
        }
        if (max !== i) {
            let tmp = highscores[i];
            highscores[i] = highscores[max];
            highscores[max] = tmp;
        }
    }
    return highscores;
}

function main() {
    showPlay();
}
main();
