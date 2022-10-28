const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');

const newBoardData = require("./CreateBoard.js");
const { Console } = require("console");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

let roomsData = [] // elements are an objects with > roomId: str, occupants: set, data: array
function findRoomContainingUser(userId) {
  return roomsData.find(elem => elem.occupants.has(userId))
};


function removeUserFromRooms(userId) {
  return roomsData.map(elem => {
    if (elem.occupants.has(userId)) elem.occupants.delete(userId);
    return elem;
  });
}

function deleteEmptyRooms() { 
  //TODO: remove room and user if words found, but only one user exists
  return roomsData.filter(elem => {
          if (elem.occupants.size) return elem;
        });
}

io.on("connection", (socket) => {

  let user = socket.id
  console.log(`User Connected: ${user}`);
  // console.log(socket)


  socket.on("join_room", (data) => {
     //reject if user is already in a room
    let userAlreadyInRoom = roomsData.find(elem => elem.occupants.has(data.userId))
    if (userAlreadyInRoom) return
    
    let roomToJoin;

    //get index of 1st room with 1 person awaiting a competitor
    const availableRoomIndex = roomsData.findIndex(elem => {
      return elem.occupants.size === 1 && 
      (!elem.gameComplete) &&// and game is not already completed
      elem.words.every( word => word.found === false)// no words have been found yet
    });
    
    //if no rooms at all or all rooms are full
    if (!roomsData.length || availableRoomIndex < 0) {    
      let roomId = uuidv4(); // establish unique room Id

      let {newBoard,wordListStatus} = newBoardData(data.boardDimensions,data.totalWords);

      let roomData = {
                      roomId:roomId,
                      occupants:new Set([data.userId]),
                      board: newBoard.board,
                      words: wordListStatus,
                      answers: newBoard.answers,
                      lines: null,
                      gameComplete: false
                    };

      roomsData.push(roomData); // add room to rooms record and add user to room
      roomToJoin = roomId;
      // socket.join(roomToJoin);
    } else {  // room available (1 player awaiting opponent)
      //place pending player in available room
      roomsData[availableRoomIndex].occupants.add(data.userId); //  add to user to room record
      roomToJoin = roomsData[availableRoomIndex].roomId;
      console.log(`JOINING ROOM: ${roomsData[availableRoomIndex].roomId}`)
    }
     
    socket.join(roomToJoin); // join user to room   
    // roomsData.forEach(elem => console.log(elem.roomId,elem.occupants,elem.words))
    let gameData =  roomsData.find(elem => elem.roomId === roomToJoin)

    // console.log(gameData)
    io.to(roomToJoin).emit('join_room', // send the board back to the client 
      {...gameData, occupants:[...gameData.occupants] } // serialize occupants as Sets cannot be sent
    ); 

  }); 

  //TODO: remove when ready to deploy
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("receive_message", data);
  });
 
 
  socket.on("found_word_data", (foundWordandLinesObj) => {

    let indvRoomDataIndex = roomsData.findIndex(elem => elem.occupants.has(user)) 
    let roomId = roomsData[indvRoomDataIndex].roomId
    roomsData[indvRoomDataIndex].lines = foundWordandLinesObj
    roomsData[indvRoomDataIndex].words = roomsData[indvRoomDataIndex].words.map(elem => {
      //if most recent (last) entry in lines array matches word
      if (foundWordandLinesObj.at(-1).word === elem.word) {
        elem.found = true;
        elem.foundBy = user;
      };
      return elem
    })
    
    //check if game is completed
    roomsData[indvRoomDataIndex].gameComplete = roomsData[indvRoomDataIndex].words.every(elem => elem.found === true)

    let boardUpdates = {
      lines:roomsData[indvRoomDataIndex].lines,
      wordStatus: roomsData[indvRoomDataIndex].words,
      isGameComplete:roomsData[indvRoomDataIndex].gameComplete
    }
    // roomsData.forEach(elem => console.log(elem.roomId,elem.occupants,elem.words))


    io.to(roomId).emit('found_word_data', boardUpdates); // send found words data back to players in room 
  });


  socket.on("leave_room", (user_id) => {
    
    // console.log(`${user_id} just left the room from ${findRoomContainingUser(user_id)}`)
    roomsData = removeUserFromRooms(user_id)
    roomsData = deleteEmptyRooms()

  });


  socket.on("disconnect", (data) => {
    roomUserwasIn = findRoomContainingUser(user)
    console.log(`disconnection by ${user}`)
    // TODO: handle user leaving mid game
    //message remainding user next user or remove room if both users leave
    if (roomUserwasIn) io.to(roomUserwasIn.roomId).emit('competitor_left_room');
    
    roomsData = removeUserFromRooms(user)
    roomsData = deleteEmptyRooms()
 
  }); 
}); 
  
server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});  