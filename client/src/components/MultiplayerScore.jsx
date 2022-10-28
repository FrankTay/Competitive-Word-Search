import React, {useEffect} from 'react'

function MultiplayerScore({wordStatuses,multiPlayerId,updateGameState}){
    const myId = multiPlayerId;
    const total = wordStatuses.length;

    const wordsFoundByMe = wordStatuses.filter((elem) => {
      if (myId && (elem.foundBy === myId)) 
      return elem
    }) 

    const wordsFoundByOpp = wordStatuses.filter((elem) => {
      if (elem.foundBy && (elem.foundBy !== myId)) {
        return elem
      }
    }) 

    const myPercentageFound = Math.round((wordsFoundByMe.length / total) * 100);
    const opponentPercentageFound = Math.round((wordsFoundByOpp.length / total) * 100);
    let gameOutcome;

    //TODO:  set to conditionals
    if (myPercentageFound === 50 && opponentPercentageFound === 50) gameOutcome = "TIE";
    if (myPercentageFound > 50) gameOutcome = "You win";
    if (opponentPercentageFound > 50 ) gameOutcome = "You lose";


    useEffect(() => {
      if (gameOutcome) updateGameState();
    })

    return (
      <div className="multiplayer-tally">
        <div className="scores">
            <h2>Me: {myPercentageFound}%</h2>
            <h2>Opponent: {opponentPercentageFound}%</h2>
        </div>
          
          {gameOutcome && <h2>{gameOutcome}</h2>}
      </div>
      
    )

  }

  export default MultiplayerScore;
