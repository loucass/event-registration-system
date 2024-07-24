document.querySelector("#signUpForm").onsubmit = (e) => {
  e.preventDefault();
  let request = new XMLHttpRequest();
  request.onload = () => {
    if (request.status == 200 && request.readyState == 4) {
      let resD = JSON.parse(request.responseText);
      if (resD.message == "user-exist") {
        message.innerHTML = "user already exist";
      } else if (resD.message == "done") {
        location.assign("/home");
      }
    }
  };
  request.open("POST", "/signUp");
  request.send(new FormData(document.querySelector("#signUpForm")));
};
