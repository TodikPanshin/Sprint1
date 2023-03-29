'use strict'
const MINE = '💣'

var gBoard
var gLevel
var gGame
var gBoardIsShown = false
var gIntervalTime
var gtimeStart


function onInit() {
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gLevel = {
        size: 4,
        mines: 2
    }
    gBoard = buildBoard(gLevel)
    // showBoard()
    // addMines(2 )
    renderBoard(gBoard, '.board-con')
    // console.log(gBoard)
    disableClick()
    renderStuff()
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
            strHTML += `<td class="${className} ${isShown} ${isMarked}"
            onclick="onCellClicked(this,${i},${j})"
            oncontextmenu="onCellMarked(this,${i},${j})">`
            if (cell.isMine && cell.isShown) {
                strHTML += `${MINE}</td>`
            }
            else if (cell.isShown) strHTML += `${cell.minesAroundCount}</td>`

            else strHTML += `</td>`
        }


        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>'

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML


}

function setMinesNegsCount(posi, posj) {
    for (var i = posi - 1; i <= posi + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = posj - 1; j <= posj + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue;
            if (i === posi && j === posj) continue;
            var currCell = gBoard[i][j]
            currCell.minesAroundCount++
        }
    }
    gBoard[posi][posj].minesAroundCount
}

function onCellClicked(elCell, i, j) {
    const currCell = gBoard[i][j]
    if (!gGame.isOn) return
    if (currCell.isMarked) return
    if (gGame.shownCount === 0) {
        addMines()
        timer()
    }
    if (!currCell.isShown) {
        currCell.isShown = !currCell.isShown
        elCell.classList.add('shown')
        gGame.shownCount++
    }
    if (currCell.isMine) gameOver()

    renderBoard(gBoard, '.board-con')
    renderStuff()

}

function disableClick() {
    var elboard = document.querySelector('.board-con');
    elboard.addEventListener('contextmenu', (ev) => {
        ev.preventDefault(); // this will prevent browser default behavior 
    })
}

function onCellMarked(elCell, i, j) {
    if (!gGame.isOn) return
    const currCell = gBoard[i][j]
    if (currCell.isShown) return

    if (!currCell.isMarked) {
        currCell.isMarked = true
        gGame.markedCount++
    }
    else {
        currCell.isMarked = false
        gGame.markedCount--
    }
    elCell.classList.toggle('marked')
    renderCell(i, j, '')
    console.log(currCell)
    renderStuff()

}

function gameOver() {
    console.log('your dead')
    gGame.isOn = false
    showBoard()
    openModal()
    stopTimer()


}


function openModal() {
    console.log('lol')
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'block'
}

function checkGameOver() {

}

function expandShown(board, elCell, i, j) {

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
        // gBoard[1][0].isMine = true
        // setMinesNegsCount(1,0)
        gBoard[0][3].isMine = true
        setMinesNegsCount(0, 3)
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
    console.log(elDiv)
    elDiv.innerHTML = `shown cells: ${gGame.shownCount} marked cells: ${gGame.markedCount} timer: ${gGame.secsPassed} `

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
    var elapsedTime = Date.now() - gStartTime
    var seconds = Math.floor((elapsedTime % (1000 * 60)) / 1000)
    var milliseconds = Math.floor((elapsedTime % 1000) / 10)
    gGame.secsPassed =
    formatTime(seconds) +
    ':' +
    formatTime(milliseconds)
}

function formatTime(time) {
    return (time < 10 ? '0' : '') + time
}