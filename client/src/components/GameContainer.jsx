import React, {useState, useEffect} from "react";
import { ReactP5Wrapper } from "react-p5-wrapper";
import WordList from "./WordList";
import CompetedGameText from "./CompetedGameText";
import MultiplayerScore from "./MultiplayerScore";
// import { GameCompletedContext } from "../contexts/GameCompletedContext";

//TODO: for multiplayer, refactor to only update values serverside

function GameContainer(props) {
//{sketch, boardState, answerKey, linesState, sendUpdatesToServer, boardWordList, wordStatuses, multiPlayerState, multiPlayerId, resetGame}

  // const {isGameCompleted, setIsGameCompleted} = useContext(GameCompletedContext)

  let [boardState, updateBoardState] = useState(props.board);
  let [wordStatuses, setWordStatus] = useState(props.wordListStatus);
  let [answerKey, setAnswerKey] = useState(props.answerKey);
  let [foundWordData, updateFoundWordData] = useState(props.lines);
  let [multiPlayerState, setMultiPlayerState] = useState(props.multiPlayerState);
  let [multiPlayerId, setMultiPlayerId] = useState(props.multiPlayerId);
  // let [isMPgameCompleted, setMPGameCompleted] = useState(props.isMPgameCompleted);



  useEffect(() => {
    updateBoardState(props.board);
    setWordStatus(props.wordListStatus)
    setAnswerKey(props.answerKey)
    setMultiPlayerState(props.multiPlayerState)
    updateFoundWordData(props.lines)
    setMultiPlayerId(props.multiPlayerId)
    // setMPGameCompleted(props.isMPgameCompleted)

  }, [props.board,
    props.wordListStatus,
    props.answerKey,
    props.multiPlayerState,
    props.lines,
    props.multiPlayerId,
    // props.isMPgameCompleted
  ]);


  const checkAnswer = (answerLine) => {
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


  const checkIfGameComplete = () => {
    // check if all words are found
    return wordStatuses.every(elem => elem.found === true)
  }


  const removeWordFromList = (word) => {
    //update status of found word
    wordStatuses = wordStatuses.map(elem => {
      if (elem.word === word) elem.found = true
      return elem
    })

    //TODO: ONLY CHECK LOCALLY IF SINGLE PLAYER GAME
    let isGameFinished = checkIfGameComplete()

    // set state of above values
    if(!multiPlayerState) props.setIsGameCompleted(isGameFinished) 
  
    setWordStatus(wordStatuses)
  }

  const sendLinesToApp = (linesAndWord) => {
    //updates to be processed server side
    if (multiPlayerState){
      props.sendUpdatesToServer(linesAndWord)
      // console.log(linesAndWord)
    }

  }
  
  const checkMultiplayerState = () => {
    return multiPlayerState
  }

  const updateGameState = () => {
    props.setIsGameCompleted(true);
  }

  const resetGameContainer = () => {
    //reset single player values
    props.resetGame();
    props.setIsGameCompleted(false) 
  }


  useEffect(() => {
    // let isGameFinished = checkIfGameComplete()

    // if (isGameFinished)  {
    //  props.setIsGameCompleted(isGameFinished)
    // }
    console.log(`game status from container UF ${props.isGameCompleted}`)
  }//, [props.isGameCompleted]
  );



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
        updateGameState={updateGameState}
      />
      }


      {props.isGameCompleted && <CompetedGameText 
      multiPlayerState={multiPlayerState} 
      resetGame={resetGameContainer}
      isGameCompleted={props.isGameCompleted}
      // isMPgameCompleted={isMPgameCompleted}
      />
      }
    </>
  );
}

export default GameContainer;
