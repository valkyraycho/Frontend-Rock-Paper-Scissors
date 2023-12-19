import Game from "./Game.js";

document.addEventListener("readystatechange", (event) => {
    if (event.target.readyState === "complete") {
        initApp();
    }
});

const game = new Game();
const initApp = () => {
    initAllTimeData();
    updateScoreboard();
    listenForPlayerChoice();
    listenForEnter();
    listenForPlayAgain();
    lockComputerGameboard();
    setFocus();
};

const initAllTimeData = () => {
    game.setP1AllTime(parseInt(localStorage.getItem("p1AllTime")) || 0);
    game.setCPAllTime(parseInt(localStorage.getItem("cpAllTime")) || 0);
};

const updateScoreboard = () => {
    const p1AllTimeScore = document.getElementById("p1_all_time_score");
    p1AllTimeScore.textContent = game.getP1AllTime();
    p1AllTimeScore.ariaLabel = `Player One has ${game.getP1AllTime()} all time wins.`;

    const cpAllTimeScore = document.getElementById("cp_all_time_score");
    cpAllTimeScore.textContent = game.getCPAllTime();
    cpAllTimeScore.ariaLabel = `Computer Player has ${game.getCPAllTime()} all time wins.`;

    const p1SessionScore = document.getElementById("p1_session_score");
    p1SessionScore.textContent = game.getP1Session();
    p1SessionScore.ariaLabel = `Player One has ${game.getP1Session()} wins this session.`;

    const cpSessionScore = document.getElementById("cp_session_score");
    cpSessionScore.textContent = game.getCPSession();
    cpSessionScore.ariaLabel = `Computer Player has ${game.getCPSession()} wins this session.`;
};

const listenForPlayerChoice = () => {
    const playerImages = document.querySelectorAll(
        ".playerBoard .gameboard__square img"
    );
    playerImages.forEach((img) => {
        img.addEventListener("click", (event) => {
            if (game.getActiveStatus()) return;
            game.startGame();
            const playerChoice = img.parentElement.id;
            updateP1Message(playerChoice);
            playerImages.forEach((img) => {
                if (img.parentElement.id === playerChoice)
                    img.parentElement.classList.add("selected");
                else img.parentElement.classList.add("not-selected");
            });
            computerAnimationSequence(playerChoice);
        });
    });
};

const updateP1Message = (playerChoice) => {
    document.getElementById("playermsg").textContent +=
        " " + properCase(playerChoice) + "!";
};

const properCase = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const computerAnimationSequence = (playerChoice) => {
    let interval = 500;

    const computerOptions = document.querySelectorAll(
        "#computer_gameboard .gameboard__square"
    );
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            computerChoiceAnimation(computerOptions[i].id, i + 1);
        }, (interval += 500));
    }

    setTimeout(() => {
        countdownFade();
    }, (interval += 750));

    setTimeout(() => {
        deleteCountdown();
        finishGame(playerChoice);
    }, (interval += 750));

    setTimeout(() => {
        showPlayAgain();
    }, (interval += 1000));
};

const computerChoiceAnimation = (computerOption, countdownNum) => {
    const option = document.getElementById(computerOption);
    option.classList.add("hidden");
    const number = document.createElement("p");
    number.textContent = countdownNum;
    option.appendChild(number);
    option.firstElementChild.remove();
};

const countdownFade = () => {
    const computerOptions = document.querySelectorAll(
        "#computer_gameboard .gameboard__square p"
    );

    computerOptions.forEach((option) => {
        option.classList.add("fadeOut");
    });
};

const deleteCountdown = () => {
    const computerOptions = document.querySelectorAll(
        "#computer_gameboard .gameboard__square p"
    );

    computerOptions.forEach((option) => {
        option.remove();
    });
};

const finishGame = (playerChoice) => {
    const computerChoice = getComputerChoice();
    displayComputerChoice(computerChoice);
    const winner = determineWinner(playerChoice, computerChoice);
    showWinnerMessage(winner, playerChoice, computerChoice);
    updateScores(winner);
    updatePersistentData(winner);
};

const getComputerChoice = () => {
    const computerOptions = [];
    for (let i = 0; i < 3; i++) {
        computerOptions.push(
            document.querySelectorAll("#player_gameboard .gameboard__square")[i]
                .id
        );
    }
    const computerChoice = computerOptions[Math.floor(Math.random() * 3)];
    return computerChoice;
};

const displayComputerChoice = (computerChoice) => {
    const square = document.getElementById("cp_paper");
    createGameImage(computerChoice, square);
};

const createGameImage = (icon, elementToAppend) => {
    const img = document.createElement("img");
    img.src = `images/${icon}.png`;
    img.alt = icon;
    img.tabIndex = 0;
    elementToAppend.appendChild(img);
};

const determineWinner = (playerChoice, computerChoice) => {
    const playerWinning = {
        rock: "scissors",
        paper: "rock",
        scissors: "paper",
    };

    if (playerChoice === computerChoice) return "tie";
    if (computerChoice === playerWinning[playerChoice]) return "player";
    return "computer";
};

const showWinnerMessage = (winner, playerChoice, computerChoice) => {
    const actions = {
        rock: "smashes",
        paper: "wraps",
        scissors: "cuts",
    };

    const winnerMessage = document.getElementById("playermsg");
    const actionMessage = document.getElementById("cpmsg");
    let action;

    switch (winner) {
        case "computer":
            winnerMessage.textContent = "🤖 Computer wins! 🤖";
            action = actions[computerChoice];
            actionMessage.textContent = `${properCase(
                computerChoice
            )} ${action} ${properCase(playerChoice)}`;
            break;

        case "player":
            winnerMessage.textContent = "🏆🔥 You Win! 🔥🏆";
            action = actions[playerChoice];
            actionMessage.textContent = `${properCase(
                playerChoice
            )} ${action} ${properCase(computerChoice)}`;
            break;

        default:
            winnerMessage.textContent = "Tie Game!";
            actionMessage.textContent = "What an intensive fight!";
            break;
    }
    updateAriaResult(actionMessage.textContent, winner);
};

const updateScores = (winner) => {
    winner === "player"
        ? game.p1Wins()
        : winner === "computer"
        ? game.cpWins()
        : null;

    updateScoreboard();
};

const updateAriaResult = (result, winner) => {
    const ariaResult = document.getElementById("playAgain");
    const winMessage =
        winner === "player"
            ? "Congratulations, you are the winner."
            : winner === "computer"
            ? "The computer is the winner."
            : "";
    ariaResult.ariaLabel = `${result} ${winMessage} Click or press enter to play again.`;
};

const updatePersistentData = (winner) => {
    winner === "computer"
        ? localStorage.setItem("cpAllTime", game.getCPAllTime())
        : localStorage.setItem("p1AllTime", game.getP1AllTime());
};

const showPlayAgain = () => {
    const playAgain = document.getElementById("playAgain");
    playAgain.classList.toggle("hidden");
    playAgain.focus();
};

const listenForEnter = () => {
    window.addEventListener("keydown", (event) => {
        if (event.code === "Enter" && event.target.tagName === "IMG")
            event.target.click();
    });
};

const listenForPlayAgain = () => {
    document.querySelector("form").addEventListener("submit", (event) => {
        event.preventDefault();
        resetBoard();
    });
};

const resetBoard = () => {
    const gameSquares = document.querySelectorAll(".gameboard div");
    gameSquares.forEach((square) => {
        square.className = "gameboard__square";
    });

    const cpSquares = document.querySelectorAll(
        ".computerBoard .gameboard__square"
    );
    cpSquares.forEach((square) => {
        if (square.firstElementChild) square.firstElementChild.remove();
        createGameImage(square.id.split("_")[1], square);
    });

    document.getElementById("playermsg").textContent = "Player One Chooses...";
    document.getElementById("cpmsg").textContent = "Computer Chooses...";

    document.getElementById("playermsg").focus();
    document.getElementById("playAgain").classList.toggle("hidden");
    game.endGame();
};

const lockComputerGameboard = () => {
    const cpGameboard = document.querySelector(".computerBoard .gameboard");
    const cpGameboardStyle = getComputedStyle(cpGameboard);
    const height = cpGameboardStyle.getPropertyValue("height");
    cpGameboard.style.minHeight = height;
};

const setFocus = () => {
    document.querySelector("h1").focus();
};
