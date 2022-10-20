import React,{useContext} from "react";
import { GameCompletedContext } from "../contexts/GameCompletedContext";


function CompetedGameText ({multiPlayerState, resetGame}){
    
    const {isGameCompleted} = useContext(GameCompletedContext)

    let output;
    if (!isGameCompleted) output = "";


    //TODO: change to something more presentable
    if (isGameCompleted){
        if (multiPlayerState) 
            output = "muliplayer game-completed";
        else
            output = "SINGLE player game-completed";
    }
// 
    // useEffect(() => {
    //     // if (isGameCompleted){
    //     //     setTimeout(() => {
    //     //       setShowNGButton(true)
    //     //   }, 1000);
    //     // }
    // }, [isGameCompleted,]);
    
    return (
        <div className="game-completed">
            <h1>{output}</h1>
        </div>
    )
}

export default CompetedGameText