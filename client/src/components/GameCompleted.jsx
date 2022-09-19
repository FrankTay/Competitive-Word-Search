import React from "react";

function GameCompleted ({multiPlayerState, gameCompleted,isMPgameCompleted}){
    let time = 0;
    let output = "";
    if (multiPlayerState && isMPgameCompleted) {
        output = "muliplayer game-completed";
        
        // return <h1 className="game-completed">muliplayer game-completed</h1>;
      } else if (gameCompleted)
        output = "SINGLE player game-completed";
    //    return <h1 className="game-completed">SINGLE player Game Completed!!!</h1>;
    function showButton(){
        setTimeout(() => {
            <h1 className="game-">"dalsghaohgoasdhgoahs"</h1>
        }, 1000);
    }
    return (
        <div>
            <h1 className="game-completed">{output}</h1>
            <div>{showButton()}</div>
        </div>
    )
}

export default GameCompleted