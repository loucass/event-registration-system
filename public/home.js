document.querySelectorAll(".join").forEach((element) => {
  element.addEventListener("click", (e) => {
    let request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status == 200 && request.readyState == 4) {
        let resD = JSON.parse(request.responseText);
        if (resD.message == "done") {
          element.parentElement.innerHTML +=
            "<span class='text-success mx-auto'>joined</span>";
          element.remove();
        }
      }
    };
    request.open("POST", "/join");
    let d = new FormData();
    d.append(
      "oidFF",
      element.parentElement.parentElement.getAttribute("data-iodFF")
    );
    request.send(d);
  });
});
