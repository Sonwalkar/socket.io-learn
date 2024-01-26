/**
 * The function emits a message to all connected clients with the list of clients and custom rooms.
 * @param io - io is the socket.io server object. It is responsible for handling the communication
 * between the server and the clients.
 * @param clients - An array of client objects, representing the connected clients.
 * @param customRooms - The `customRooms` parameter is an array that contains the list of custom rooms
 * that you want to emit to the clients.
 */
const emitMessageOnConnections = (io, clients, customRooms) => {
  io.emit("clientList", clients, customRooms);
}

/**
 * The function adds a client to an array of connections, using the client's socket ID as the client
 * name and socket ID.
 * @param socket - The `socket` parameter is an object that represents a connection between the server
 * and a client. It contains information about the client's connection, such as the client's unique
 * identifier (`socket.id`).
 * @param clients - An array that stores information about the connected clients. Each element in the
 * array represents a client and contains properties such as clientName and socketId.
 */
const addClientOnConnections = (socket, clients) => {
  clients.push({
    clientName: socket.id,
    socketId: socket.id
  });
};

/**
 * The function `addChatHistory` adds a new chat message to the chat history for a specific client.
 * @param chatPerClient - chatPerClient is an object that stores chat history for each client. The keys
 * of the object represent the chat IDs, and the values are arrays that store the chat messages for
 * each chat ID.
 * @param chatId - The chatId parameter is a unique identifier for a specific chat conversation. It is
 * used to distinguish between different chat conversations in the chatPerClient object.
 * @param from - The "from" parameter represents the sender of the chat message. It could be a
 * username, user ID, or any other identifier for the sender.
 * @param message - The `message` parameter represents the content of the chat message that is being
 * added to the chat history.
 */

const addChatHistory = (chatPerClient, chatId, from, message) => {
  if (!chatPerClient[chatId]) {
    chatPerClient[chatId] = [];
  }
  chatPerClient[chatId].push({ from, message });
};

/**
 * The function sends a message to a specific room using a socket connection.
 * @param socket - The `socket` parameter represents the socket connection between the server and the
 * client. It allows for real-time communication between the server and the client.
 * @param room - The `room` parameter is the name or identifier of the room where the message will be
 * sent. It is used to specify the target room for the message.
 * @param message - The `message` parameter is the content of the message that you want to send to the
 * specified room.
 */
const sendMessage = (socket, room, message) => {
  socket.to(room).emit("message", { socketId: socket.id, message, room });
}

/**
 * The function `sendOrReceiveMessage` handles sending and receiving messages in a chat application,
 * distinguishing between group chats and personal chats, and updating the chat history accordingly.
 * @param socket - The `socket` parameter represents the socket connection between the server and the
 * client. It allows you to send and receive messages between the server and the client.
 * @param message - The `message` parameter is the content of the message that is being sent or
 * received. It could be a string or any other data type that represents the message content.
 * @param room - The `room` parameter represents the chat room or target client with whom the message
 * is being exchanged. It can be a custom created group chat or a personal chat between two clients.
 * @param customRooms - The `customRooms` parameter is an object that stores information about custom
 * created rooms (groups). It is used to check if a given room is a custom created room or not. The
 * keys of the object represent the room names, and the values can be any data associated with the room
 * (e.g
 * @param chatPerClient - `chatPerClient` is an object that stores the chat history between clients.
 * The keys of the object are in the format `_to_` or `_to_`,
 * where `sender` and `receiver` are the IDs of the clients involved in the chat. The
 */
const sendOrReceiveMessage = (socket, message, room, customRooms, chatPerClient) => {
  // check if room is custom created (Group) or not.
  if (customRooms[room]) {
    addChatHistory(chatPerClient, room, socket.id, message);
    sendMessage(socket, room, message)
  } else if (room) {
    let roomId = `${socket.id}_to_${room}`;
    if (!chatPerClient[`${socket.id}_to_${room}`]) {
      roomId = `${room}_to_${socket.id}`;
    }
    /* The `addChatHistory` function is used to add a new message to the chat history between clients or group */
    addChatHistory(chatPerClient, roomId, socket.id, message);
    // send message to target client.
    sendMessage(socket, room, message)
  } else {
    console.log("Broadcast message");
    io.emit("message", { socketId: socket.id, message });
  }
};

/**
 * The function `joinCustomRoom` adds a socket to a custom room, initializes an empty array for chat
 * messages per client in that room, and joins the socket to the room.
 * @param socket - The `socket` parameter represents the socket connection of a client. It is used to
 * interact with the client and perform actions such as joining a room.
 * @param customRoomsList - An object that stores the list of custom rooms. Each custom room is
 * represented by a key-value pair, where the key is the custom room name and the value is an array of
 * socket IDs of clients connected to that room.
 * @param customRoomName - The customRoomName parameter is a string that represents the name of the
 * custom room that the socket wants to join.
 * @param chatPerClient - `chatPerClient` is an object that keeps track of the chat history for each
 * client in a specific custom room. The keys of the object are the custom room names, and the values
 * are arrays that store the chat messages for each client in that room.
 */
const joinCustomRoom = (socket, customRoomsList, customRoomName, chatPerClient) => {
  if (!customRoomsList[customRoomName]) {
    customRoomsList[customRoomName] = [];
  }
  customRoomsList[customRoomName].push(socket.id);
  /* its initializing an empty array in the `chatPerClient` object for a specific custom room. */
  chatPerClient[customRoomName] = [];
  socket.join(customRoomName);
}

const getChatHistory = (socket, clientId, activeRoomId, customRooms, chatPerClient) => {

  let chatHistory = [];
  if (customRooms[activeRoomId]) {
    chatHistory = chatPerClient[activeRoomId];
  } else if (chatPerClient[`${clientId}_to_${activeRoomId}`]) {
    chatHistory = chatPerClient[`${clientId}_to_${activeRoomId}`];
  } else if (chatPerClient[`${activeRoomId}_to_${clientId}`]) {
    chatHistory = chatPerClient[`${activeRoomId}_to_${clientId}`];
  }

  socket.emit("activeRoomChatOnSwitch", chatHistory);

}

export { emitMessageOnConnections, addClientOnConnections, sendOrReceiveMessage, joinCustomRoom, getChatHistory }