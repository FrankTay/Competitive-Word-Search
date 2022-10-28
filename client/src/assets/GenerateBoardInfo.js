import CreateBoard from "./CreateBoard";

export const BoardData = (dimensions, totalWords) => {
    let boardInfo = new CreateBoard(dimensions, totalWords); //default 20 x 20 board, with 30 words
    let newBoard = boardInfo.generateBoard();
    let boardWordList = newBoard.answers.map(elem => elem.word);
    let wordListStatus = boardWordList.map(elem => {
        return {
            word: elem,
            found: false,
            foundBy:null
        };
    })
    return {newBoard,wordListStatus}
}

