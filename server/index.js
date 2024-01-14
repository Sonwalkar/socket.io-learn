import { Server as serverSocketIo } from "socket.io";
import http from "http";

const server = http.createServer();

const io = new serverSocketIo(server, {
  cors: { origin: "*" }
});

const clients = [];
let chatPerClient = {}; //  { <client_id>to<client_id>: [{ from: "", message: ""}]}

io.on("connection", (socket) => {
  console.log("connection established");

  clients.push({
    clientName: socket.id,
    socketId: socket.id
  });
  console.log("Clients: ", clients);


  socket.on("message", (message, room) => {
    if (room) {
      console.log("in room")
      // add message to chatPerClient object.
      if (chatPerClient[`${socket.id}_to_${room}`]) {
        console.log(`inside ${socket.id}_to_${room}`)
        chatPerClient[`${socket.id}_to_${room}`].push({ from: socket.id, message });
      } else if (chatPerClient[`${room}_to_${socket.id}`]) {
        console.log(`inside ${room}_to_${socket.id}`)
        chatPerClient[`${room}_to_${socket.id}`].push({ from: socket.id, message });
      } else {
        console.log(`inside else`)
        chatPerClient[`${room}_to_${socket.id}`] = [];
        chatPerClient[`${room}_to_${socket.id}`].push({ from: socket.id, message });
      }

      console.log("chatPerClient: ", chatPerClient);

      socket.to(room).emit("message", { socketId: socket.id, message });
    } else {
      console.log("message");
      io.emit("message", { socketId: socket.id, message });
      console.log("message sent");
    }
  });

  socket.on('join-room', (room) => {
    socket.join(room);
  })

  socket.on('activeRoomSwitch', (room, activeRoomId) => {
    console.log("active room switch", room, activeRoomId);
    let chatHistory = "";
    if (chatPerClient[`${room}_to_${activeRoomId}`]) {
      chatHistory = chatPerClient[`${room}_to_${activeRoomId}`];
    } else if (chatPerClient[`${activeRoomId}_to_${room}`]) {
      chatHistory = chatPerClient[`${activeRoomId}_to_${room}`];
    } else {
      chatHistory = [];
    }

    console.log("chatHistory: ", chatHistory);
    socket.emit("activeRoomChatOnSwitch", chatHistory);
  });

  io.emit("clientList", clients);
});

server.listen(5002, () => { console.log("listening on port 8080") })