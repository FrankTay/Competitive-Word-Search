const friendlyWords = require("friendly-words");

let allWords = [...friendlyWords.objects,...friendlyWords.predicates,...friendlyWords.teams,...friendlyWords.collections];

class CreateBoard {

  constructor(dimensions = 20, wordListTotal = 20){
    this.dimensions = dimensions;
    this.wordListTotal = wordListTotal
  }

  generateBoard(attempts = 100){

    let count = 0;
    let wordList = this.getWordList(this.wordListTotal);

    while (count <= attempts){
      let result = this.injectListIntoBoard(wordList)
      if (result) return result
      count++
    }
    return false
  }

  // establish word list
  getWordList(listLength){
    //get wordlist of a certain length from wordlist
    let words = Array(listLength).fill(null);
    
    // filter words longer than dimensions
    let filteredWordList = allWords.filter(word => word.length <= this.dimensions)

    //TODO: return list with no duplicates
    words = words.map(word => {

      let totalWords = filteredWordList.length;
      let randomNumber = Math.floor(Math.random()*totalWords)
      return filteredWordList[randomNumber]
    })

    // sort by word size to ensure all words will fit in puzzle
    words.sort(function compareFn(a, b) {return b.length - a.length })

    return words
  }

  // create a dimension x dimension 2d array of undefined values
  createBlankBoard(){
    let board = Array(this.dimensions).fill(null).map( ()=>Array(this.dimensions).fill(null) )
    return board
  }
  

  // attempt to inject word list into game board. if false, board could not be created
  injectListIntoBoard(wordList){
    let board = this.createBlankBoard();
    let answers = [];

    //assuming word list is sorted
    if (wordList[0].length > this.dimensions) return false

      //cycle through word list and add them to a blank game board
    for (let i = 0; i < wordList.length; i++) {
      // find all valid positions on the game board for the current word and save as an array
      let positionsForWord = this.getValidBoardPositions(wordList[i],board)
      // if no valid positions are found, stop cycle and break out of function
      if (positionsForWord.length === 0) return false 
      // get a number from 0 through the length of total valid positions
      let randomPosition = Math.floor(Math.random() * positionsForWord.length)
      // choosing one of the random valid positions, write the word to board and update board with current word added
      board = this.writeWordToBoard(wordList[i],board,positionsForWord[randomPosition])
      // add current word position to answers array
      answers.push(positionsForWord[randomPosition])
    }

    // return the board with remaining nulls filled in with random letters
    board = this.fillInNulls(board) 

    return {answers:answers, board:board}
  }

  // a list of all valid starting coordinates for a word on the given board, empty if none
  getValidBoardPositions(word, board){
    let allPotentialPositions = []
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        allPotentialPositions.push(...this.isWordValidAtPosition(word,board,row,col))
      }
    }
    return allPotentialPositions
  }

  //starting at the given coordinates of the given board,
  //find out if there is a valid word placement in each cardinal direction
  isWordValidAtPosition(word,board,row,col){
    const initialRow = row
    const initialCol = col
    const boardLen = board.length-1
    let validStartPositions = []

    // direction traversal key(moving by 1 element)
    // directions = {e: col++, se: row++,col++, s: row++, sw: row++,col--, w:col--, nw: row--,col--, n:row--, ne: row--,col++}
    let directions = {e: {r:0,c:1}, se: {r:1,c:1}, s: {r:1,c:0}, sw: {r:1,c:-1}, w: {r:0,c:-1}, nw: {r:-1,c:-1}, n: {r:-1,c:0}, ne: {r:-1,c:1}}
    
    for (let key in directions){

      for (let letter = 0, row = initialRow, col = initialCol; letter < word.length; letter+=1,col+=directions[key].c, row+=directions[key].r) {
        if (row > boardLen || col > boardLen || row < 0 || col < 0 || 
          !(board[row][col] === null || board[row][col] === word[letter])){
          break
        } else if ((board[row][col] === null || board[row][col] === word[letter]) && (letter === word.length-1)) {
          validStartPositions.push({word: word, direction: key, row: initialRow, col: initialCol, endRow: row, endCol: col})//,endRow:row, endCol:col 
        } 
      } 
    }

    return validStartPositions

  }

  writeWordToBoard(word,board,rowColandDirObj){
    let {direction, row:initialRow, col:initialCol} = rowColandDirObj
    let directions = {e: {r:0,c:1}, se: {r:1,c:1}, s: {r:1,c:0}, sw: {r:1,c:-1}, w: {r:0,c:-1}, nw: {r:-1,c:-1}, n: {r:-1,c:0}, ne: {r:-1,c:1}}
    let dirIncrements = directions[direction]

    for (let letter = 0, row = initialRow, col = initialCol; letter < word.length; letter+=1, col += dirIncrements.c, row += dirIncrements.r) {
      board[row][col] = word[letter]
    }

    return board
  }

  fillInNulls(board){
    let letters = "abcdefghijklmnopqrstuvwxyz"
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {  
        if (!board[row][col]) board[row][col] = letters[Math.floor(Math.random()*letters.length)]
      }
    }
    return board
  }

}


const newBoardData = (dimensions, totalWords) => {
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



module.exports = newBoardData
