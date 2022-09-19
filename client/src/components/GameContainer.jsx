import React, {useState, useEffect} from "react";
import { ReactP5Wrapper } from "react-p5-wrapper";
import WordList from "./WordList";
import GameCompleted from "./GameCompleted";
import MultiplayerScore from "./MultiplayerScore"

// import sketch from "../assets/sketch";

//TODO:CREATE CLAUSE THAT CYCLES THROUGH VARIOUS WORD LIST SIZES AND REATTEMPTS FAILED BOARDS
//TODO: limit board size to no smaller than 10x10 and no greater than 25x25 and increments of 5
//TODO: handle error of no boards being returned
// let boardInfo = new CreateBoard(); //default 20 x 20 board, with 30 words
// let newBoard = boardInfo.generateBoard();
// let boardWordList = newBoard.answers.map(elem => elem.word);
// let wordListStatus = boardWordList.map(elem => {
//     return {
//       word: elem,
//       found: false
//     };
// })

//TODO: for multiplayer, refactor to only update values serverside

function GameContainer(props) {

  let [boardState, updateBoardState] = useState(props.board);
  let [wordStatuses, setWordStatus] = useState(props.wordListStatus);
  let [answerKey, setAnswerKey] = useState(props.answerKey);
  let [foundWordData, updateFoundWordData] = useState(props.lines);
  let [gameCompleted, setGameCompleted] = useState(false);
  let [multiPlayerState, setMultiPlayerState] = useState(props.multiPlayerState);
  let [multiPlayerId, setMultiPlayerId] = useState(props.multiPlayerId);
  let [isMPgameCompleted, setMPGameCompleted] = useState(props.isMPgameCompleted);

  let [showNGButton, setShowNGButton] = useState(false);


  useEffect(() => {
    updateBoardState(props.board);
    setWordStatus(props.wordListStatus)
    setAnswerKey(props.answerKey)
    setMultiPlayerState(props.multiPlayerState)
    updateFoundWordData(props.lines)
    setMultiPlayerId(props.multiPlayerId)
    setMPGameCompleted(props.isMPgameCompleted)

    if (gameCompleted){
        setTimeout(() => {
          setShowNGButton(true)
      }, 1000);
    }
    
  }, [gameCompleted,
    props.board,
    props.wordListStatus,
    props.answerKey,
    props.multiPlayerState,
    props.lines,
    props.multiPlayerId,
    props.isMPgameCompleted]);



  function checkAnswer(answerLine){
    let [start,end] = answerLine;
    // if either mouse up or down coordinates fall outside of canvas bounds
    if (!(start) || !(end)) return false

    // check if coordinates match for word in forward direction
    let directionOne = answerKey.find(elem => {
      return start.row === elem.row && start.col === elem.col && end.row === elem.endRow && end.col === elem.endCol
    })

    // check if coordinates match for word in reverse direction
    let directionTwo = answerKey.find(elem => {
      return start.row === elem.endRow && start.col === elem.endCol && end.row === elem.row && end.col === elem.col
    })
    
    return directionOne || directionTwo
  }

  function checkIfGameComplete(){
    // check if all words are found
    return wordStatuses.every(elem => elem.found === true)
  }

  function removeWordFromList(word){
    //update status of found word
    wordStatuses = wordStatuses.map(elem => {
      if (elem.word === word) elem.found = true
      return elem
    })
    //TODO: ONLY CHECK LOCALLY IF SINGLE PLAYER GAME
    let isGameFinished = checkIfGameComplete()

    //set state of above values
    if(!multiPlayerState) setGameCompleted(isGameFinished) 
    setWordStatus(wordStatuses)
  }

  function sendLinesToApp(linesAndWord){
    //updates to be processed server side
    if (multiPlayerState){
      props.sendUpdatesToServer(linesAndWord)
      // console.log(linesAndWord)
    }

  }
  
  const checkMultiplayerState = () => {
    return multiPlayerState
  }

  // console.log(wordStatuses)
  // console.log(foundWordData)
// console.log(`playing multi? ${multiPlayerState}`)


  function GameCompletedOutput({multiPlayerState, gameCompleted,isMPgameCompleted}) {

    if (multiPlayerState && isMPgameCompleted) {
      return <h1 className="game-completed">muli game-completed</h1>;
    } else if (gameCompleted)
     return <h1 className="game-completed">SINGLE player Game Completed!!!</h1>;
  }

  

  return (
    <>
      <div className="game-container">
      
        <ReactP5Wrapper  
          board={boardState}
          sketch={props.sketch}
          //TODO: remove this before deployment
          answerKey={answerKey}
          checkAnswer={checkAnswer}
          removeWordFromList={removeWordFromList}
          foundWordData={foundWordData} 
          sendLinesToApp={sendLinesToApp}
          checkMultiplayerState={checkMultiplayerState}
        />

        <WordList 
          wordListStatus={wordStatuses}
          multiPlayerId={multiPlayerId}
          multiPlayerState={multiPlayerState} 
          />
      </div> 

      {/* {/TODO: Dress up in future} */}
      {/* {  multiPlayerState &&  <h1 className="muli game-completed">muli game-completed</h1>} */}
      {multiPlayerState && <MultiplayerScore 
        wordStatuses={wordStatuses}
        multiPlayerId={multiPlayerId}
      />
      }


      <GameCompleted 
      multiPlayerState={multiPlayerState} 
      gameCompleted={gameCompleted}
      isMPgameCompleted={isMPgameCompleted}
      />

      {/* {showNGButton && <button onClick={}>New Game</button>} */}

    </>
  );
}

export default GameContainer;
