const updateClientIdInHeader = (socket) => {
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

export { updateClientIdInHeader };