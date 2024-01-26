const socket = io("ws://localhost:5002");

socket.on('connect', () => {
  const el = document.createElement('li');
  el.innerHTML = `<b>Your Id is: ${socket.id}`;
  document.querySelector("ul").appendChild(el);
})

socket.on('clientList', (clients, customRooms) => {
  console.log("clients: ", clients);
  console.log("customRooms: ", customRooms);

  const inactiveDivs = document.querySelectorAll(".window .userList > div.inactive");
  for (const div of inactiveDivs) {
    div.remove();
    console.log("removed inactive users");
  }

  for (const client of clients) {
    const div = document.createElement("div");
    div.className = "inactive";
    div.innerText = client.clientName;
    div.dataset.value = client.socketId;
    document.querySelector(".window .userList").appendChild(div);
  }
  for (const customRoom in customRooms) {
    if (!customRooms[customRoom].includes(socket.id)) { continue; }
    console.log("🚀 ~ socket.on ~ customRoom:", customRoom)
    const div = document.createElement("div");
    div.className = "inactive";
    div.innerText = customRoom;
    div.dataset.value = customRoom;
    document.querySelector(".window .userList").appendChild(div);
  }
})


socket.on("message", text => {
  console.log("message", text);

  if (document.querySelector(".window .userList .active").dataset.value === text.socketId) {
    if (text.socketId === socket.id) {
      const fromOtherDiv = document.createElement("div");
      fromOtherDiv.className = "fromYou";
      const div = document.createElement("div");
      div.innerText = text.message;
      fromOtherDiv.appendChild(div);
      document.querySelector(".window .chat .activeChat").appendChild(fromOtherDiv);
    } else {
      const fromOtherDiv = document.createElement("div");
      fromOtherDiv.className = "fromOther";
      const div = document.createElement("div");
      div.innerText = text.message;
      fromOtherDiv.appendChild(div);
      document.querySelector(".window .chat .activeChat").appendChild(fromOtherDiv);
    }
  } else if (document.querySelector(".window .userList .active").dataset.value === text.room) {
    if (text.socketId === socket.id) {
      const fromOtherDiv = document.createElement("div");
      fromOtherDiv.className = "fromYou";
      const div = document.createElement("div");
      div.innerText = text.message;
      fromOtherDiv.appendChild(div);
      document.querySelector(".window .chat .activeChat").appendChild(fromOtherDiv);
    } else {
      const fromOtherDiv = document.createElement("div");
      fromOtherDiv.className = "fromOther";
      const div = document.createElement("div");
      div.innerText = text.message;
      fromOtherDiv.appendChild(div);
      document.querySelector(".window .chat .activeChat").appendChild(fromOtherDiv);
    }
  }

})

// it selects client(socketId) to make active and inactive look
document.querySelector(".window .userList").addEventListener("click", (e) => {
  const activeDiv = document.querySelector(".window .userList .active");
  if (activeDiv) {
    activeDiv.classList.remove("active");
    activeDiv.classList.add("inactive");
  }
  e.target.classList.add("active");
  e.target.classList.remove("inactive");

  const otherClientId = document.querySelector(".window .userList .active").dataset.value;

  socket.emit("activeRoomSwitch", socket.id, otherClientId)
})

socket.on("activeRoomChatOnSwitch", chatHistory => {
  console.log("chatHistory: ", chatHistory);

  const activeChatDiv = document.querySelector(".window .chat .activeChat");

  // remove all chat on click on tabs
  const tabsActiveChatDivs = document.querySelectorAll(".window .chat .activeChat > div");
  for (const div of tabsActiveChatDivs) {
    div.remove();
  }

  for (const chat of chatHistory) {
    if (chat.from === socket.id) {
      const fromOtherDiv = document.createElement("div");
      fromOtherDiv.className = "fromYou";
      const div = document.createElement("div");
      div.innerText = chat.message;
      fromOtherDiv.appendChild(div);
      activeChatDiv.appendChild(fromOtherDiv);
    } else {
      const fromOtherDiv = document.createElement("div");
      fromOtherDiv.className = "fromOther";
      const div = document.createElement("div");
      div.innerText = chat.message;
      fromOtherDiv.appendChild(div);
      activeChatDiv.appendChild(fromOtherDiv);
    }
  }
});

document.querySelector("#send").addEventListener("click", () => {
  const text = document.querySelector("#message").value;
  const room = document.querySelector(".window .userList .active").dataset.value;

  // add message to chat window as sender
  const fromOtherDiv = document.createElement("div");
  fromOtherDiv.className = "fromYou";
  const div = document.createElement("div");
  div.innerText = text;
  fromOtherDiv.appendChild(div);
  document.querySelector(".window .chat .activeChat").appendChild(fromOtherDiv);


  console.log("ele", document.querySelector(".window .userList .active"));
  console.log("room: ", room);
  socket.emit("message", text, room);
  document.querySelector("#message").value = "";
})

document.querySelector("#join").addEventListener("click", () => {
  const room = document.querySelector("#room").value;

  const newRoomDiv = document.createElement("div");
  newRoomDiv.className = "inactive";
  newRoomDiv.innerText = room;
  newRoomDiv.dataset.value = room;
  document.querySelector(".window .userList").appendChild(newRoomDiv);

  socket.emit("join-room", room);
});