import React, {useState, useEffect} from 'react'
import GameContainer from './components/GameContainer'
import Loading from './components/Loading'
// import Navbar from './components/NavBar';
import io from "socket.io-client";
import { BoardData } from "./assets/GenerateBoardInfo";
import sketch from "./assets/sketch";
// import { GameCompletedContext } from './contexts/GameCompletedContext';

const socket = io.connect("http://localhost:3001");
let id;

//TODO:CREATE CLAUSE THAT CYCLES THROUGH VARIOUS WORD LIST SIZES AND REATTEMPTS FAILED BOARDS
//TODO: limit board size to no smaller than 10x10 and no greater than 25x25 and increments of 5
//TODO: handle error of no boards being returned

function App() {
  let boardDimensions = 10;
  let totalWords = 1;

  let {newBoard,wordListStatus} = BoardData(boardDimensions,totalWords);

  let [boardState, updateBoardState] = useState(newBoard.board);
  let [answerKey, setAnswerKey] = useState(newBoard.answers);
  let [wordStatuses, setWordStatus] = useState(wordListStatus);
  let [linesState, updateLinesState] = useState([]);
  let [multiPlayerState, setMultiPlayerState] = useState(false);
  let [multiPlayerId, setMultiPlayerId] = useState(null);
  let [isMPgamePending, setIsMPgamePending] = useState(false);
  let [isGameCompleted, setIsGameCompleted] = useState(false);


  const sendUpdatesToServer = (linesAndWord) => {
    if (multiPlayerState) socket.emit("found_word_data",linesAndWord);
  }

  const join_room = () => {
    //TODO: Create new board on playing multiplayer
    setMultiPlayerState(true);
    id = socket.id;
    setMultiPlayerId(id)

    let data = {board: boardState, userId: id, words: wordStatuses, answers: answerKey}
    socket.emit("join_room",data)
  }

  // const toggleGameMode = () => {
  //   setIsGameCompleted(false);
  //   console.log(isGameCompleted)
  //   setMultiPlayerState(prev => {
  //     console.log(`start a ${!prev ? "multiplayer": "single" } game`);
      
      
  //     return !prev;
  //   })
  //   startGame(!multiPlayerState)
  // }

  const startGame = (gameMode = "single") => {
    let currentMultiState = (gameMode === "multi") ? true : false;

    setIsGameCompleted(false);
    resetGame();
    if(!currentMultiState){
      console.log("starting new single game")
      // console.log(` words are ${wordStatuses[0].word}`)
      setMultiPlayerState(false);
      // setIsMPgamePending(false)
      socket.emit("leave_room", id);
      // resetGame();
    } else {
      console.log("starting new multi game")
      //leave any current room
      // setMultiPlayerState(true);
      socket.emit("leave_room", id);
      join_room();
    }

  }

  const resetGame = (gameMode) => {
    //reset single player values
    // setIsGameCompleted(false);
    console.log("reseting game")
    let {newBoard, boardWordList, wordListStatus} = BoardData(boardDimensions,totalWords);

    updateBoardState(newBoard.board);
    setWordStatus(wordListStatus)
    setAnswerKey(newBoard.answers)
    // setMultiPlayerState(props.multiPlayerState)
    updateLinesState([])
    // setGameCompleted(false)
    // setMultiPlayerId(props.multiPlayerId)
    console.log(` words are ${wordStatuses[0].word}`)

  }

  useEffect(() => {
    
    socket.on("join_room", (roomData) => {
      //TODO clear any lines from previous game
      console.log("ROOM JOINED")
      console.log(roomData)
      updateBoardState(roomData.board)
      setWordStatus(roomData.words)
      setAnswerKey(roomData.answers)
      // setMPGameCompleted(false)

      if (roomData.occupants.length === 1){
        console.log("awaiting contender")
        setIsMPgamePending(true)
      } else {
        console.log("starting game")
        setIsMPgamePending(false)
      }

    });

    socket.on("found_word_data", (boardUpdates) => {
      // console.log("got some lines back")
      console.log(boardUpdates)
      updateLinesState(boardUpdates.lines)
      setWordStatus(boardUpdates.wordStatus)
      // setMPGameCompleted(boardUpdates.isGameComplete)
    });

    socket.on("competitor_left_room", (data) => {
      //competitor left the room prematurely
      //return to waiting for new competitor state

      console.log("ya boy lefgt")
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('join_room');
      socket.off('found_word_data');
      socket.off('competitor_left_room');
    };
  }, [boardState,
    wordStatuses,
    answerKey,
    isMPgamePending,
    isGameCompleted
    // isMPgameCompleted,
  ]);


  return (
    <div>
    {/* <Navbar/> */}
      <div className='game-mode'>
      {/* TODO: add button to return to single player and set multiPlayer mode to false */}
        <button className='button-54' onClick={() =>  startGame()}  disabled={!multiPlayerState}><h1>Single Player</h1></button> 
        <button className='button-54' onClick={() => startGame("multi")}  disabled={multiPlayerState}> <h1>MultiPlayer</h1></button>
        {/* <button className='button-54' onClick={() => setIsGameCompleted(false)} > <h1>CHANGE gamecomp state</h1></button> */}
      </div>

      <div className='new-game-button'>
        <button className='button-54' onClick={() => startGame()}><h4>New Game</h4></button>
      </div>

      {(multiPlayerState && isMPgamePending) && <Loading />} 
      <div className={(multiPlayerState && isMPgamePending) ? "hide-container": "show-container"}>
          <GameContainer 
            sketch={sketch}
            board={boardState}
            answerKey={answerKey}
            lines={linesState}
            sendUpdatesToServer={sendUpdatesToServer}
            // boardWordList={boardWordList}
            wordListStatus={wordStatuses} 
            multiPlayerState={multiPlayerState}
            setMultiPlayerState={setMultiPlayerState}
            multiPlayerId={multiPlayerId}
            resetGame={resetGame} 
            isGameCompleted={isGameCompleted}
            setIsGameCompleted={setIsGameCompleted}  
          />
      </div>
    </div>
  )
}

export default App

