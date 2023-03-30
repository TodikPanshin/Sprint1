'use strict'
const MINE = '💣'
const BUTTON_DIF = '😼'
const BUTTON_HURT = '😿'
const BUTTON_WIN = '😻'
const BUTTON_CLICKED = '😺'



var gBoard
var gLevel
var gGame
var gBoardIsShown = false
var gtimeStart
var gIntervalTime
var gInterval
var gResetBtnTimeout


function onInit() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        markedcorrect: 0,
        lifeLeft: 3,
        secsPassed: 0
    }
    if (!gLevel) onlevel()
    // gLevel = {
    //     SIZE: 8,
    //     MINES: 5
    //    }


    resetBtn()
    lifeCount()
    gBoard = buildBoard(gLevel)
    // showBoard()
    // addMines(2 )
    renderBoard(gBoard, '.board-con')
    // console.log(gBoard)
    disableClick()
    gInterval = setInterval(renderStuff, 10)

}

function lifeCheck() {
    if (gGame.lifeLeft > 1) {
        gGame.lifeLeft--
        resetBtn(BUTTON_HURT)
        gResetBtnTimeout = setTimeout(resetBtn, 1000)
        lifeCount()
    }
    else {
        gGame.lifeLeft--
        lifeCount()
        gameOver()
        clearTimeout(gResetBtnTimeout)
        resetBtn(BUTTON_HURT)
    }
}

function lifeCount() {
    var elLife = document.querySelector('.counter-life')
    elLife.innerHTML = gGame.lifeLeft
}

function onlevel(levelInx = 1) {
    gLevel = {}
    if (levelInx === 1) {

        gLevel.size = 4
        gLevel.mines = 2

    }
    else if (levelInx === 2) {

        gLevel.size = 8
        gLevel.mines = 14

    }
    else if (levelInx === 3) {

        gLevel.size = 12
        gLevel.mines = 32

    }
    stopTimer()
}

function buildBoard(level) {
    const board = []
    for (var i = 0; i < level.size; i++) {
        board.push([])
        for (var j = 0; j < level.size; j++) {
            board[i][j] = getCell()
        }
    }

    return board
}

function renderBoard(mat, selector) {

    var strHTML = '<table border="0"><tbody>'
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = gBoard[i][j]
            const className = `cell cell-${i}-${j}`
            const isShown = (cell.isShown) ? 'shown' : ''
            const isMarked = (cell.isMarked) ? 'marked' : ''
            const isExploded = (cell.isExploded) ? 'exploded' : ''

            strHTML += `<td class="${className} ${isShown} ${isMarked} ${isExploded}"
            onclick="onCellClicked(this,${i},${j})"
            oncontextmenu="onCellMarked(this,${i},${j})">`
            if (cell.isMine && cell.isExploded || cell.isMine && cell.isShown) {
                strHTML += `${MINE}</td>`
            }
            else if (cell.isShown && cell.minesAroundCount !== 0) strHTML += `${cell.minesAroundCount}</td>`

            else strHTML += `</td>`
        }


        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML


}

function onCellClicked(elCell, i, j) {
    const currCell = gBoard[i][j]
    if (!gGame.isOn) return
    if (currCell.isMarked) return
    if (!currCell.isShown && !currCell.isMine) {
        currCell.isShown = !currCell.isShown
        gGame.shownCount++
        if (gGame.secsPassed === 0) {
            addMines(gLevel.mines,false)
            timer()
        }
        expandShown(gBoard, i, j)
    }
    if (currCell.isMine) {
        if (currCell.isExploded) return
        currCell.isExploded = true
        gGame.markedcorrect++
        lifeCheck()

    }
    renderBoard(gBoard, '.board-con')
    // renderStuff()
    checkIfWin()

}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
    const currCell = gBoard[i][j]
    if (currCell.isShown) return

    if (!currCell.isMarked) {
        currCell.isMarked = true
        gGame.markedCount++
        if (currCell.isMine) gGame.markedcorrect++
    }
    else {
        currCell.isMarked = false
        gGame.markedCount--
        if (gGame.markedCount < 0) gGame.markedCount = 0
        if (currCell.isMine) gGame.markedcorrect--
        if (gGame.markedcorrect < 0) gGame.markedcorrect = 0
    }
    elCell.classList.toggle('marked')
    renderCell(i, j, '')
    // console.log(currCell)
    // renderStuff()
    checkIfWin()
}

function resetBtn(style = BUTTON_DIF) {
    const elBtn = document.querySelector('.reset-btn')
    elBtn.innerText = style
}

function onReset() {
    resetBtn(BUTTON_CLICKED)
    gGame.isOn = false
    stopTimer()
    onInit()

}

function gameOver() {
    console.log('End')
    gGame.isOn = false
    clearInterval(gInterval)
    showBoard()
    stopTimer()
}

function checkIfWin() {
    if (gGame.markedcorrect === gLevel.mines && gGame.shownCount === (gLevel.size ** 2) - gLevel.mines) {
        resetBtn(BUTTON_WIN)
        console.log('Win')
        gameOver()
    }
}

function expandShown(board, posi, posj) {
    if (board[posi][posj].minesAroundCount !== 0) return

    for (var i = posi - 1; i <= posi + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = posj - 1; j <= posj + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === posi && j === posj) continue
            var currCell = board[i][j]
            if (!currCell.isShown && !currCell.isMarked
                && !currCell.isMine) {
                currCell.isShown = true
                gGame.shownCount++
                expandShown(board,i,j)
            }

        }
    }
    
}

function setMinesNegsCount(posi, posj) {
    for (var i = posi - 1; i <= posi + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posj - 1; j <= posj + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === posi && j === posj) continue;
            var currCell = gBoard[i][j]
            if (currCell.isMine) continue
            currCell.minesAroundCount++
        }
    }

}

function addMines(num, test = true) {
    if (!test) {
        for (var i = 0; i < num; i++) {
            var emptyPos = getEmptyPos()
            // console.log(emptyPos)
            gBoard[emptyPos.i][emptyPos.j].isMine = true
            setMinesNegsCount(emptyPos.i, emptyPos.j)
        }
    }
    else {
        gBoard[0][0].isMine = true
        setMinesNegsCount(0, 0)
        gBoard[5][5].isMine = true
        setMinesNegsCount(5, 5)
        gBoard[0][gBoard.length - 1].isMine = true
        setMinesNegsCount(0, gBoard.length - 1)
    }
}

function getEmptyPos() {
    var emptyPos = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            var currCell = gBoard[i][j]
            if (!currCell.isMine && !currCell.isShown) {
                emptyPos.push({ i, j })
            }
        }
    }
    var randIdx = getRandomInt(0, emptyPos.length)

    return emptyPos[randIdx]
}

function getCell() {
    return {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isExploded: false
    }

}

//>>>>>>>>>>>>>>>>>>>>>>>>>>

function showBoard() {
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            if (!gBoard[i][j].isShown) {
                gBoard[i][j].isShown = true
                // var test = document.querySelector('cell')
            }
        }
    }
}

function renderStuff() {
    var elDiv = document.querySelector('.test-stuff')
    // console.log(elDiv)
    elDiv.innerHTML = `shown cells: ${gGame.shownCount} marked cells: ${gGame.markedCount}
     marked correct: ${gGame.markedcorrect} timer: ${gGame.secsPassed} `

}

function timer() {
    gtimeStart = Date.now()
    // console.log(gtimeStart)
    gIntervalTime = setInterval(updateTimer, 10)
}
function stopTimer() {
    clearInterval(gIntervalTime)
}

function updateTimer() {
    var elapsedTime = Date.now() - gtimeStart
    var seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000)
    var milliseconds = Math.floor((elapsedTime % 1000) / 10)
    gGame.secsPassed =
        formatTime(seconds) + ':' + formatTime(milliseconds)
}

function formatTime(time) {
    return (time < 10 ? '0' : '') + time
}

function disableClick() {
    var elboard = document.querySelector('.board-con');
    elboard.addEventListener('contextmenu', (ev) => {
        ev.preventDefault(); // this will prevent browser default behavior 
    })
}


function closeModal() {
    const elModal = document.querySelector('.modal')
    const elText = document.querySelector('.end-state')
    elModal.style.display = 'none'
    elText.innerHTML = 'YOU LOSE'
}

function openModal() {
    console.log('lol')
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'block'
}