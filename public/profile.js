logout.onclick = (e) => {
  document.cookie = "JID=;expires=01 jan 1900 00:00:00 ;path=/";
  document.cookie = "rule=;expires=01 jan 1900 00:00:00 ;path=/";
  location.replace("/");
};
addEvents.onclick = (e) => {
  location.assign("/addEvents");
};
document.querySelectorAll(".delete").forEach((element) => {
  element.addEventListener("click", (e) => {
    let request = new XMLHttpRequest();
    request.onload = () => {
      if (request.status == 200 && request.readyState == 4) {
        let resD = JSON.parse(request.responseText);
        if (resD.message == "done") {
          element.parentElement.parentElement.remove();
        }
      }
    };
    request.open("POST", "/delete");
    let d = new FormData();
    d.append(
      "oidFF",
      element.parentElement.parentElement.getAttribute("data-iodFF")
    );
    request.send(d);
  });
});
searchInProfile.oninput = (e) => {};
