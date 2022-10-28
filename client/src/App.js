import React, {useState, useEffect} from 'react'
import GameContainer from './components/GameContainer'
import Loading from './components/Loading'
import io from "socket.io-client";
import { BoardData } from "./assets/GenerateBoardInfo";
import sketch from "./assets/sketch";

const socket = io.connect("http://localhost:3001");
let id;

//TODO:CREATE CLAUSE THAT CYCLES THROUGH VARIOUS WORD LIST SIZES AND REATTEMPTS FAILED BOARDS
//TODO: limit board size to no smaller than 10x10 and no greater than 25x25 and increments of 5

function App() {
  let boardDimensions = 10;
  let totalWords = 3;

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
    setMultiPlayerState(true);
    id = socket.id;
    setMultiPlayerId(id)
    let data = {userId: id, boardDimensions, totalWords}
    socket.emit("join_room",data)
  }

  const startGame = (gameMode = "single") => {
    let currentMultiState = (gameMode === "multi") ? true : false;

    setIsGameCompleted(false);
    resetGame();

    if(!currentMultiState){ // start single player game
      console.log("starting new single game")
      setMultiPlayerState(false);
      // socket.emit("leave_room", id);
    } else { // start multi player game
      console.log("starting new multi game")
      // socket.emit("leave_room", id);
      join_room();
    }

  }

  const resetGame = (gameMode) => {
    console.log("reseting game")
    socket.emit("leave_room", id);
    let {newBoard, wordListStatus} = BoardData(boardDimensions,totalWords);

    updateBoardState(newBoard.board);
    setWordStatus(wordListStatus)
    setAnswerKey(newBoard.answers)
    updateLinesState([])

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
      console.log(boardUpdates)
      updateLinesState(boardUpdates.lines)
      setWordStatus(boardUpdates.wordStatus)
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
      <header className='header'>
        <div className='game-mode'>
          <button className='button-54' onClick={() =>  startGame()}  disabled={!multiPlayerState}><h1>Single Player</h1></button> 
          <button className='button-54' onClick={() => startGame("multi")}  disabled={multiPlayerState}> <h1>MultiPlayer</h1></button>
        </div>
        <div className='options'>
          {/* <button className='button-54 sound-toggle' > 
            <div className='sound-toggle'>sound</div>
          </button> */}
          <div>
            <label htmlFor="cars">Total words:</label>
             <select id="word-count" >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>
        </div>
      </header>

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

