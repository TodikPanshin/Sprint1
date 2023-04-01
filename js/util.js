'use strict'

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

function copyMat(mat) {
    var newMat = []
    for (var i = 0; i < mat.length; i++) {
        newMat[i] = []
        for (var j = 0; j < mat[0].length; j++) {
            newMat[i][j] = { ...mat[i][j] }
        }
    }
    return newMat
}


function getRandomColor() {
    var letters = '0123456789ABCDEF'
    var color = '#'
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)]
    }
    return color
}

function renderCell(locationI, locationJ, value) {
    // Select the elCell and set the value
    const elCell = document.querySelector(`.cell-${locationI}-${locationJ}`)
    elCell.innerHTML = value
    
}

function disableClick() {
    var elboard = document.querySelector('.board-con');
    elboard.addEventListener('contextmenu', (ev) => {
        ev.preventDefault(); // this will prevent browser default behavior 
    })
}

function onHandleKey(ev) {
    if (ev.key === 'Escape'){
         onCloseModalDifficulty()
         onCloseModalPlayerHelp()
}
}