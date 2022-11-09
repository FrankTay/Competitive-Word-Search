
function sketch(p5) {
    let gameBoard;
    let checkAnswer;
    let removeWordFromList;
    let foundWordData;
    let sendLinesToApp;
    let checkMultiplayerState;
    
    //p5 wrapper built in function for prop handling
    p5.updateWithProps = props => { 
        gameBoard = props.board;
        foundWordData = props.foundWordData;
        checkAnswer = props.checkAnswer;
        removeWordFromList = props.removeWordFromList;
        sendLinesToApp = props.sendLinesToApp;
        checkMultiplayerState = props.checkMultiplayerState;
    }

    let mainFont = "Montserrat";
    // let fontToLoad;
    let startX, startY, boardArea;
    let letterCoords = [];
    let lettersMoused = [];
    let colorPerLine = [];
    let wordsFound = []; // to keep track words found by local client
    let squareSize = 28;
    let fontSize = 18;
    let squareXYStartCoord = 1;
    let textXStartPos = Math.floor(squareSize/2)+1 // 15
    let textYStartPos = squareSize * 0.75 // 21
    let squareXBoundStart = 2;
    let squareYBoundStart = 2;
    let squareXBoundEnd = 28;
    let squareYBoundEnd = 28;
    let tranparentBlue = "rgba(0, 0, 255, 0.25)"
    let tranparentRed = "rgba(255, 0, 0, 0.25)"
    let randColor = getRandColor();

    const drawLinesOfFoundWords = () => {
      let multiPlayerState = checkMultiplayerState()

      foundWordData.forEach( (elem,i) => {
        // compare words found locally to those found by other player and set distinct color
        if (multiPlayerState){ 
          wordsFound.includes(elem.word) ? p5.stroke(tranparentBlue) : p5.stroke(tranparentRed); 
        } else {
          p5.stroke(colorPerLine[i])
        }

        p5.line(elem.coordinates.x1, elem.coordinates.y1, elem.coordinates.x2, elem.coordinates.y2);
      });
    }
    
    //TODO: PRELOAD NOT WORKING?
    p5.preLoad = () =>{

    }

    p5.setup = () => {
      p5.textFont(mainFont)
      checkForUpdatedProps()
      let gridSize = gameBoard.length; 
      boardArea = squareSize * gridSize + 2 // +2 compensates for left and top border
      p5.createCanvas(boardArea, boardArea);
      p5.noLoop();
      // console.log(boardArea)

    }

    p5.draw = () => {
      
      setGrid(gameBoard)
      p5.strokeWeight(20) // drawing line thickness
      drawLinesOfFoundWords()
      let multiPlayerState = checkMultiplayerState();
      multiPlayerState ? p5.stroke(tranparentBlue) : p5.stroke(randColor);
      
    }
    
    //set and temporarily save coordinates of where mouse down occured
    p5.mousePressed = () => {
      // resetBoardData()
      startX = p5.mouseX;
      startY = p5.mouseY;
       // dont draw line if intial click was made outside of board area
      if (!isClickInbounds(startX,startY,boardArea)) return;

      // console.log(startX,startY,boardArea)
      lettersMoused.push( findLetterFromCoordinate(startX,startY))
    }
    //on each drag action, clear the last line, rerun draw function and draw a new line
    p5.mouseDragged = () => {
      p5.clear()
      resetBoardData()  
      // dont draw line if intial click was made outside of board area
      if (!isClickInbounds(startX,startY,boardArea)) return;
      // p5.stroke(tranparentBlue) 
      p5.line(startX,startY,p5.mouseX,p5.mouseY);
    }

    // actions for mouseUp
    p5.mouseReleased = () => {
      lettersMoused.push( findLetterFromCoordinate(p5.mouseX,p5.mouseY)) // temp save coord of where mouse up occured
      let lettersCheckedResult = checkAnswer(lettersMoused); // check 
      let [firstLetter,secondLetter] = lettersMoused;
      // console.log(lettersMoused[0],lettersMoused[1])

      // console.log(`letters moused = ${firstLetter},${secondLetter}`)
      // console.log(lettersCheckedResult)
      
      //if word in list and has not been previously, found based on drawn lines, store then line, else clear it off
      if (lettersCheckedResult && !(wordsFound.includes(lettersCheckedResult.word))) {

        wordsFound.push(lettersCheckedResult.word)
        
        //updates status of found word and checks if game is complete TODO: Move this call to be run in sendlines app
        removeWordFromList(lettersCheckedResult.word)
        // adds line over found word, adjusted to center of cells
        foundWordData.push({
          word: lettersCheckedResult.word,
          coordinates: {x1: firstLetter.centerX, y1: firstLetter.centerY, x2: secondLetter.centerX, y2: secondLetter.centerY}
          });
        //send line drawn coodinates and word found to server if necessary
        sendLinesToApp(foundWordData)
        // remember color of line drawn over previously found word 
        colorPerLine.push(randColor)
        // set new color for next word
        randColor = getRandColor();

      } else {
        p5.clear()
      }
      // reset the temporary save of coordinates of mouse down and mouse up
      lettersMoused.length = 0;
      resetBoardData()
    }
    
    function setGrid(board){

      let boardLen = board.length;
      p5.pop()
      // p5.textFont('C:/Users/Presto/Documents/local dev/React apps/Competitive-Word-Search/client/src/assets/font/Montez-Regular.ttf')
      // p5.textFont("font/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw0aXpsog.woff2")
      // p5.textFont("https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Hw5aXo.woff2")
      // p5.textFont(mainFont)
      // p5.background(244);
      p5.strokeWeight(1)
      p5.stroke("#000000")
      p5.textSize(fontSize)
      
      p5.textAlign(p5.CENTER)
        for (let row = 0, 
           squareYPos = squareXYStartCoord, 
           textYPos = textYStartPos,
           squareYStartBounds = squareYBoundStart,
           squareYEndBounds = squareYBoundEnd; 
           row < boardLen; 
           row++, 
           squareYPos+=squareSize, 
           textYPos+=squareSize,
            squareYStartBounds +=squareSize,
            squareYEndBounds +=squareSize) {
        
          for (let col = 0, 
              squareXPos = squareXYStartCoord, 
              textXPos = textXStartPos,
              squareXStartBounds = squareXBoundStart,
              squareXEndBounds = squareXBoundEnd; 
              col < boardLen; 
              col++, 
              squareXPos+=squareSize, 
              textXPos+=squareSize,
              squareXStartBounds +=squareSize,
              squareXEndBounds +=squareSize) {
                p5.fill(255) // background color
                p5.square(squareXPos,squareYPos, squareSize)
                p5.fill(1) //font color
                p5.text(board[row][col].toUpperCase(),textXPos, textYPos)
    
                letterCoords.push({
                  letter: board[row][col],
                  x1: squareXStartBounds,
                  y1: squareYStartBounds,
                  x2: squareXEndBounds,
                  y2: squareYEndBounds,
                  row: row,
                  col: col,
                  centerX: textXPos, //if square size 28
                  centerY:textYPos-6 //if square size 28
                })
          }
      }
    
      p5.push()
    }

    function findLetterFromCoordinate(x,y){
      let foundPosition = letterCoords.find(elem => x >= elem.x1 && x <= elem.x2 && y >= elem.y1 && y <= elem.y2 )
      // console.log(foundPosition)
      return foundPosition
    }
    
    // function circ(x,y){
    //   p5.push()
    //   p5.stroke("red")
    //   p5.circle(x,y,5)
    //   p5.pop()
    // }
    
    function getRandColor(){
      let colors = ["165,42,42","0,65,255","50,50,50","0,128,0","255,165,0","64,0,255","255,0,0","255,128,0"]
      //                light red      blue      grey     green     gold     purple       red        orange

      return `rgba(${colors[Math.floor(Math.random()*colors.length)]},0.35)`

    }


    function checkForUpdatedProps(oldBoard,oldLines) {
      oldBoard === undefined && (oldBoard = gameBoard);
      oldLines === undefined && (oldLines = foundWordData); //TODO: foundWordData may not need to be monitored here, it can probably be checked from a function in game container
      let clearcheck = setInterval(repeatcheck,20,oldBoard,oldLines);
      function repeatcheck(oldBoard,oldLines) {
          if (gameBoard !== oldBoard || foundWordData !== oldLines) {
              // do something
              // if (gameBoard !== oldBoard) console.log("New Board")
              // if (foundWordData !== oldLines) console.log("new lines")

              clearInterval(clearcheck);
              resetBoardData()
              checkForUpdatedProps()
          }
      }
    }


    function resetBoardData(){
      letterCoords.length = 0;
      p5.redraw()
    }

    function isClickInbounds(x,y,boardArea){
      return x < boardArea && x > 0 && y < boardArea && y > 0
    }
    
 }

 export default sketch