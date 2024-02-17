import { Server as serverSocketIo } from "socket.io";
import http from "http";
import {
  emitMessageOnConnections,
  addClientOnConnections,
  sendOrReceiveMessage,
  joinCustomRoom,
  getChatHistory,
} from "./helper.js";

const server = http.createServer();

const io = new serverSocketIo(server, {
  cors: {
    origin: "http://127.0.0.1:5500", // Replace with your frontend's URL
    methods: ["GET", "POST"], // Allow GET and POST methods
  },
});

const clients = [];
const customRooms = {}; // { <roomName>: [] }
let chatPerClient = {}; //  { <client_id>to<client_id>: [{ from: "", message: ""}]}

io.on("connection", (socket) => {
  console.log("connection established");

  /** An event listener for the "message" event on the socket object.
   * @event message
   * When user sends a message this event is fired,
   * to update chat history and send message to the target client or group.
   */
  socket.on("message", (message, room) => {
    sendOrReceiveMessage(socket, message, room, customRooms, chatPerClient);
  });

  /** An event listener for the "join-room" event on the socket object.
   * @event join-room
   * If user wants to join or create a custom room this event is fired,
   * to let user join or create the custom room.
   */
  socket.on("join-room", (customRoomName) => {
    joinCustomRoom(socket, customRooms, customRoomName, chatPerClient);
  });

  /** An event listener for the "activeRoomSwitch" event on the socket object.
   * @event activeRoomSwitch
   * when user switches from one room(chat room) to another, this event is fired,
   * to get the chat history of the active room(selected room).
   */
  socket.on("activeRoomSwitch", (clientId, activeRoomId) => {
    getChatHistory(socket, clientId, activeRoomId, customRooms, chatPerClient);
  });

  // add client on new connection.
  addClientOnConnections(socket, clients);
  // emit message on new connection.
  emitMessageOnConnections(io, clients, customRooms);
});

server.listen(8080, () => {
  console.log("listening on port 8080");
});
