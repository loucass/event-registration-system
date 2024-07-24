document.forms[0].onsubmit = (e) => {
  e.preventDefault();
  let request = new XMLHttpRequest();
  request.onload = () => {
    if (request.status == 200 && request.readyState == 4) {
      let resD = JSON.parse(request.responseText);
      if (resD.message == "done") {
        location.assign("/home");
      }
    }
  };
  request.open("POST", "/addEvents");
  let d = new FormData(document.forms[0]);
  request.send(d);
};
