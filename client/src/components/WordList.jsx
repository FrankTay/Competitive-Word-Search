import React from "react";

function WordList (props){
    //TODO: sort or randomize word list
    let words = props.wordListStatus;
    let myId = props.multiPlayerId;
    let multiPlayerState = props.multiPlayerState
    
    let wordLIs = words.map((obj,index) => {
        //if playing multiplayer
        if (multiPlayerState) {
            if ((obj.found) && (obj.foundBy) && obj.foundBy !== myId ) return <li key={index} className="list-item word-found"> {obj.word.toUpperCase()} </li>
            if (obj.found) return <li key={index} className="list-item word-found-by-me"> {obj.word.toUpperCase()} </li>
        }

        if (obj.found) return <li key={index} className="list-item word-found"> {obj.word.toUpperCase()} </li>
        return <li key={index} className="list-item"> {obj.word.toUpperCase()} </li>
    });

    return (
        <div>
            <ul className="word-list">
                {wordLIs}
            </ul>
        </div>
    )
}

export default WordList