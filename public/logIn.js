loginForm.onsubmit = (e) => {
  e.preventDefault();
  let request = new XMLHttpRequest();
  request.onload = () => {
    if (request.status == 200 && request.readyState == 4) {
      let resD = JSON.parse(request.responseText);
      if (resD.message == "done") {
        location.assign("/home");
      } else if (resD.message == "user-not-exist") {
        message.innerText = "no such user";
      }
    }
  };
  request.open("POST", "/logIn");
  let d = new FormData(loginForm);
  request.send(d);
};
