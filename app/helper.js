const showClientIdInHeader = (socket) => {
  /* The code is selecting all the `<li>` elements that are direct children of the `<ul>` element with
  the class "header". It then iterates over each selected element and removes it from the DOM. */
  const existingElement = document.querySelectorAll(".header ul > li");
  for (const el of existingElement) {
    el.remove();
  }

  const el = document.createElement("li");
  el.innerHTML = `<b>Your Id is: ${socket.id}`;
  document.querySelector("ul").appendChild(el);
};

const removeAllUsersAndGroupFromUI = () => {
  /* The code is selecting all the inactive user div elements within the ".window .userList" container
  and removing them from the DOM. */
  const inactiveDivs = document.querySelectorAll(
    ".window .userList > div.inactive"
  );
  for (const div of inactiveDivs) {
    div.remove();
  }

  const activeUserTab = document.querySelector(
    ".window .userList > div.active"
  );
  let activeUserTabDetails = "";

  if (activeUserTab) {
    activeUserTab.remove();
    activeUserTabDetails = {
      name: activeUserTab.innerText,
      value: activeUserTab.dataset.value,
    };
  }
  return activeUserTabDetails;
};

const addUserOrGroupTab = (userName, userId, tabStatus) => {
  const div = document.createElement("div");
  div.className = tabStatus;
  div.innerText = userName;
  div.dataset.value = userId;
  document.querySelector(".window .userList").appendChild(div);
};

const showUsersAndGroup = (clients, customRooms, activeUserTabDetails) => {
  // Show all the users and make them inactive except activeUserTabDetails.
  for (const client of clients) {
    let tabStatus = "inactive";

    if (activeUserTabDetails.value === client.socketId) {
      tabStatus = "active";
    }

    addUserOrGroupTab(client.clientName, client.socketId, tabStatus);
  }

  /**
   * Show all the groups and make them inactive except activeUserTabDetails.
   * Also checks if the current user is part of the group or not.
   */
  for (const customRoom in customRooms) {
    if (!customRooms[customRoom].includes(socket.id)) {
      continue;
    }
    let tabStatus = "inactive";
    if (activeUserTabDetails.value === customRoom) {
      tabStatus = "active";
    }
    addUserOrGroupTab(customRoom, customRoom, tabStatus);
  }
};

export {
  showClientIdInHeader,
  removeAllUsersAndGroupFromUI,
  showUsersAndGroup,
};
