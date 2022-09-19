const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');


app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// app.get("/", (req,res) => {
//   res.send("<h1>home</h>")
// }) 
// let rooms = {}
let roomsData = [] // elements are an objects with > roomId: str, occupants: set, data: array

function removeUserFromRoom(userId) {
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
     //do nothing if user is already in a room
    let userAlreadyInRoom = roomsData.find(elem => elem.occupants.has(data.userId))
    if (userAlreadyInRoom) return

    let roomToJoin;
    //get rooms with 1 person awaiting a competitor
    const availableRoomIndex = roomsData.findIndex(elem => elem.occupants.size === 1 );
    
    if (!roomsData.length || availableRoomIndex < 0) {    //if no rooms at all or all rooms are full
      let roomId = uuidv4(); // establish unique room Id

      let roomData = {
                      roomId:roomId,
                      occupants:new Set([data.userId]),
                      board: data.board,
                      words: data.words,
                      answers: data.answers,
                      lines: null,
                      gameComplete: false
                    };
      roomsData.push(roomData); // add room to rooms record and add user to room
      roomToJoin = roomId;
      // socket.join(roomToJoin);
    } else {  // room available (1 player awaiting opponent)
      roomsData[availableRoomIndex].occupants.add(data.userId); //  add to user to room record
      roomToJoin = roomsData[availableRoomIndex].roomId;
      console.log(`JOINING ROOM: ${roomsData[availableRoomIndex].roomId}`)
    }
    
    socket.join(roomToJoin); // join user to room   
    // roomsData.forEach(elem => console.log(elem.roomId,elem.occupants,elem.words))
    let gameData =  roomsData.find(elem => elem.roomId === roomToJoin)
    console.log(gameData)
    io.to(roomToJoin).emit('join_room', // send the board back to the client 
      {...gameData, occupants:[...gameData.occupants] } // serialize occupants as Sets cannot be sent
    ); 

  }); 

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






  socket.on("disconnect", (data) => {
    console.log(`disconnection by ${user}`)
    
    roomsData = removeUserFromRoom(user)
    roomsData = deleteEmptyRooms()

   

    roomsData.forEach(elem => console.log(elem.occupants)) 
    // message for next user or remove room if both users leave

  }); 
}); 
 

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});