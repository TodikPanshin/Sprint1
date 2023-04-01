'use strict'
const MINE = '💣'
const BUTTON_DIF = '😼'
const BUTTON_HURT = '😿'
const BUTTON_WIN = '😻'
const BUTTON_CLICKED = '😺'
const HINT_ON_IMG = "url('img/light_on.png')"
const HINT_OFF_IMG = "url('img/light_off.png')"


var gBoard
var gBoards
var gLevel
var gGame
var gPlayerHelp
var gBoardIsShown = false
var gtimeStart
var gIntervalTime
var gShowTimeInterval
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
    gPlayerHelp = {
        help: false,
        hintsBtnNum: 0,
        isHintOn: false,
        safeClickCount: 3
    }

    if (!gLevel) onlevel()

    resetBtn()
    lifeCount()
    SafeClickCount()
    resetHintBtn()
    gBoards=[]
    gShowTimeInterval = setInterval(showTime, 10)
    gBoard = buildBoard(gLevel)
    // showBoard()
    gBoards.push(copyMat(gBoard))
    renderBoard(gBoard, '.board-con')
    // console.log(gBoard)
    disableClick()
    // gInterval = setInterval(renderTestStuff, 10)

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
    clearInterval(gShowTimeInterval)
    clearInterval(gInterval)
    stopTimer()
    onCloseModalDifficulty()
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

            const cell = mat[i][j]
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
    
    if (gPlayerHelp.help) {
        if (!gPlayerHelp.isHintOn) return
        gPlayerHelp.isHintOn = false
        checkHint(gBoard, i, j)
        return
    }
    if (currCell.isMarked) return
    if (!currCell.isShown && !currCell.isMine) {
        currCell.isShown = !currCell.isShown
        gGame.shownCount++
        if (gGame.secsPassed === 0) {
            addMines(gLevel.mines, false)
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

    gBoards.push(copyMat(gBoard))
    renderBoard(gBoard, '.board-con')
    checkIfWin()

}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
    if (gGame.secsPassed === 0) return
    if (gPlayerHelp.help) return
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
    checkIfWin()
}

function resetBtn(style = BUTTON_DIF) {
    const elBtn = document.querySelector('.reset-btn')
    elBtn.innerText = style
}

function onReset() {
    // resetBtn(BUTTON_CLICKED)
    gGame.isOn = false
    clearInterval(gShowTimeInterval)
    clearInterval(gInterval)
    stopTimer()
    resetHintBtn()
    onInit()

}

function gameOver() {
    // console.log('End')
    gGame.isOn = false
    clearInterval(gShowTimeInterval)
    clearInterval(gInterval)
    showBoard()
    stopTimer()
}

function checkIfWin() {
    if (gGame.markedcorrect === gLevel.mines && gGame.shownCount === (gLevel.size ** 2) - gLevel.mines) {
        clearTimeout(gResetBtnTimeout)
        resetBtn(BUTTON_WIN)
        // console.log('Win')
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
                expandShown(board, i, j)
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

function onCloseModalDifficulty() {
    const elModal = document.querySelector('.modal-difficulty')
    elModal.style.display = 'none'
}

function onOpenModalDifficulty() {
    var elModal = document.querySelector('.modal-difficulty')
    elModal.style.display = 'block'
}

function onCloseModalPlayerHelp() {
    const elModal = document.querySelector('.modal-player-help')
    elModal.style.display = 'none'
    setTimeout(() => {
        gPlayerHelp.help = false
    }, 2000); 
}

function onOpenModalPlayerHelp() {
    if (gGame.secsPassed === 0) return
    if(gPlayerHelp.help) return
    var elModal = document.querySelector('.modal-player-help')
    elModal.style.display = 'block'
    gPlayerHelp.help=true
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

function renderTestStuff() {
    var elDiv = document.querySelector('.test-stuff')
    // console.log(elDiv)
    elDiv.innerHTML = `shown cells: ${gGame.shownCount} marked cells: ${gGame.markedCount}
     marked correct: ${gGame.markedcorrect} hint: ${gPlayerHelp.hintsCount} `

}

function showTime() {
    const elTime = document.querySelector('.counter-timer')
    elTime.innerHTML = gGame.secsPassed
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
    var seconds = Math.floor((elapsedTime % (10000 * 60)) / 1000)
    var milliseconds = Math.floor((elapsedTime % 1000) / 10)
    gGame.secsPassed =
        formatTime(seconds) + ':' + formatTime(milliseconds)
}

function formatTime(time) {
    return (time < 10 ? '0' : '') + time
}

// >>>>>>>>>>>player help
function checkHint(board, posi, posj) {
    var negBord = copyMat(board)
    for (var i = posi - 1; i <= posi + 1; i++) {
        if (i < 0 || i >= negBord.length) continue;
        for (var j = posj - 1; j <= posj + 1; j++) {
            if (j < 0 || j >= negBord[i].length) continue;
            const currCell = negBord[i][j]
            if (!currCell.isShown) currCell.isShown = true
        }
    }
    // console.log(negBord)
    renderBoard(negBord, '.board-con')

    setTimeout(() => {
        renderBoard(gBoard, '.board-con')
        // console.log(gBoard)
        onHintOff()
    }, 2000)

}

function onHintOn(elBtn, num) {
    if (gGame.secsPassed === 0) return
    if (gPlayerHelp.help) return
    if (gPlayerHelp.isHintOn) return
    console.log('on')
    elBtn.style.backgroundImage = HINT_ON_IMG

    gPlayerHelp.help = true
    gPlayerHelp.isHintOn = true
    gPlayerHelp.hintsBtnNum = num
}

function onHintOff() {
    const elBtn = document.querySelector(`.btn${gPlayerHelp.hintsBtnNum}`)
    elBtn.style.display = 'none'

    console.log('off')
    gPlayerHelp.help = false
}

function resetHintBtn() {
    var elHintBtns = document.querySelectorAll('.hint-btn')
    // console.log(elHintBtns)
    for (var i = 0; i < elHintBtns.length; i++) {
        elHintBtns[i].style.display = 'inline'
        elHintBtns[i].style.backgroundImage = HINT_OFF_IMG
    }

}

function onSafeClick() {
    if (gPlayerHelp.safeClickCount === 0) return
    // if(gPlayerHelp.)
    gPlayerHelp.safeClickCount--
    onCloseModalPlayerHelp()
    console.log('on')
    SafeClickCount()
    const saveCell = getEmptyPos()
    const elCell = document.querySelector(`.cell-${saveCell.i}-${saveCell.j}`)
    elCell.classList.add('safe-clicked')

    renderCell(saveCell.i, saveCell.j, '')

    setTimeout(() => {
        elCell.classList.remove('safe-clicked')
        gPlayerHelp.help = false
        console.log('off')
        renderCell(saveCell.i, saveCell.j, '') 
    }, 2000);

}
function SafeClickCount() {
    var elSafeClick = document.querySelector('.safe-click-btn span')
    elSafeClick.innerHTML = gPlayerHelp.safeClickCount


}
//>>>>>>>>>>>>>>>>>>>>> UNFINISHED
function onUndo(){
    if (!gGame.isOn) return
    onCloseModalPlayerHelp()

    if(gBoards.length===0)return alert('its the beginning')
    var lastPressBoard=gBoards.pop()
    console.log(gBoards)
    // console.log(lastPressBoard)
    gBoard=lastPressBoard
    renderBoard(gBoard,'.board-con')
}
