import React, {useState, useEffect} from "react";
import { ReactP5Wrapper } from "react-p5-wrapper";
import WordList from "./WordList";
import CompetedGameText from "./CompetedGameText";
import MultiplayerScore from "./MultiplayerScore";

function GameContainer(props) {

  let [boardState, updateBoardState] = useState(props.board);
  let [wordStatuses, setWordStatus] = useState(props.wordListStatus);
  let [answerKey, setAnswerKey] = useState(props.answerKey);
  let [foundWordData, updateFoundWordData] = useState(props.lines);
  let [multiPlayerId, setMultiPlayerId] = useState(props.multiPlayerId);

  // update all values on rerender
  useEffect(() => {
    updateBoardState(props.board);
    setWordStatus(props.wordListStatus)
    setAnswerKey(props.answerKey)
    updateFoundWordData(props.lines)
    setMultiPlayerId(props.multiPlayerId)

  }, [props.board,
    props.wordListStatus,
    props.answerKey,
    props.multiPlayerState,
    props.lines,
    props.multiPlayerId,
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
    // each time a word is found, recheck to see if the game is completed
    let isGameFinished = checkIfGameComplete()

    props.setIsGameCompleted(isGameFinished) 
  
    setWordStatus(wordStatuses)
  }

  const sendLinesToApp = (linesAndWord) => {
    //updates to be processed server side
    if (props.multiPlayerState){
      props.sendUpdatesToServer(linesAndWord)
    }

  }
  
  const checkMultiplayerState = () => {
    return props.multiPlayerState
  }

  const updateGameState = () => {
    props.setIsGameCompleted(true);
  }


  return (
    <>
      <div className="game-container">
      
        <ReactP5Wrapper  
          board={boardState}
          sketch={props.sketch}
          checkAnswer={checkAnswer}
          removeWordFromList={removeWordFromList}
          foundWordData={foundWordData} 
          sendLinesToApp={sendLinesToApp}
          checkMultiplayerState={checkMultiplayerState}
        />

        <WordList 
          wordListStatus={wordStatuses}
          multiPlayerId={multiPlayerId}
          multiPlayerState={props.multiPlayerState} 
          />
      </div> 

      {props.multiPlayerState && <MultiplayerScore 
        wordStatuses={wordStatuses}
        multiPlayerId={multiPlayerId}
        updateGameState={updateGameState}
      />
      }

      {props.isGameCompleted && <CompetedGameText 
      multiPlayerState={props.multiPlayerState} 
      isGameCompleted={props.isGameCompleted}
      />
      }
    </>
  );
}

export default GameContainer;
