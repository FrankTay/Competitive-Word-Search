import React, {useState, useEffect} from 'react'
import GameContainer from './components/GameContainer'
import Loading from './components/Loading'

import io from "socket.io-client";
import CreateBoard from "./assets/CreateBoard";
import sketch from "./assets/sketch";

const socket = io.connect("http://localhost:3001");

//TODO:CREATE CLAUSE THAT CYCLES THROUGH VARIOUS WORD LIST SIZES AND REATTEMPTS FAILED BOARDS
//TODO: limit board size to no smaller than 10x10 and no greater than 25x25 and increments of 5
//TODO: handle error of no boards being returned


function App() {
  let boardInfo = new CreateBoard(10, 1); //default 20 x 20 board, with 30 words
  let newBoard = boardInfo.generateBoard();
  let boardWordList = newBoard.answers.map(elem => elem.word);
  let wordListStatus = boardWordList.map(elem => {
    return {
      word: elem,
      found: false,
      foundBy:null
    };
  })


  let [boardState, updateBoardState] = useState(newBoard.board);
  let [answerKey, setAnswerKey] = useState(newBoard.answers);
  let [wordStatuses, setWordStatus] = useState(wordListStatus);
  let [linesState, updateLinesState] = useState([]);
  let [multiPlayer, setMultiPlayer] = useState(false);
  let [multiPlayerId, setMultiPlayerId] = useState(null);
  let [isMPgamePending, SetIsMPgamePending] = useState(false);
  let [isMPgameCompleted, setMPGameCompleted] = useState(null);

  // console.log(`is multi game complete(FROM APP)? ${isMPgameCompleted}`)

  
  function sendUpdatesToServer(linesAndWord){
    // TODO: only send if in multplayer mode, MAKE SURE 2 USERS ARE IN ROOM AS WELL(handle 2nd part server)
    if (multiPlayer) socket.emit("found_word_data",linesAndWord);
  }

  const join_room = () => {
    //TODO: Create new board on playing multiplayer
    setMultiPlayer(true);
    const id = socket.id;
    setMultiPlayerId(id)
    let data = {board: boardState, userId: id, words: wordStatuses, answers: answerKey}
    socket.emit("join_room",data)
  }

  const startSinglePlayerGame = () => {
    //TODO:disconnect socket and remove from any rooms
    //TODO: set multiplayer state back to false
    //TODO:
    setMultiPlayer(false);
    socket.emit("disconnect")
  }

  useEffect(() => {

    socket.on("join_room", (roomData) => {
      //TODO clear any lines from previous game
      console.log("ROOM JOINED")
      console.log(roomData)
      updateBoardState(roomData.board)
      setWordStatus(roomData.words)
      setAnswerKey(roomData.answers)
      setMPGameCompleted(false)

      if (roomData.occupants.length === 1){
        console.log("awaiting contender")
        SetIsMPgamePending(true)
      } else {
        console.log("starting game")
        SetIsMPgamePending(false)
      }

    });

    socket.on("found_word_data", (boardUpdates) => {
      // console.log("got some lines back")
      console.log(boardUpdates)
      updateLinesState(boardUpdates.lines)
      setWordStatus(boardUpdates.wordStatus)
      setMPGameCompleted(boardUpdates.isGameComplete)
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('join_room');
      socket.off('found_word_data');
    };
  }, [boardState,wordStatuses,answerKey,isMPgamePending,isMPgameCompleted]);


  return (
    <div>
      <div className='game-mode'>
      {/* TODO: add button to return to single player and set multiPlayer mode to false */}
        <button className='singlePlayer' onClick={startSinglePlayerGame}  disabled={!multiPlayer}><h1>Single Player</h1></button>
        <button onClick={join_room}><h1>MultiPlayer</h1></button>
      </div>
      {(multiPlayer && isMPgamePending) && <Loading />} 
      <div className={(multiPlayer && isMPgamePending) ? "hide-container": "show-container"}>
        <GameContainer 
          sketch={sketch}
          board={boardState}
          answerKey={answerKey}
          lines={linesState}
          sendUpdatesToServer={sendUpdatesToServer}
          boardWordList={boardWordList}
          wordListStatus={wordStatuses}
          multiPlayerState={multiPlayer}
          multiPlayerId={multiPlayerId}
          isMPgameCompleted={isMPgameCompleted}
        />
      </div>
    </div>
  )
}

export default App