import React from "react";

function Loading (props){
    
    return (
        <div className="loading">
           <h3>Searching for competitor</h3>
           <div class="lds-roller"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
        </div>
    )
}

export default Loading